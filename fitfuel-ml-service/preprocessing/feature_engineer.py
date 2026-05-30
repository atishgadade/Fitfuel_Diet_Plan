import numpy as np
from typing import Dict, Any
from config import BUDGET_ENCODING
from preprocessing.scaler import vector_scaler

def build_user_vector(goal: str, activity_level: str, budget: str, calorie_target: float) -> np.ndarray:
    """
    Constructs the target Query representation:
    [is_bulking, is_weightloss, is_leanmuscle, is_sedentary, is_moderate, is_active, budget_score, calorie_value]
    """
    is_bulking = 1 if goal == "Bulking" else 0
    is_weightloss = 1 if goal == "Weight Loss" else 0
    is_leanmuscle = 1 if goal == "Lean Muscle Gain" else 0
    
    is_sedentary = 1 if activity_level == "Sedentary" else 0
    is_moderate = 1 if activity_level == "Moderate" else 0
    is_active = 1 if activity_level == "Active" else 0
    
    budget_score = BUDGET_ENCODING.get(budget.lower(), 2)
    
    # Needs array structure [[feat1, feat2]] for transforming
    numeric = np.array([[budget_score, calorie_target]])
    scaled_num = vector_scaler.transform(numeric)[0]
    
    return np.array([
        is_bulking, is_weightloss, is_leanmuscle,
        is_sedentary, is_moderate, is_active,
        scaled_num[0], scaled_num[1]
    ], dtype=float)

def build_plan_vector(plan: Dict[str, Any], plan_nutrition: Dict[str, float]) -> np.ndarray:
    """
    Constructs the Candidate representation mapped exactly parallel towards target Queries evaluating similarities.
    Extracts goals, activity factors, explicit budget arrays applying identical VectorScaler.
    """
    goal = plan.get("fitnessGoal", "Weight Loss")
    activity_level = plan.get("activityLevel", "Moderate")
    budget = plan.get("budgetCategory", "medium")
    calorie_value = plan_nutrition.get("calories", 2000.0)
    
    is_bulking = 1 if goal == "Bulking" else 0
    is_weightloss = 1 if goal == "Weight Loss" else 0
    is_leanmuscle = 1 if goal == "Lean Muscle Gain" else 0
    
    is_sedentary = 1 if activity_level == "Sedentary" else 0
    is_moderate = 1 if activity_level == "Moderate" else 0
    is_active = 1 if activity_level == "Active" else 0
    
    budget_score = BUDGET_ENCODING.get(budget.lower(), 2)
    
    numeric = np.array([[budget_score, calorie_value]])
    scaled_num = vector_scaler.transform(numeric)[0]
    
    return np.array([
        is_bulking, is_weightloss, is_leanmuscle,
        is_sedentary, is_moderate, is_active,
        scaled_num[0], scaled_num[1]
    ], dtype=float)
