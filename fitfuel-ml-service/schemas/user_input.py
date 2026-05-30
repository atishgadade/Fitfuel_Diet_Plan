from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserProfileRequest(BaseModel):
    height_cm: float = Field(gt=50, lt=250)
    weight_kg: float = Field(gt=20, lt=300)
    age: int = Field(gt=10, lt=100)
    sex: str
    activity_level: str
    goal: str
    diet_pref: str
    budget_tier: str

class RecommendRequestPayload(BaseModel):
    user_profile: Dict[str, Any]
    filtered_plans: List[Dict[str, Any]]
    
class MacroExtractionRequest(BaseModel):
    plan: Dict[str, Any]
