"""
evaluate_model.py — Model Evaluation & Metrics Reporting

Loads the trained goal prediction model and evaluates it against the
synthetic test set, printing accuracy, precision, recall, F1-score
per class, and a full confusion matrix.
"""
import os
import sys
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder

# Resolve paths
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
TRAINING_DIR = Path(__file__).resolve().parent


def evaluate():
    """Load saved artifacts and evaluate on the test split."""
    # --- 1. Load artifacts ---
    model_path = ARTIFACTS_DIR / "goal_model.pkl"
    scaler_path = ARTIFACTS_DIR / "scaler.pkl"
    encoder_path = ARTIFACTS_DIR / "label_encoders.pkl"

    if not model_path.exists():
        print("ERROR: goal_model.pkl not found. Run train_goal_model.py first.")
        sys.exit(1)

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    encoders = joblib.load(encoder_path)

    le_activity = encoders["activity_level"]
    le_target = encoders["target"]

    # --- 2. Load and prepare data ---
    csv_path = TRAINING_DIR / "synthetic_training_data.csv"
    if not csv_path.exists():
        print("ERROR: synthetic_training_data.csv not found. Run generate_synthetic_data.py first.")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    X = df[["bmi", "activity_level"]].copy()
    y = df["fitness_goal"]

    X["activity_level"] = le_activity.transform(X["activity_level"])
    y_encoded = le_target.transform(y)

    _, X_test, _, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    X_test_scaled = scaler.transform(X_test)

    # --- 3. Predict and evaluate ---
    y_pred = model.predict(X_test_scaled)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    class_names = le_target.classes_

    print("=" * 60)
    print("  FIT-FUEL Goal Prediction Model — Evaluation Report")
    print("=" * 60)
    print(f"  Model type : {type(model).__name__}")
    print(f"  Test size  : {len(y_test)} samples")
    print("-" * 60)
    print(f"  Accuracy   : {acc:.4f}")
    print(f"  Precision  : {prec:.4f}  (weighted)")
    print(f"  Recall     : {rec:.4f}  (weighted)")
    print(f"  F1 Score   : {f1:.4f}  (weighted)")
    print("-" * 60)
    print("\n  Per-Class Classification Report:\n")
    print(classification_report(y_test, y_pred, target_names=class_names, zero_division=0))
    print("-" * 60)
    print("  Confusion Matrix:\n")

    cm = confusion_matrix(y_test, y_pred)
    # Pretty-print with labels
    header = "  " + "  ".join(f"{name:>12}" for name in class_names)
    print(f"{'Predicted →':>14}")
    print(header)
    for i, row in enumerate(cm):
        row_str = "  ".join(f"{val:>12}" for val in row)
        print(f"  {class_names[i]:>12}  {row_str}")

    print("=" * 60)
    return acc


if __name__ == "__main__":
    evaluate()
