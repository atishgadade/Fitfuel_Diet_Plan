"""
recommendation_response.py — Pydantic response models for the ML API.

Defines the structured response shapes returned by /api/recommend and
/api/extract-macros so FastAPI auto-generates accurate OpenAPI docs.
"""
from typing import List, Dict, Optional
from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    """Individual component scores that fuse into the final rank."""
    similarity: float
    nutrition: float
    budget: float
    calorie: float


class MacroSummary(BaseModel):
    """Aggregated macro profile of a recommended plan."""
    plan_avg_calories: float
    protein_ratio: float
    carb_ratio: float
    fat_ratio: float


class RankedPlan(BaseModel):
    """A single recommended plan with full explainability data."""
    plan_id: str
    score: float
    components: ScoreBreakdown
    tags: List[str]
    macro_summary: MacroSummary


class RecommendResponse(BaseModel):
    """Top-level response from POST /api/recommend."""
    ranked: List[RankedPlan]
    message: Optional[str] = None
    error: Optional[str] = None


class MealMacros(BaseModel):
    """Nutrition data for a single meal."""
    meal_name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class PlanMacroAnalysis(BaseModel):
    """Detailed macro analysis for an entire plan."""
    protein_percentage: float
    carb_percentage: float
    fat_percentage: float
    is_high_protein: bool
    is_calorie_deficit_friendly: bool


class MacroExtractionResponse(BaseModel):
    """Top-level response from POST /api/extract-macros."""
    success: bool
    macros: Optional[Dict] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Response from GET /api/health."""
    status: str
    artifacts_loaded: bool
    firebase_connection: str
