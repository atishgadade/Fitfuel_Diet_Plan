from typing import Dict, Any

from nlp.ingredient_parser import parse_ingredients
from nlp.nutrition_api_client import get_nutrition

def extract_plan_macros(plan: Dict[str, Any]) -> Dict[str, Any]:
    """
    Coordinates meal-level array parsers generating unified macro outputs summarizing Plan Nutrition.
    Flags high-protein and deficit-friendly statuses for context integrations.
    """
    meals_dict = plan.get('meals', {})
    
    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0
    
    per_meal_summary = []
    
    for meal_key, meal_data in meals_dict.items():
        if not isinstance(meal_data, dict):
            continue
            
        meal_name = meal_data.get('name', meal_key)
        parsed_items = parse_ingredients(meal_data)
        
        m_cal = 0.0
        m_pro = 0.0
        m_carb = 0.0
        m_fat = 0.0
        
        ingredient_breakdown = []
        
        for item in parsed_items:
            ing = item['ingredient']
            srv = item['estimated_serving']
            
            nut = get_nutrition(ing, srv)
            m_cal += nut['calories']
            m_pro += nut['protein_g']
            m_carb += nut['carbs_g']
            m_fat += nut['fat_g']
            
            ingredient_breakdown.append({
                "ingredient": ing,
                "serving": srv,
                "nutrition": nut
            })
            
        # Meal totals
        per_meal_summary.append({
            "meal_name": meal_name,
            "calories": round(m_cal, 2),
            "protein_g": round(m_pro, 2),
            "carbs_g": round(m_carb, 2),
            "fat_g": round(m_fat, 2),
            "ingredients_breakdown": ingredient_breakdown
        })
        
        # Plan totals
        total_calories += m_cal
        total_protein += m_pro
        total_carbs += m_carb
        total_fat += m_fat
        
    # Analysis Metrics
    target_cals = max(total_calories, 1.0) # prevent zero div
    pro_cals = total_protein * 4
    carb_cals = total_carbs * 4
    fat_cals = total_fat * 9
    
    analysis = {
        "protein_percentage": round((pro_cals / target_cals) * 100, 2),
        "carb_percentage": round((carb_cals / target_cals) * 100, 2),
        "fat_percentage": round((fat_cals / target_cals) * 100, 2),
        "is_high_protein": (pro_cals / target_cals) > 0.30,
        "is_calorie_deficit_friendly": total_calories < 1800.0
    }
    
    return {
        "plan_total": {
            "calories": round(total_calories, 2),
            "protein_g": round(total_protein, 2),
            "carbs_g": round(total_carbs, 2),
            "fat_g": round(total_fat, 2)
        },
        "per_meal": per_meal_summary,
        "analysis": analysis
    }
