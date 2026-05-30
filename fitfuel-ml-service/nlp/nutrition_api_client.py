import requests
import logging
from config import CALORIENINJAS_API_KEY
from firebase_client import get_cached_nutrition, cache_nutrition
from typing import Dict

logger = logging.getLogger(__name__)

# Fallback dictionary for 100+ Indian & Global common vegan/vegetarian ingredients
# Values are approx per 100g
FALLBACK_NUTRITION = {
    # Grains & Breads
    "rice": {"calories": 130, "protein_g": 2.7, "carbs_g": 28, "fat_g": 0.3, "fiber_g": 0.4},
    "brown rice": {"calories": 111, "protein_g": 2.6, "carbs_g": 23, "fat_g": 0.9, "fiber_g": 1.8},
    "roti": {"calories": 297, "protein_g": 9.0, "carbs_g": 46, "fat_g": 8.0, "fiber_g": 9.0},
    "chapati": {"calories": 297, "protein_g": 9.0, "carbs_g": 46, "fat_g": 8.0, "fiber_g": 9.0},
    "paratha": {"calories": 326, "protein_g": 8.0, "carbs_g": 44, "fat_g": 13.0, "fiber_g": 4.0},
    "naan": {"calories": 290, "protein_g": 9.6, "carbs_g": 45, "fat_g": 7.5, "fiber_g": 2.2},
    "oats": {"calories": 389, "protein_g": 16.9, "carbs_g": 66, "fat_g": 6.9, "fiber_g": 10.6},
    "quinoa": {"calories": 120, "protein_g": 4.4, "carbs_g": 21, "fat_g": 1.9, "fiber_g": 2.8},
    "brown bread": {"calories": 250, "protein_g": 10.0, "carbs_g": 43, "fat_g": 3.4, "fiber_g": 6.0},
    "whole wheat bread": {"calories": 247, "protein_g": 13.0, "carbs_g": 41, "fat_g": 3.4, "fiber_g": 7.0},
    "multigrain bread": {"calories": 265, "protein_g": 13.4, "carbs_g": 42, "fat_g": 4.2, "fiber_g": 7.4},
    "pasta": {"calories": 131, "protein_g": 5.0, "carbs_g": 25, "fat_g": 1.1, "fiber_g": 1.2},
    "noodles": {"calories": 138, "protein_g": 4.5, "carbs_g": 25, "fat_g": 2.1, "fiber_g": 1.2},
    "vermicelli": {"calories": 358, "protein_g": 12.0, "carbs_g": 73, "fat_g": 1.5, "fiber_g": 2.0},
    "semolina": {"calories": 360, "protein_g": 12.7, "carbs_g": 73, "fat_g": 1.1, "fiber_g": 3.9},
    "besan": {"calories": 387, "protein_g": 22.0, "carbs_g": 58, "fat_g": 6.7, "fiber_g": 11.0},
    "maida": {"calories": 364, "protein_g": 10.3, "carbs_g": 76, "fat_g": 1.0, "fiber_g": 2.7},
    "atta": {"calories": 340, "protein_g": 12.0, "carbs_g": 72, "fat_g": 1.7, "fiber_g": 11.0},
    "poha flakes": {"calories": 346, "protein_g": 6.6, "carbs_g": 77, "fat_g": 1.2, "fiber_g": 1.0},
    "muesli": {"calories": 371, "protein_g": 10.0, "carbs_g": 66, "fat_g": 7.0, "fiber_g": 8.5},
    "granola": {"calories": 471, "protein_g": 10.0, "carbs_g": 64, "fat_g": 20.0, "fiber_g": 5.0},
    "protein bar": {"calories": 414, "protein_g": 30.0, "carbs_g": 40, "fat_g": 15.0, "fiber_g": 5.0},
    "idli": {"calories": 145, "protein_g": 4.0, "carbs_g": 30, "fat_g": 0.5, "fiber_g": 1.0},
    "dosa": {"calories": 167, "protein_g": 4.0, "carbs_g": 29, "fat_g": 3.7, "fiber_g": 0.9},
    "upma": {"calories": 160, "protein_g": 3.5, "carbs_g": 25, "fat_g": 5.0, "fiber_g": 1.5},
    "poha": {"calories": 180, "protein_g": 3.0, "carbs_g": 35, "fat_g": 2.5, "fiber_g": 1.5},
    "khichdi": {"calories": 120, "protein_g": 4.0, "carbs_g": 20, "fat_g": 2.5, "fiber_g": 2.0},
    "pongal": {"calories": 150, "protein_g": 4.5, "carbs_g": 22, "fat_g": 5.0, "fiber_g": 1.5},
    "uttapam": {"calories": 170, "protein_g": 4.0, "carbs_g": 30, "fat_g": 4.0, "fiber_g": 1.5},
    "vada": {"calories": 280, "protein_g": 6.0, "carbs_g": 35, "fat_g": 12.0, "fiber_g": 2.0},
    
    # Lentils, Legumes, Soy
    "dal": {"calories": 116, "protein_g": 9.0, "carbs_g": 20, "fat_g": 0.4, "fiber_g": 8.0},
    "toor dal": {"calories": 343, "protein_g": 22.0, "carbs_g": 63, "fat_g": 1.5, "fiber_g": 15.0},
    "moong dal": {"calories": 348, "protein_g": 24.0, "carbs_g": 60, "fat_g": 1.2, "fiber_g": 16.0},
    "masoor dal": {"calories": 352, "protein_g": 25.0, "carbs_g": 60, "fat_g": 1.1, "fiber_g": 11.0},
    "chana dal": {"calories": 360, "protein_g": 22.0, "carbs_g": 60, "fat_g": 5.0, "fiber_g": 11.0},
    "rajma": {"calories": 127, "protein_g": 8.7, "carbs_g": 23, "fat_g": 0.5, "fiber_g": 6.4},
    "chole": {"calories": 164, "protein_g": 8.9, "carbs_g": 27, "fat_g": 2.6, "fiber_g": 7.6},
    "chana": {"calories": 164, "protein_g": 8.9, "carbs_g": 27, "fat_g": 2.6, "fiber_g": 7.6},
    "kidney beans": {"calories": 127, "protein_g": 8.7, "carbs_g": 23, "fat_g": 0.5, "fiber_g": 6.4},
    "chickpeas": {"calories": 164, "protein_g": 8.9, "carbs_g": 27, "fat_g": 2.6, "fiber_g": 7.6},
    "lentils": {"calories": 116, "protein_g": 9.0, "carbs_g": 20, "fat_g": 0.4, "fiber_g": 8.0},
    "paneer": {"calories": 265, "protein_g": 18.0, "carbs_g": 3.0, "fat_g": 20.0, "fiber_g": 0.0},
    "tofu": {"calories": 76, "protein_g": 8.0, "carbs_g": 1.9, "fat_g": 4.8, "fiber_g": 0.3},
    "soy milk": {"calories": 33, "protein_g": 3.3, "carbs_g": 1.8, "fat_g": 1.5, "fiber_g": 0.6},
    "soybean": {"calories": 173, "protein_g": 16.6, "carbs_g": 9.9, "fat_g": 9.0, "fiber_g": 6.0},
    "edamame": {"calories": 121, "protein_g": 11.9, "carbs_g": 8.9, "fat_g": 5.2, "fiber_g": 5.2},
    "tempeh": {"calories": 192, "protein_g": 18.5, "carbs_g": 9.4, "fat_g": 10.8, "fiber_g": 0.0},
    "seitan": {"calories": 370, "protein_g": 75.0, "carbs_g": 14.0, "fat_g": 1.9, "fiber_g": 0.6},
    "nutritional yeast": {"calories": 400, "protein_g": 50.0, "carbs_g": 33.0, "fat_g": 5.0, "fiber_g": 20.0},
    "spirulina": {"calories": 290, "protein_g": 57.5, "carbs_g": 23.9, "fat_g": 7.7, "fiber_g": 3.6},
    "whey protein": {"calories": 370, "protein_g": 80.0, "carbs_g": 5.0, "fat_g": 3.0, "fiber_g": 0.0},
    "hummus": {"calories": 166, "protein_g": 7.9, "carbs_g": 14.3, "fat_g": 9.6, "fiber_g": 6.0},
    "tahini": {"calories": 595, "protein_g": 17.0, "carbs_g": 21.2, "fat_g": 53.8, "fiber_g": 9.3},
    "moong sprouts": {"calories": 30, "protein_g": 3.0, "carbs_g": 6.0, "fat_g": 0.2, "fiber_g": 1.8},
    "chana sprouts": {"calories": 164, "protein_g": 9.0, "carbs_g": 27.0, "fat_g": 2.6, "fiber_g": 7.6},

    # Nuts & Seeds
    "peanut butter": {"calories": 588, "protein_g": 25.0, "carbs_g": 20.0, "fat_g": 50.0, "fiber_g": 6.0},
    "almonds": {"calories": 579, "protein_g": 21.1, "carbs_g": 21.6, "fat_g": 49.9, "fiber_g": 12.5},
    "walnuts": {"calories": 654, "protein_g": 15.2, "carbs_g": 13.7, "fat_g": 65.2, "fiber_g": 6.7},
    "cashews": {"calories": 553, "protein_g": 18.2, "carbs_g": 30.1, "fat_g": 43.8, "fiber_g": 3.3},
    "peanuts": {"calories": 567, "protein_g": 25.8, "carbs_g": 16.1, "fat_g": 49.2, "fiber_g": 8.5},
    "flaxseeds": {"calories": 534, "protein_g": 18.3, "carbs_g": 28.8, "fat_g": 42.1, "fiber_g": 27.3},
    "chia seeds": {"calories": 486, "protein_g": 16.5, "carbs_g": 42.1, "fat_g": 30.7, "fiber_g": 34.4},
    "sunflower seeds": {"calories": 584, "protein_g": 20.7, "carbs_g": 20.0, "fat_g": 51.4, "fiber_g": 8.6},
    "pumpkin seeds": {"calories": 559, "protein_g": 30.2, "carbs_g": 10.7, "fat_g": 49.0, "fiber_g": 6.0},

    # Dairy, Fats, Sugars & Misc
    "milk": {"calories": 42, "protein_g": 3.4, "carbs_g": 5.0, "fat_g": 1.0, "fiber_g": 0.0},
    "almond milk": {"calories": 15, "protein_g": 0.4, "carbs_g": 0.3, "fat_g": 1.2, "fiber_g": 0.2},
    "curd": {"calories": 98, "protein_g": 11.0, "carbs_g": 3.4, "fat_g": 4.3, "fiber_g": 0.0},
    "dahi": {"calories": 98, "protein_g": 11.0, "carbs_g": 3.4, "fat_g": 4.3, "fiber_g": 0.0},
    "yogurt": {"calories": 59, "protein_g": 10.0, "carbs_g": 3.6, "fat_g": 0.4, "fiber_g": 0.0},
    "raita": {"calories": 45, "protein_g": 2.0, "carbs_g": 5.0, "fat_g": 2.0, "fiber_g": 0.5},
    "ghee": {"calories": 900, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 100.0, "fiber_g": 0.0},
    "olive oil": {"calories": 884, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 100.0, "fiber_g": 0.0},
    "coconut oil": {"calories": 862, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 100.0, "fiber_g": 0.0},
    "butter": {"calories": 717, "protein_g": 0.8, "carbs_g": 0.0, "fat_g": 81.0, "fiber_g": 0.0},
    "coconut": {"calories": 354, "protein_g": 3.3, "carbs_g": 15.2, "fat_g": 33.4, "fiber_g": 9.0},
    "jaggery": {"calories": 383, "protein_g": 0.4, "carbs_g": 98.0, "fat_g": 0.1, "fiber_g": 0.0},
    "honey": {"calories": 304, "protein_g": 0.3, "carbs_g": 82.4, "fat_g": 0.0, "fiber_g": 0.2},
    "soy sauce": {"calories": 53, "protein_g": 8.0, "carbs_g": 4.9, "fat_g": 0.1, "fiber_g": 0.0},
    "vinegar": {"calories": 18, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0, "fiber_g": 0.0},

    # Fruits & Vegetables
    "banana": {"calories": 89, "protein_g": 1.1, "carbs_g": 22.8, "fat_g": 0.3, "fiber_g": 2.6},
    "apple": {"calories": 52, "protein_g": 0.3, "carbs_g": 13.8, "fat_g": 0.2, "fiber_g": 2.4},
    "mango": {"calories": 60, "protein_g": 0.8, "carbs_g": 15.0, "fat_g": 0.4, "fiber_g": 1.6},
    "dates": {"calories": 282, "protein_g": 2.5, "carbs_g": 75.0, "fat_g": 0.4, "fiber_g": 8.0},
    "raisins": {"calories": 299, "protein_g": 3.1, "carbs_g": 79.1, "fat_g": 0.5, "fiber_g": 3.7},
    "lemon": {"calories": 29, "protein_g": 1.1, "carbs_g": 9.3, "fat_g": 0.3, "fiber_g": 2.8},
    "orange": {"calories": 47, "protein_g": 0.9, "carbs_g": 11.8, "fat_g": 0.1, "fiber_g": 2.4},
    "watermelon": {"calories": 30, "protein_g": 0.6, "carbs_g": 7.6, "fat_g": 0.2, "fiber_g": 0.4},
    "papaya": {"calories": 43, "protein_g": 0.5, "carbs_g": 10.8, "fat_g": 0.3, "fiber_g": 1.7},
    "guava": {"calories": 68, "protein_g": 2.6, "carbs_g": 14.3, "fat_g": 1.0, "fiber_g": 5.4},
    "pomegranate": {"calories": 83, "protein_g": 1.7, "carbs_g": 18.7, "fat_g": 1.2, "fiber_g": 4.0},
    "grapes": {"calories": 69, "protein_g": 0.7, "carbs_g": 18.1, "fat_g": 0.2, "fiber_g": 0.9},
    "strawberry": {"calories": 32, "protein_g": 0.7, "carbs_g": 7.7, "fat_g": 0.3, "fiber_g": 2.0},
    "blueberry": {"calories": 57, "protein_g": 0.7, "carbs_g": 14.5, "fat_g": 0.3, "fiber_g": 2.4},
    
    "potato": {"calories": 77, "protein_g": 2.0, "carbs_g": 17.5, "fat_g": 0.1, "fiber_g": 2.2},
    "aloo": {"calories": 77, "protein_g": 2.0, "carbs_g": 17.5, "fat_g": 0.1, "fiber_g": 2.2},
    "sweet potato": {"calories": 86, "protein_g": 1.6, "carbs_g": 20.1, "fat_g": 0.1, "fiber_g": 3.0},
    "broccoli": {"calories": 34, "protein_g": 2.8, "carbs_g": 6.6, "fat_g": 0.4, "fiber_g": 2.6},
    "spinach": {"calories": 23, "protein_g": 2.9, "carbs_g": 3.6, "fat_g": 0.4, "fiber_g": 2.2},
    "palak": {"calories": 23, "protein_g": 2.9, "carbs_g": 3.6, "fat_g": 0.4, "fiber_g": 2.2},
    "kale": {"calories": 49, "protein_g": 4.3, "carbs_g": 8.8, "fat_g": 0.9, "fiber_g": 3.6},
    "carrot": {"calories": 41, "protein_g": 0.9, "carbs_g": 9.6, "fat_g": 0.2, "fiber_g": 2.8},
    "tomato": {"calories": 18, "protein_g": 0.9, "carbs_g": 3.9, "fat_g": 0.2, "fiber_g": 1.2},
    "onion": {"calories": 40, "protein_g": 1.1, "carbs_g": 9.3, "fat_g": 0.1, "fiber_g": 1.7},
    "garlic": {"calories": 149, "protein_g": 6.4, "carbs_g": 33.1, "fat_g": 0.5, "fiber_g": 2.1},
    "ginger": {"calories": 80, "protein_g": 1.8, "carbs_g": 17.8, "fat_g": 0.8, "fiber_g": 2.0},
    "cucumber": {"calories": 15, "protein_g": 0.7, "carbs_g": 3.6, "fat_g": 0.1, "fiber_g": 0.5},
    "bell pepper": {"calories": 20, "protein_g": 0.9, "carbs_g": 4.6, "fat_g": 0.2, "fiber_g": 1.7},
    "mushroom": {"calories": 22, "protein_g": 3.1, "carbs_g": 3.3, "fat_g": 0.3, "fiber_g": 1.0},
    "corn": {"calories": 86, "protein_g": 3.2, "carbs_g": 18.7, "fat_g": 1.2, "fiber_g": 2.7},
    "peas": {"calories": 81, "protein_g": 5.4, "carbs_g": 14.5, "fat_g": 0.4, "fiber_g": 5.1},
    "matar": {"calories": 81, "protein_g": 5.4, "carbs_g": 14.5, "fat_g": 0.4, "fiber_g": 5.1},
    "green beans": {"calories": 31, "protein_g": 1.8, "carbs_g": 7.0, "fat_g": 0.1, "fiber_g": 3.4},
    "cauliflower": {"calories": 25, "protein_g": 1.9, "carbs_g": 5.0, "fat_g": 0.3, "fiber_g": 2.0},
    "gobi": {"calories": 25, "protein_g": 1.9, "carbs_g": 5.0, "fat_g": 0.3, "fiber_g": 2.0},
    "cabbage": {"calories": 25, "protein_g": 1.3, "carbs_g": 5.8, "fat_g": 0.1, "fiber_g": 2.5},
    "beetroot": {"calories": 43, "protein_g": 1.6, "carbs_g": 9.6, "fat_g": 0.2, "fiber_g": 2.8},
    "avocado": {"calories": 160, "protein_g": 2.0, "carbs_g": 8.5, "fat_g": 14.7, "fiber_g": 6.7},
    "methi": {"calories": 49, "protein_g": 4.4, "carbs_g": 6.0, "fat_g": 0.9, "fiber_g": 1.2},
    "lauki": {"calories": 14, "protein_g": 0.6, "carbs_g": 3.4, "fat_g": 0.0, "fiber_g": 0.5},
    "tinda": {"calories": 21, "protein_g": 1.4, "carbs_g": 3.4, "fat_g": 0.2, "fiber_g": 1.6},
    "bhindi": {"calories": 33, "protein_g": 1.9, "carbs_g": 7.4, "fat_g": 0.2, "fiber_g": 3.2},
    "sabzi": {"calories": 80, "protein_g": 2.5, "carbs_g": 12.0, "fat_g": 3.0, "fiber_g": 3.5},
    
    # Cooked Dishes & Miscellany Defaults
    "pakora": {"calories": 270, "protein_g": 6.4, "carbs_g": 28.0, "fat_g": 15.0, "fiber_g": 2.5},
    "bhaji": {"calories": 150, "protein_g": 3.0, "carbs_g": 20.0, "fat_g": 7.0, "fiber_g": 3.0},
    "sambar": {"calories": 110, "protein_g": 4.0, "carbs_g": 15.0, "fat_g": 3.0, "fiber_g": 3.0},
    "rasam": {"calories": 35, "protein_g": 1.0, "carbs_g": 6.0, "fat_g": 0.5, "fiber_g": 1.0},
    "jeera": {"calories": 375, "protein_g": 18.0, "carbs_g": 44.0, "fat_g": 22.0, "fiber_g": 11.0},
    "haldi": {"calories": 312, "protein_g": 9.7, "carbs_g": 67.1, "fat_g": 3.3, "fiber_g": 22.7},
}

