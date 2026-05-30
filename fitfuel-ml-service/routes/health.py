from fastapi import APIRouter
from models.goal_predictor import predictor
from firebase_client import get_db

router = APIRouter()

@router.get("/health")
async def health_check():
    """Returns application initialization status including Models and Database pings."""
    
    # Check DB Connection
    db_status = "Connected"
    try:
        get_db()
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"
        
    return {
        "status": "Running",
        "artifacts_loaded": predictor.is_loaded(),
        "firebase_connection": db_status
    }
