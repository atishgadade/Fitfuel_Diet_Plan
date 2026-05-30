def compute_budget_compatibility(user_budget: str, plan_budget: str) -> float:
    """
    Evaluates scoring tiers mapping strict constraints avoiding negative representations:
    - Exact match => 1.0 (e.g. low == low, medium == medium)
    - 1 Level Off => 0.6 (e.g. low vs medium, medium vs high)
    - 2 Levels Off => 0.2 (e.g. low vs high)
    Score explicitly bounded [0.0 - 1.0].
    """
    levels = {"low": 1, "medium": 2, "high": 3}
    
    u_val = levels.get(user_budget.lower(), 2)
    p_val = levels.get(plan_budget.lower(), 2)
    
    diff = abs(u_val - p_val)
    
    if diff == 0:
        return 1.0
    elif diff == 1:
        return 0.6
    else:  # diff >= 2
        return 0.2
