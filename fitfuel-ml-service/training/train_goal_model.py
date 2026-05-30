"""
Goal Prediction Model Training Script

Trains a classification model to predict fitness goal from BMI and activity level.

CONTRACT (must be identical in models/goal_predictor.py):
- Feature order: [bmi_scaled, activity_encoded]
- BMI scaler: StandardScaler fitted on df[["bmi"]] (2D)
- Activity encoder: LabelEncoder (alphabetical: Active=0, Moderate=1, Sedentary=2)
- Goal encoder: LabelEncoder (alphabetical: Bulking=0, Lean Muscle Gain=1, Weight Loss=2)
- Artifacts saved: goal_model.pkl, scaler.pkl, label_encoders.pkl
- label_encoders.pkl contains dict with keys "activity" and "goal"
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score
)
import joblib
import os


def train():
    # ── Load Data ──
    data_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(data_dir, "synthetic_training_data.csv")
    
    if not os.path.exists(data_path):
        print("ERROR: Training data not found.")
        print("Run first: python training/generate_synthetic_data.py")
        return
    
    df = pd.read_csv(data_path)
    
    print("=" * 65)
    print("GOAL PREDICTION MODEL TRAINING")
    print("=" * 65)
    print(f"Dataset size: {len(df)} samples")
    print(f"Class distribution:")
    for goal in sorted(df["fitness_goal"].unique()):
        n = len(df[df["fitness_goal"] == goal])
        print(f"  {goal:20s}: {n:4d} ({n/len(df)*100:.1f}%)")
    
    # ── Encode Labels ──
    le_activity = LabelEncoder()
    le_goal = LabelEncoder()
    
    activity_encoded = le_activity.fit_transform(df["activity_level"])
    goal_encoded = le_goal.fit_transform(df["fitness_goal"])
    
    print(f"\nEncoding maps:")
    print(f"  Activity: {dict(zip(le_activity.classes_, range(len(le_activity.classes_))))}")
    print(f"  Goal:     {dict(zip(le_goal.classes_, range(len(le_goal.classes_))))}")
    
    # ── Scale BMI ──
    scaler = StandardScaler()
    # CRITICAL: fit on 2D array — df[["bmi"]] not df["bmi"]
    bmi_scaled = scaler.fit_transform(df[["bmi"]])
    
    print(f"  BMI scaler: mean={scaler.mean_[0]:.2f}, std={scaler.scale_[0]:.2f}")
    
    # ── Feature Matrix ──
    # FEATURE ORDER: [bmi_scaled, activity_encoded]
    # This is the CONTRACT — must match goal_predictor.py
    X = np.column_stack([bmi_scaled.ravel(), activity_encoded.astype(float)])
    y = goal_encoded
    
    print(f"\nFeature matrix: {X.shape}")
    print(f"Feature order: [bmi_scaled, activity_encoded] ← CONTRACT")
    
    # ── Train/Test Split ──
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )
    
    print(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # ── Model 1: Logistic Regression ──
    lr = LogisticRegression(
        solver="lbfgs",
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )
    lr.fit(X_train, y_train)
    lr_pred = lr.predict(X_test)
    lr_acc = accuracy_score(y_test, lr_pred)
    lr_f1 = f1_score(y_test, lr_pred, average="weighted")
    
    print(f"\n{'='*65}")
    print("MODEL 1: LOGISTIC REGRESSION")
    print(f"{'='*65}")
    print(f"Accuracy: {lr_acc:.4f} ({lr_acc*100:.1f}%)")
    print(f"Weighted F1: {lr_f1:.4f}")
    print(classification_report(y_test, lr_pred, target_names=le_goal.classes_))
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, lr_pred)}")
    
    # ── Model 2: Decision Tree ──
    dt = DecisionTreeClassifier(
        max_depth=6,
        class_weight="balanced",
        random_state=42
    )
    dt.fit(X_train, y_train)
    dt_pred = dt.predict(X_test)
    dt_acc = accuracy_score(y_test, dt_pred)
    dt_f1 = f1_score(y_test, dt_pred, average="weighted")
    
    print(f"\n{'='*65}")
    print("MODEL 2: DECISION TREE")
    print(f"{'='*65}")
    print(f"Accuracy: {dt_acc:.4f} ({dt_acc*100:.1f}%)")
    print(f"Weighted F1: {dt_f1:.4f}")
    print(classification_report(y_test, dt_pred, target_names=le_goal.classes_))
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, dt_pred)}")
    
    # ── Select Best ──
    # Prefer weighted F1 over accuracy (handles imbalanced classes better)
    if lr_f1 >= dt_f1:
        best_model = lr
        best_name = "LogisticRegression"
        best_acc = lr_acc
        best_f1 = lr_f1
    else:
        best_model = dt
        best_name = "DecisionTreeClassifier"
        best_acc = dt_acc
        best_f1 = dt_f1
    
    print(f"\n{'='*65}")
    print(f"SELECTED: {best_name}")
    print(f"Accuracy: {best_acc:.4f}  |  Weighted F1: {best_f1:.4f}")
    print(f"{'='*65}")
    
    # ── Save Artifacts ──
    artifacts_dir = os.path.join(os.path.dirname(data_dir), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    
    model_path = os.path.join(artifacts_dir, "goal_model.pkl")
    scaler_path = os.path.join(artifacts_dir, "scaler.pkl")
    encoders_path = os.path.join(artifacts_dir, "label_encoders.pkl")
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump({"activity": le_activity, "goal": le_goal}, encoders_path)
    
    print(f"\nArtifacts saved to {artifacts_dir}/")
    
    # ── Verification Predictions ──
    print(f"\n{'='*65}")
    print("VERIFICATION PREDICTIONS")
    print(f"{'='*65}")
    
    cases = [
        (16.0, "Sedentary",  "Bulking"),
        (16.0, "Active",     "Lean Muscle Gain"),
        (20.0, "Active",     "Lean Muscle Gain"),
        (20.0, "Moderate",   "Lean Muscle Gain"),
        (20.0, "Sedentary",  "Lean Muscle Gain or Weight Loss"),
        (24.0, "Active",     "Lean Muscle Gain"),
        (24.0, "Sedentary",  "Weight Loss"),
        (27.0, "Moderate",   "Weight Loss"),
        (27.0, "Active",     "Weight Loss or Lean Muscle Gain"),
        (35.0, "Sedentary",  "Weight Loss"),
        (35.0, "Active",     "Weight Loss"),
    ]
    
    pass_count = 0
    total = len(cases)
    
    for bmi_val, act_val, expected in cases:
        bmi_s = scaler.transform([[bmi_val]])[0][0]
        act_e = float(le_activity.transform([act_val])[0])
        feat = np.array([[bmi_s, act_e]])
        
        pred_enc = best_model.predict(feat)[0]
        pred_goal = le_goal.inverse_transform([pred_enc])[0]
        proba = best_model.predict_proba(feat)[0]
        conf = max(proba)
        
        # Check if prediction matches any acceptable answer
        acceptable = [e.strip() for e in expected.split(" or ")]
        ok = pred_goal in acceptable
        if ok:
            pass_count += 1
        
        symbol = "✓" if ok else "✗"
        print(
            f"  {symbol} BMI={bmi_val:5.1f}  {act_val:10s} → "
            f"{pred_goal:20s} ({conf:.0%})  "
            f"[expected: {expected}]"
        )
    
    print(f"\n  Result: {pass_count}/{total} predictions match expected")
    
    if pass_count >= total - 2:
        print("  ✓ Model quality: ACCEPTABLE")
    else:
        print("  ✗ Model quality: POOR — review training data or hyperparameters")
    
    print(f"\n{'='*65}")
    print("Training complete.")
    print(f"{'='*65}")


if __name__ == "__main__":
    train()
