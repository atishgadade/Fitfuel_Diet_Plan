import os
import joblib
from sklearn.preprocessing import StandardScaler
from typing import List
import numpy as np
import logging

logger = logging.getLogger(__name__)

SCALER_PATH = os.path.join(os.path.dirname(__file__), '../artifacts/scaler_vectors.pkl')

class VectorScaler:
    """
    Independent StandardScaler instantiated purely preventing Calorie Values (1500 - 3000)
    dominating Ordinal Budget Values (1-3) prior to Cosine Similarity scoring. 
    """
    def __init__(self):
        self.scaler = None
        self._load_or_init()
        
    def _load_or_init(self):
        if os.path.exists(SCALER_PATH):
            try:
                self.scaler = joblib.load(SCALER_PATH)
                logger.info("Loaded generic VectorScaler.")
            except Exception as e:
                logger.warning(f"Failed to load VectorScaler: {str(e)}. Initializing new.")
                self.scaler = StandardScaler()
        else:
            self.scaler = StandardScaler()

    def fit(self, numeric_features: List[List[float]]):
        """Fit dynamically if artifacts do not exist."""
        if len(numeric_features) > 0:
            self.scaler.fit(numeric_features)
            
            # Ensure artifacts directory exists
            os.makedirs(os.path.dirname(SCALER_PATH), exist_ok=True)
            joblib.dump(self.scaler, SCALER_PATH)
            logger.info("Fitted and saved VectorScaler dynamically.")

    def transform(self, numeric_features: np.ndarray) -> np.ndarray:
        """Applies normalization securely."""
        try:
            # Handle un-fitted state dynamically avoiding crashes
            if not hasattr(self.scaler, 'mean_') or self.scaler.mean_ is None:
                # Fallback arbitrary scaling if not fitted
                return numeric_features
                
            return self.scaler.transform(numeric_features)
        except Exception as e:
            logger.warning(f"Vector scaling failed: {str(e)}. Returning original array.")
            return numeric_features

# Global instance
vector_scaler = VectorScaler()
