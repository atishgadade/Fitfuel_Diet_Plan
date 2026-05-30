import logging
from config import LOG_LEVEL

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class ModelNotLoadedError(Exception):
    """Raised when an ML model artifact fails to load or is missing."""
    pass

class FirebaseConnectionError(Exception):
    """Raised when Firebase Admin SDK fails to initialize or query fails."""
    pass

class NutritionAPIError(Exception):
    """Raised when the external Nutrition API fails to respond or errors out."""
    pass

class NoPlanFoundError(Exception):
    """Raised when hard constraints filter out all available diet plans."""
    pass
