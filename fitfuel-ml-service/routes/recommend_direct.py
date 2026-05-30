"""
Direct recommendation endpoint for the React frontend.
Accepts flat user fields, loads plans from Firestore, runs the ML pipeline,
and returns results in the shape the React diet_plan_page.jsx expects.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from models.goal_predictor import predictor
from models.calorie_engine import compute_calorie_target
from preprocessing.constraint_filter import filter_plans
from preprocessing.scaler import vector_scaler
from preprocessing.feature_engineer import build_user_vector, build_plan_vector
from nlp.macro_extractor import extract_plan_macros
from models.nutrition_scorer import compute_nutrition_compatibility
from models.budget_scorer import compute_budget_compatibility
from models.plan_ranker import rank_plans
from config import RANKING_WEIGHTS
from firebase_client import get_plans, log_recommendation
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class DirectRecommendRequest(BaseModel):
    age: int = 25
    gender: str = "male"
    weight_kg: float = 70
    height_cm: float = 170
    activity_level: str = "Sedentary"
    fitness_goal: str = "Weight Loss"
    dietary_preference: str = "veg"
    budget: str = "low"


@router.post("/recommend")
async def recommend_direct(req: DirectRecommendRequest):
    """
    Frontend-facing endpoint. Accepts flat user fields directly,
    loads meal plans from Firestore, and returns ranked recommendations.
    """
    try:
        # Map frontend field names to ML pipeline field names
        gender_map = {"male": "M", "female": "F"}
        sex = gender_map.get(req.gender.lower(), "M")

        # 1. Compute BMI and predict goal
        bmi = req.weight_kg / ((req.height_cm / 100) ** 2)
        bmi_category = "Underweight" if bmi < 18.5 else "Normal" if bmi < 25 else "Overweight" if bmi < 30 else "Obese"
        ml_goal = predictor.predict_goal(bmi, req.activity_level)

        # Goal validation
        try:
            goal_validation = predictor.validate_goal(req.fitness_goal, bmi, req.activity_level)
        except Exception as e:
            logger.error(f"Goal validation failed: {e}")
            goal_validation = {
                "user_selected": req.fitness_goal,
                "ml_predicted": req.fitness_goal,
                "confidence": 0,
                "match": True,
                "suggestion": "Goal validation unavailable."
            }

        # Use the USER's selected goal for the pipeline (respect their choice)
        active_goal = req.fitness_goal

        # 2. Compute calorie targets
        user_targets = compute_calorie_target(
            age=req.age,
            weight_kg=req.weight_kg,
            height_cm=req.height_cm,
            gender=sex,
            activity_level=req.activity_level,
            goal=active_goal
        )

        # 3. Load plans from Firestore
        collection = "vegan_plans" if req.dietary_preference == "vegan" else "veg_plans"
        try:
            all_plans = get_plans(collection)
        except Exception as e:
            logger.error(f"Failed to load plans from Firestore: {str(e)}")
            all_plans = []

        if not all_plans:
            return {
                "user_profile": {
                    "bmi": round(bmi, 1),
                    "bmi_category": bmi_category,
                    "calorie_target": round(user_targets["calorie_target"]),
                    "macro_targets": {
                        "protein_g": round(user_targets["macro_split"]["protein_g"]),
                        "carbs_g": round(user_targets["macro_split"]["carbs_g"]),
                        "fat_g": round(user_targets["macro_split"]["fat_g"])
                    }
                },
                "goal_validation": {
                    "match": goal_validation.get("match", True),
                    "predicted": goal_validation.get("ml_predicted", req.fitness_goal),
                    "user_selected": req.fitness_goal,
                    "confidence": goal_validation.get("confidence", 0.85)
                },
                "recommended_plans": [],
                "message": "No meal plans found in the database. Please ensure plans are loaded in Firestore."
            }

        # 4. Filter plans by budget and dietary preference
        valid_plans = filter_plans(
            plans=all_plans,
            dietary_preference=req.dietary_preference,
            user_budget=req.budget,
            ml_goal=active_goal
        )

        if not valid_plans:
            # If hard filters eliminate everything, relax and use all plans
            logger.info("Hard filters dropped all plans. Using unfiltered set.")
            valid_plans = all_plans

        # 5. Build user vector
        user_vec = build_user_vector(
            goal=active_goal,
            activity_level=req.activity_level,
            budget=req.budget,
            calorie_target=user_targets["calorie_target"]
        )

        plan_vectors = []
        plan_ids = []
        enriched_plans = {}

        for plan in valid_plans:
            pid = plan.get("planId", plan.get("plan_id", str(id(plan))))

            try:
                # 6. NLP macro extraction
                plan_macros_full = extract_plan_macros(plan)
                plan_macros = plan_macros_full["plan_total"]

                # 7. Build plan vector
                p_vec = build_plan_vector(plan, plan_macros)

                # Fit scaler
                vector_scaler.fit([
                    [2, user_targets["calorie_target"]],
                    [2, plan_macros["calories"]]
                ])

                plan_vectors.append(p_vec)
                plan_ids.append(pid)

                # Store enriched data
                enriched_plans[pid] = {
                    "base_plan": plan,
                    "macro_summary": plan_macros_full["analysis"],
                    "total_macros": plan_macros,
                    "per_meal": plan_macros_full.get("per_meal", {}),
                    "nutrition_score": compute_nutrition_compatibility(plan_macros, user_targets, active_goal),
                    "budget_score": compute_budget_compatibility(req.budget, plan.get("budgetCategory", plan.get("budget", "medium")))
                }
            except Exception as e:
                logger.warning(f"Error processing plan {pid}: {str(e)}")
                continue

        if not plan_vectors:
            return {
                "user_profile": {
                    "bmi": round(bmi, 1),
                    "bmi_category": bmi_category,
                    "calorie_target": round(user_targets["calorie_target"]),
                    "macro_targets": {
                        "protein_g": round(user_targets["macro_split"]["protein_g"]),
                        "carbs_g": round(user_targets["macro_split"]["carbs_g"]),
                        "fat_g": round(user_targets["macro_split"]["fat_g"])
                    }
                },
                "goal_validation": {
                    "match": goal_validation["is_aligned"],
                    "predicted": goal_validation["predicted_goal"],
                    "user_selected": req.fitness_goal,
                    "confidence": 0.85
                },
                "recommended_plans": [],
                "message": "Could not process any plans. Please try again."
            }

        # 8. Rank via cosine similarity
        similarity_rankings = rank_plans(user_vec, plan_vectors, plan_ids)

        # 9. Build final response
        final_results = []
        for rank_idx, sim_result in enumerate(similarity_rankings):
            pid = sim_result["plan_id"]
            sim_score = sim_result["similarity_score"]
            enriched = enriched_plans[pid]

            nut_score = enriched["nutrition_score"]
            bud_score = enriched["budget_score"]

            # Calorie match score
            cal_diff = abs(enriched["total_macros"]["calories"] - user_targets["calorie_target"])
            cal_score = 1.0 - min(cal_diff / max(user_targets["calorie_target"], 1), 1.0)

            # Final composite
            final_score = (
                (sim_score * RANKING_WEIGHTS["similarity"]) +
                (nut_score * RANKING_WEIGHTS["nutrition"]) +
                (bud_score * RANKING_WEIGHTS["budget"]) +
                (cal_score * RANKING_WEIGHTS["calorie"])
            )

            base_plan = enriched["base_plan"]

            # Build meal details for the expandable card
            meals = {}
            plan_meals_dict = base_plan.get("meals", base_plan)
            for meal_type in ["breakfast", "lunch", "snack", "dinner"]:
                meal_data = plan_meals_dict.get(meal_type, {})
                if meal_data and isinstance(meal_data, dict):
                    meals[meal_type] = {
                        "name": meal_data.get("meal", meal_data.get("name", meal_type.capitalize())),
                        "ingredients": meal_data.get("ingredients", []),
                        "recipe": meal_data.get("recipe", meal_data.get("preparation", []))
                    }
                elif isinstance(meal_data, str):
                    meals[meal_type] = {
                        "name": meal_data,
                        "ingredients": [],
                        "recipe": []
                    }

            # Per-meal nutrition
            per_meal_nutrition = {}
            # Handle both list (new implementation) and dict (legacy) formats
            pm_data = enriched.get("per_meal", [])
            if isinstance(pm_data, list):
                # Map by index since we append in order (breakfast, lunch, snack, dinner)
                ordered_keys = ["breakfast", "lunch", "snack", "dinner"]
                for i, pm in enumerate(pm_data):
                    if i < len(ordered_keys):
                        per_meal_nutrition[ordered_keys[i]] = {
                            "calories": round(pm.get("calories", 0)),
                            "protein_g": round(pm.get("protein_g", 0)),
                            "carbs_g": round(pm.get("carbs_g", 0)),
                            "fat_g": round(pm.get("fat_g", 0))
                        }
            else:
                for meal_type in ["breakfast", "lunch", "snack", "dinner"]:
                    pm = pm_data.get(meal_type, {})
                    if pm:
                        per_meal_nutrition[meal_type] = {
                            "calories": round(pm.get("calories", 0)),
                            "protein_g": round(pm.get("protein_g", 0)),
                            "carbs_g": round(pm.get("carbs_g", 0)),
                            "fat_g": round(pm.get("fat_g", 0))
                        }

            final_results.append({
                "plan_id": pid,
                "plan_name": base_plan.get("planName", base_plan.get("plan_name", f"Plan {rank_idx + 1}")),
                "final_score": round(final_score, 3),
                "score_breakdown": {
                    "similarity": round(sim_score, 3),
                    "nutrition_compatibility": round(nut_score, 3),
                    "budget_compatibility": round(bud_score, 3),
                    "calorie_match": round(cal_score, 3)
                },
                "meals": meals,
                "nutrition_info": {
                    "total_calories": round(enriched["total_macros"]["calories"]),
                    "total_protein_g": round(enriched["total_macros"].get("protein_g", 0)),
                    "total_carbs_g": round(enriched["total_macros"].get("carbs_g", 0)),
                    "total_fat_g": round(enriched["total_macros"].get("fat_g", 0)),
                    "per_meal": per_meal_nutrition
                }
            })

        # Sort by final score descending
        final_results.sort(key=lambda x: x["final_score"], reverse=True)
        top_plans = final_results[:5]

        # Log recommendation
        try:
            log_recommendation(req.dict(), top_plans)
        except Exception as e:
            logger.warning(f"Log suppressed: {str(e)}")

        return {
            "user_profile": {
                "bmi": round(bmi, 1),
                "bmi_category": bmi_category,
                "calorie_target": round(user_targets["calorie_target"]),
                "macro_targets": {
                    "protein_g": round(user_targets["macro_split"]["protein_g"]),
                    "carbs_g": round(user_targets["macro_split"]["carbs_g"]),
                    "fat_g": round(user_targets["macro_split"]["fat_g"])
                }
            },
            "goal_validation": {
                "match": goal_validation.get("match", True),
                "predicted": goal_validation.get("ml_predicted", req.fitness_goal),
                "user_selected": req.fitness_goal,
                "confidence": goal_validation.get("confidence", 0.85)
            },
            "recommended_plans": top_plans
        }

    except Exception as e:
        logger.error(f"Critical /recommend error: {str(e)}", exc_info=True)
        return {
            "user_profile": None,
            "goal_validation": None,
            "recommended_plans": [],
            "error": f"Internal computation failure: {str(e)}"
        }
