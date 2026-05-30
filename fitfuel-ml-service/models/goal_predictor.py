"""
Goal Prediction Module

Predicts fitness goal from BMI and activity level using a trained sklearn model.

CONTRACT (must match training/train_goal_model.py):
- Feature order: [bmi_scaled, activity_encoded]
- Scaler fitted on 2D bmi array
- LabelEncoders in alphabetical order
- Artifacts dict keys: "activity", "goal"

Model is loaded ONCE at module import time (singleton pattern).
"""

import joblib
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)

# ── Module-level singleton state ──
_model = None
_scaler = None
_le_activity = None
_le_goal = None
_model_loaded = False


def _resolve_artifacts_dir() -> str:
    """Resolve path to artifacts/ directory relative to this file."""
    this_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(this_dir)
    return os.path.join(parent_dir, "artifacts")


def _load_artifacts():
    """
    Load trained model artifacts from disk.
    Called once at module import. Not called per request.
    """
    global _model, _scaler, _le_activity, _le_goal, _model_loaded
    
    artifacts_dir = _resolve_artifacts_dir()
    
    paths = {
        "model": os.path.join(artifacts_dir, "goal_model.pkl"),
        "scaler": os.path.join(artifacts_dir, "scaler.pkl"),
        "encoders": os.path.join(artifacts_dir, "label_encoders.pkl"),
    }
    
    # Check all exist
    missing = [name for name, path in paths.items() if not os.path.exists(path)]
    if missing:
        logger.warning(
            f"Goal model artifacts missing: {missing}. "
            f"Run: python training/generate_synthetic_data.py && "
            f"python training/train_goal_model.py"
        )
        _model_loaded = False
        return
    
    try:
        _model = joblib.load(paths["model"])
        _scaler = joblib.load(paths["scaler"])
        
        encoders = joblib.load(paths["encoders"])
        _le_activity = encoders["activity"]
        _le_goal = encoders["goal"]
        
        _model_loaded = True
        logger.info(
            f"Goal model loaded: {type(_model).__name__}, "
            f"goals={list(_le_goal.classes_)}, "
            f"activities={list(_le_activity.classes_)}"
        )
    except Exception as e:
        logger.error(f"Failed to load goal model: {e}")
        _model_loaded = False


# Load on module import
_load_artifacts()


def is_model_loaded() -> bool:
    """Check if ML model is loaded and ready."""
    return _model_loaded


def predict_goal(bmi: float, activity_level: str) -> tuple:
    """
    Predict recommended fitness goal.
    
    Args:
        bmi: Body Mass Index (float)
        activity_level: "Sedentary", "Moderate", or "Active"
    
    Returns:
        (predicted_goal: str, confidence: float)
    
    Feature order: [bmi_scaled, activity_encoded] — matches training contract.
    """
    if not _model_loaded:
        logger.warning("Goal model unavailable. Using rule-based fallback.")
        return _fallback(bmi, activity_level)
    
    try:
        # ── Normalize input ──
        activity_clean = activity_level.strip().title()
        
        # ── Encode activity ──
        try:
            act_encoded = float(_le_activity.transform([activity_clean])[0])
        except ValueError:
            logger.warning(f"Unknown activity '{activity_level}', defaulting to Moderate")
            act_encoded = float(_le_activity.transform(["Moderate"])[0])
        
        # ── Scale BMI ──
        # Scaler was fit on 2D: scaler.fit(df[["bmi"]])
        # Must transform as 2D: scaler.transform([[bmi]])
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            bmi_scaled = float(_scaler.transform([[bmi]])[0][0])
        
        # ── Build feature array ──
        # ORDER: [bmi_scaled, activity_encoded] — CONTRACT
        features = np.array([[bmi_scaled, act_encoded]])
        
        # ── Predict ──
        pred_encoded = _model.predict(features)[0]
        pred_goal = _le_goal.inverse_transform([pred_encoded])[0]
        
        # ── Confidence ──
        proba = _model.predict_proba(features)[0]
        confidence = float(max(proba))
        
        logger.info(
            f"Goal prediction: BMI={bmi:.1f} {activity_level} → "
            f"{pred_goal} ({confidence:.0%})"
        )
        
        return (pred_goal, confidence)
    
    except Exception as e:
        logger.error(f"Prediction error: {e}. Using fallback.")
        return _fallback(bmi, activity_level)


def _fallback(bmi: float, activity_level: str) -> tuple:
    """
    Rule-based fallback when ML model is unavailable.
    Uses same rules as synthetic data generator for consistency.
    """
    act = activity_level.strip().title()
    
    if bmi < 18.5:
        if act in ["Sedentary", "Moderate"]:
            return ("Bulking", 0.75)
        return ("Lean Muscle Gain", 0.70)
    elif bmi < 23.0:
        if act == "Active":
            return ("Lean Muscle Gain", 0.70)
        elif act == "Moderate":
            return ("Lean Muscle Gain", 0.65)
        return ("Weight Loss", 0.60)
    elif bmi < 25.0:
        if act == "Active":
            return ("Lean Muscle Gain", 0.65)
        return ("Weight Loss", 0.70)
    elif bmi < 30.0:
        return ("Weight Loss", 0.80)
    return ("Weight Loss", 0.85)


# --- Backward Compatibility Wrapper ---
class GoalPredictorSingleton:
    def is_loaded(self) -> bool:
        return is_model_loaded()
        
    def predict_goal(self, bmi: float, activity_level: str) -> str:
        goal, _ = predict_goal(bmi, activity_level)
        return goal
        
    def validate_goal(self, user_selected: str, bmi: float, activity_level: str) -> dict:
        predicted, confidence = predict_goal(bmi, activity_level)
        match = user_selected.strip() == predicted.strip()
        
        if match:
            suggestion = "Your selected goal aligns with our ML analysis."
        else:
            suggestion = (
                f"Based on your profile, our model suggests '{predicted}' "
                f"may be more suitable ({round(confidence * 100, 1)}% confidence). "
                f"We'll show plans for your selection: '{user_selected}'."
            )
        
        return {
            "user_selected": user_selected,
            "ml_predicted": predicted,
            "confidence": float(round(confidence, 3)),
            "match": match,
            "suggestion": suggestion
        }

predictor = GoalPredictorSingleton()