GENERIC_FALLBACK = {
    "calories": 100,
    "protein_g": 3.0,
    "carbs_g": 15.0,
    "fat_g": 3.0,
    "fiber_g": 1.0
}

def get_nutrition(ingredient: str, serving: str) -> Dict[str, float]:
    """
    Checks local Firebase cache initially. Connects securely to CalorieNinjas APIs.
    Implements reliable nested dictionary fallbacks bypassing external anomalies natively.
    """
    cache_hit = get_cached_nutrition(ingredient)
    if cache_hit:
        # Extract explicit values preventing metadata leakage
        return {
            "calories": float(cache_hit.get("calories", 0)),
            "protein_g": float(cache_hit.get("protein_g", 0)),
            "carbs_g": float(cache_hit.get("carbs_g", 0)),
            "fat_g": float(cache_hit.get("fat_g", 0)),
            "fiber_g": float(cache_hit.get("fiber_g", 0))
        }

    # API Attempt
    if CALORIENINJAS_API_KEY:
        try:
            # Query the precise phrasing including servings for API
            query = f"{serving} {ingredient}"
            url = 'https://api.calorieninjas.com/v1/nutrition?query=' + requests.utils.quote(query)
            response = requests.get(url, headers={'X-Api-Key': CALORIENINJAS_API_KEY}, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('items'):
                    item = data['items'][0]
                    result = {
                        "calories": float(item.get("calories", 0)),
                        "protein_g": float(item.get("protein_g", 0)),
                        "carbs_g": float(item.get("carbohydrates_total_g", 0)),
                        "fat_g": float(item.get("fat_total_g", 0)),
                        "fiber_g": float(item.get("fiber_g", 0))
                    }
                    # Save to backend
                    cache_nutrition(ingredient, result)
                    return result
        except requests.exceptions.RequestException as e:
            logger.warning(f"CalorieNinjas connection anomaly for {ingredient}: {str(e)}. Attempting Fallbacks.")
            
    # Local dictionary mapping evaluations (Scaled if 'serving' dictates multiplier)
    multiplier = 1.0
    # extremely rough scaler based purely on string contents e.g. "200g" -> 2.0
    import re
    m = re.search(r'([\d.]+)\s*g', serving, re.IGNORECASE)
    if m:
        multiplier = float(m.group(1)) / 100.0
    
    # Check manual local lookup fallback mapping
    clean_ing = ingredient.lower().strip()
    match = FALLBACK_NUTRITION.get(clean_ing)
    
    if match:
        result = {
            "calories": round(match["calories"] * multiplier, 2),
            "protein_g": round(match["protein_g"] * multiplier, 2),
            "carbs_g": round(match["carbs_g"] * multiplier, 2),
            "fat_g": round(match["fat_g"] * multiplier, 2),
            "fiber_g": round(match["fiber_g"] * multiplier, 2)
        }
    else:
        logger.warning(f"Total mapping failure. Fallback generic allocation issued for: {ingredient}")
        result = {
            "calories": round(GENERIC_FALLBACK["calories"] * multiplier, 2),
            "protein_g": round(GENERIC_FALLBACK["protein_g"] * multiplier, 2),
            "carbs_g": round(GENERIC_FALLBACK["carbs_g"] * multiplier, 2),
            "fat_g": round(GENERIC_FALLBACK["fat_g"] * multiplier, 2),
            "fiber_g": round(GENERIC_FALLBACK["fiber_g"] * multiplier, 2)
        }
        
    cache_nutrition(ingredient, result)
    return result
