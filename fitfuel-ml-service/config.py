import os
from pathlib import Path
from dotenv import load_dotenv

# Load the single root .env shared across all sub-projects
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# Resolve Firebase credentials path relative to ROOT_DIR
_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "fitfuel-ml-service/serviceAccountKey.json")
FIREBASE_CREDENTIALS_PATH = str(ROOT_DIR / _cred_path) if not os.path.isabs(_cred_path) else _cred_path
CALORIENINJAS_API_KEY = os.getenv("CALORIENINJAS_API_KEY", "")
ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", 8000))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

MODEL_ARTIFACTS_PATH = os.path.join(os.path.dirname(__file__), "artifacts")

BUDGET_ENCODING = {
    "low": 1,
    "medium": 2,
    "high": 3   
}

ACTIVITY_FACTORS = {
    "Sedentary": 1.2,
    "Moderate": 1.55,
    "Active": 1.725
}

MACRO_RATIOS = {
    "Weight Loss": {"protein": 0.40, "carbs": 0.30, "fat": 0.30},
    "Lean Muscle Gain": {"protein": 0.35, "carbs": 0.40, "fat": 0.25},
    "Bulking": {"protein": 0.30, "carbs": 0.45, "fat": 0.25}
}

RANKING_WEIGHTS = {
    "similarity": 0.35,
    "nutrition": 0.30,
    "budget": 0.20,
    "calorie": 0.15
}

CACHE_EXPIRY_DAYS = 30
