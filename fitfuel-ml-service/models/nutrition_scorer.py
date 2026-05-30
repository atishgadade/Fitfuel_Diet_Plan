def compute_nutrition_compatibility(
    plan_nutrition: dict, user_targets: dict, goal: str
) -> float:
    """
    Examines Macro variance resolving scoring dependencies scaling offset values towards bounded integers.
    Weight Loss heavily rewards high protein ratio avoiding overall gross excesses.
    Bulking targets exceeding metrics favoring excessive carbohydrate inclusions.
    LMG identifies exact normalized arrays balancing variance optimally.
    """
    u_calories = user_targets.get('calorie_target', 0)
    u_macros = user_targets.get('macro_split', {})
    
    p_calories = plan_nutrition.get('calories', 0.1)  # prevent div by 0
    p_protein = plan_nutrition.get('protein_g', 0)
    p_carbs = plan_nutrition.get('carbs_g', 0)
    p_fat = plan_nutrition.get('fat_g', 0)
    p_total = max(p_protein + p_carbs + p_fat, 1)

    # Convert plan grams to ratios
    p_protein_ratio = p_protein / p_total
    p_carbs_ratio = p_carbs / p_total
    
    score = 0.5
    
    if goal == "Weight Loss":
        # Over-eating punishment
        if p_calories > u_calories:
            score -= 0.3
        # Reward Protein, restrict Carbs
        score += (p_protein_ratio * 0.5) - (p_carbs_ratio * 0.2)
        
    elif goal == "Bulking":
        # Reward maintaining or exceeding calories safely
        if p_calories >= u_calories:
            score += 0.2
        # Reward increased carbs for glycogen + energy
        score += (p_carbs_ratio * 0.5)
        
    elif goal == "Lean Muscle Gain":
        # Reward balanced high protein
        if abs(p_calories - u_calories) < 200:
            score += 0.2
        score += (p_protein_ratio * 0.4)
        
    return max(0.0, min(1.0, score))
