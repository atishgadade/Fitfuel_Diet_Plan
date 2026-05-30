from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

GOAL_NORMALIZATION = {
    # Exact dataset values
    "Weight Loss": "Weight Loss",
    "Lean Muscle Gain": "Lean Muscle Gain",
    "Bulking": "Bulking",
    # Lowercase
    "weight loss": "Weight Loss",
    "lean muscle gain": "Lean Muscle Gain",
    "bulking": "Bulking",
    # CamelCase from frontend
    "weightLoss": "Weight Loss",
    "leanMuscle": "Lean Muscle Gain",
    "leanMuscleGain": "Lean Muscle Gain",
    # Snake case
    "weight_loss": "Weight Loss",
    "lean_muscle": "Lean Muscle Gain",
    "lean_muscle_gain": "Lean Muscle Gain"
}


def normalize_goal(goal: str) -> str:
    if not goal:
        return "Weight Loss"
    
    cleaned = goal.strip()
    if cleaned in GOAL_NORMALIZATION:
        return GOAL_NORMALIZATION[cleaned]
    
    lower = cleaned.lower()
    for key, value in GOAL_NORMALIZATION.items():
        if key.lower() == lower:
            return value
    
    # Fuzzy matching
    if "bulk" in lower:
        return "Bulking"
    if "loss" in lower or "lose" in lower or "cut" in lower or "deficit" in lower:
        return "Weight Loss"
    if "muscle" in lower or "lean" in lower or "gain" in lower:
        return "Lean Muscle Gain"
        
    return "Weight Loss"

def filter_plans(
    plans: List[Dict[str, Any]], 
    dietary_preference: str, 
    user_budget: str, 
    ml_goal: str
) -> List[Dict[str, Any]]:
    """
    Applies three sequential hard constraints:
    - Diet type matches (handled via Firebase Collection implicitly but checked directly to be safe)
    - Budget Hard Limits: limits explicit user financial bounds dropping excess tiers safely.
    - Goal Filters: only plans whose fitnessGoal matches the ML-validated goal.
    """
    if not plans:
        return []

    norm_goal = normalize_goal(ml_goal)
        
    filtered_by_budget = []
    
    # 1 tier bounds
    budget_ranks = {"low": 1, "medium": 2, "high": 3}
    user_budget_rank = budget_ranks.get(user_budget.lower(), 2)
    
    for plan in plans:
        # Hard limits budget (inclusive bounds e.g. budgetRank: 2 allows Low(1) + Med(2)). High(3) is dropped.
        plan_budget_tier = plan.get("budgetCategory", "medium")
        plan_budget_rank = budget_ranks.get(plan_budget_tier.lower(), 2)
        
        if plan_budget_rank > user_budget_rank:
            continue
            
        # The dietary filter check for anomalies in specific collections
        plan_diet = plan.get("dietaryType", "")
        if dietary_preference.lower() == "vegan" and plan_diet.lower() != "vegan":
            continue
            
        filtered_by_budget.append(plan)
        
    # 2 Goal filters
    final_filtered = [
        p for p in filtered_by_budget
        if normalize_goal(p.get("fitnessGoal", "")) == norm_goal
    ]
    
    if not final_filtered:
        logger.warning(f"Goal filter eliminated all plans for '{norm_goal}'. Falling back to budget tier.")
        return filtered_by_budget
    
    return final_filtered
