from fastapi import APIRouter
from schemas.user_input import RecommendRequestPayload
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
from firebase_client import log_recommendation
import logging
import numpy as np

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/recommend")
async def recommend(req: RecommendRequestPayload):
    """
    Main Execution pipeline sequentially orchestrating:
    1. Validation: Goal prediction via ML model.
    2. Constraints: Pre-filtering invalid budget/dietary targets.
    3. Computation: Exact Calorie / Macro bounds via Mifflin.
    4. Representation: NLP extraction mapping text to exact matrices.
    5. Scoring: Metric evaluation against User Limits.
    6. Features & Ranking: OHE Vector creation & Cosine similarities.
    7. Multi-Fusion: Merging Cosine ranks with Scorer constraints via weights determining ultimate Winner.
    """
    try:
        user = req.user_profile
        all_plans = req.filtered_plans
        
        if not all_plans:
            return {"ranked": []}
            
        # 1. Goal ML Validator
        bmi = user.get("weight", 70) / ((user.get("height", 170) / 100) ** 2)
        ml_goal = predictor.predict_goal(bmi, user.get("activity_level", "Moderate"))
        
        # 2. Hard Filters
        valid_plans = filter_plans(
            plans=all_plans,
            dietary_preference=user.get("diet_pref", "veg"),
            user_budget=user.get("budget_tier", "medium"),
            ml_goal=ml_goal
        )
        
        if not valid_plans:
            logger.info("Hard filters dropped all available plans.")
            return {"ranked": [], "message": "No plans match explicit bounds."}
            
        # 3. Computing EXACT TDEE / Targets
        user_targets = compute_calorie_target(
            age=user.get("age", 25),
            weight_kg=user.get("weight", 70),
            height_cm=user.get("height", 170),
            gender=user.get("sex", "M"),
            activity_level=user.get("activity_level", "Moderate"),
            goal=ml_goal
        )
        
        # Build Query Vector
        user_vec = build_user_vector(
            goal=ml_goal,
            activity_level=user.get("activity_level", "Moderate"),
            budget=user.get("budget_tier", "medium"),
            calorie_target=user_targets["calorie_target"]
        )
        
        plan_vectors = []
        plan_ids = []
        enriched_plans = {}
        
        # Pre-process all candidates extracting textual contexts into Arrays
        for plan in valid_plans:
            pid = plan.get("plan_id", str(id(plan)))
            
            # 4. NLP Text -> Math Macros extraction
            plan_macros_full = extract_plan_macros(plan)
            plan_macros = plan_macros_full["plan_total"]
            
            # 5. Build Candidate Arrays
            p_vec = build_plan_vector(plan, plan_macros)
            
            # 6. Fit generic scaler preventing missing dependencies if Offline generator wasn't utilized natively
            vector_scaler.fit([[user.get("budget_score", 2), user_targets["calorie_target"]], 
                             [user.get("budget_score", 2), plan_macros["calories"]]])
                             
            plan_vectors.append(p_vec)
            plan_ids.append(pid)
            
            # Store extracted data for Fusion stage
            enriched_plans[pid] = {
                "base_plan": plan,
                "macro_summary": plan_macros_full["analysis"],
                "total_macros": plan_macros,
                "nutrition_score": compute_nutrition_compatibility(plan_macros, user_targets, ml_goal),
                "budget_score": compute_budget_compatibility(user.get("budget_tier", "medium"), plan.get("budgetCategory", "medium"))
            }
            
        # 7. Rank via Cosine Distances natively bridging feature vectors
        similarity_rankings = rank_plans(user_vec, plan_vectors, plan_ids)
        
        final_results = []
        
        for sim_result in similarity_rankings:
            pid = sim_result["plan_id"]
            sim_score = sim_result["similarity_score"]
            
            enriched = enriched_plans[pid]
            nut_score = enriched["nutrition_score"]
            bud_score = enriched["budget_score"]
            
            # Multi-Dimensional Weights Fusion
            cal_score = 1.0 - min(abs(enriched["total_macros"]["calories"] - user_targets["calorie_target"]) / user_targets["calorie_target"], 1.0)
            
            final_composite_score = (
                (sim_score * RANKING_WEIGHTS["similarity"]) +
                (nut_score * RANKING_WEIGHTS["nutrition"]) +
                (bud_score * RANKING_WEIGHTS["budget"]) +
                (cal_score * RANKING_WEIGHTS["calorie"])
            )
            
            tags = []
            if nut_score > 0.8: tags.append("Excellent Macros")
            if enriched["macro_summary"]["is_high_protein"]: tags.append("High Protein")
            if enriched["macro_summary"]["is_calorie_deficit_friendly"]: tags.append("Deficit Friendly")
            if sim_score > 0.9: tags.append("Perfect Match")
            
            final_results.append({
                "plan_id": pid,
                "score": round(final_composite_score, 3),
                "components": {
                    "similarity": round(sim_score, 3),
                    "nutrition": round(nut_score, 3),
                    "budget": round(bud_score, 3),
                    "calorie": round(cal_score, 3)
                },
                "tags": tags,
                "macro_summary": {
                    "plan_avg_calories": enriched["total_macros"]["calories"],
                    "protein_ratio": round(enriched["macro_summary"]["protein_percentage"]/100, 2),
                    "carb_ratio": round(enriched["macro_summary"]["carb_percentage"]/100, 2),
                    "fat_ratio": round(enriched["macro_summary"]["fat_percentage"]/100, 2)
                }
            })
            
        final_results.sort(key=lambda x: x["score"], reverse=True)
        top_5 = final_results[:5]
        
        # Async-safe logging
        try:
            log_recommendation(req.user_profile, top_5)
        except Exception as e:
            logger.warning(f"Log exception suppressed: {str(e)}")
            
        return {"ranked": top_5}
        
    except Exception as e:
        logger.error(f"Critical /recommend error: {str(e)}", exc_info=True)
        return {"ranked": [], "error": "Internal computation failure."}
