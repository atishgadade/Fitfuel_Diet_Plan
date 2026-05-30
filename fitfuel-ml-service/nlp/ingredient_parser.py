import re
from typing import List, Dict, Any

def parse_ingredients(meal: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Normalizes complex textual ingredient lists into predictable lookup values.
    Specifically handles structural quantifiers (2 cups rice) isolating quantities.
    Singularizes known variants mapping common Indian food components directly.
    """
    ingredients = meal.get('ingredients', [])
    parsed = []
    
    # Generic regex separating quantity (numbers/fractions/cups/tbsp) from names
    qty_pattern = re.compile(r'^([\d./\s]+(?:cup|cups|tbsp|tsp|g|kg|ml|oz|piece|pieces)?)\s+(.*)', re.IGNORECASE)
    
    # Common mappings (plural -> singular, variants -> standard)
    standardization_map = {
        "rotis": "roti",
        "chapatis": "chapati",
        "parathas": "paratha",
        "dals": "dal",
        "tomatoes": "tomato",
        "potatoes": "potato",
        "onions": "onion",
        "chillies": "chili",
        "bell peppers": "bell pepper",
        "apples": "apple",
        "bananas": "banana",
        "almonds": "almond",
        "walnuts": "walnut",
        "cashews": "cashew",
        "peanuts": "peanut",
        "carrots": "carrot"
    }

    for item in ingredients:
        raw = str(item).lower().strip()
        
        # Remove extra whitespace
        raw = re.sub(r'\s+', ' ', raw)
        
        match = qty_pattern.match(raw)
        if match:
            serving = match.group(1).strip()
            name = match.group(2).strip()
        else:
            serving = "100g" # Default generic 100g estimate if pattern absent
            name = raw
            
        # Standardize identified name
        std_name = standardization_map.get(name, name)
        
        parsed.append({
            "ingredient": std_name,
            "estimated_serving": serving
        })
        
    return parsed
