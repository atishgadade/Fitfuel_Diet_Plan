"""
Synthetic Training Data Generator for Goal Prediction Model

Generates labeled data using domain knowledge rules that map
BMI + Activity Level → Recommended Fitness Goal.

The rules are based on:
- WHO BMI classifications (with Asian population adjustments)
- General fitness and nutrition guidelines
- Common sense recommendations a dietitian would make

Noise is added at 8% to prevent overfitting while maintaining
model accuracy above 85%.
"""

import pandas as pd
import numpy as np
import os


def generate():
    np.random.seed(42)
    
    ROWS = 1000
    NOISE_RATE = 0.08
    
    GOALS = ["Bulking", "Weight Loss", "Lean Muscle Gain"]
    ACTIVITIES = ["Sedentary", "Moderate", "Active"]
    
    data = []
    
    for _ in range(ROWS):
        # Generate BMI with realistic distribution
        # Most adults fall between 18-35 BMI
        # Use normal distribution centered at 25 (global average) with some spread
        bmi = np.random.normal(loc=25.0, scale=6.0)
        bmi = np.clip(bmi, 14.0, 48.0)
        bmi = round(bmi, 1)
        
        activity = np.random.choice(ACTIVITIES)
        
        # ── Domain Rules ──
        # Based on what a nutritionist would recommend
        
        if bmi < 18.5:
            # UNDERWEIGHT — needs to gain weight
            if activity in ["Sedentary", "Moderate"]:
                # Not very active + underweight → need to build mass
                goal = "Bulking"
            else:
                # Active + underweight → can build lean muscle efficiently
                goal = "Lean Muscle Gain"
        
        elif 18.5 <= bmi < 23.0:
            # NORMAL WEIGHT (lower range, especially for Asian populations)
            if activity == "Active":
                # Active + normal weight → prime for lean muscle building
                goal = "Lean Muscle Gain"
            elif activity == "Moderate":
                # Moderate + normal weight → can build lean muscle
                goal = "Lean Muscle Gain"
            else:
                # Sedentary + normal weight → may benefit from activity
                # Slight preference for maintenance/lean muscle over weight loss
                # But some sedentary people at BMI 20-23 may want to lean out
                goal = np.random.choice(
                    ["Lean Muscle Gain", "Weight Loss"],
                    p=[0.6, 0.4]
                )
        
        elif 23.0 <= bmi < 25.0:
            # NORMAL WEIGHT (upper range) / Asian overweight threshold
            if activity == "Active":
                goal = "Lean Muscle Gain"
            elif activity == "Moderate":
                # Could go either way — slight preference for weight management
                goal = np.random.choice(
                    ["Weight Loss", "Lean Muscle Gain"],
                    p=[0.6, 0.4]
                )
            else:
                goal = "Weight Loss"
        
        elif 25.0 <= bmi < 30.0:
            # OVERWEIGHT
            if activity == "Active":
                # Active + overweight → could be muscular, but generally
                # weight loss is recommended
                goal = np.random.choice(
                    ["Weight Loss", "Lean Muscle Gain"],
                    p=[0.7, 0.3]
                )
            else:
                goal = "Weight Loss"
        
        else:
            # OBESE (BMI >= 30)
            # Weight loss is recommended regardless of activity
            goal = "Weight Loss"
        
        # Apply noise — randomly flip 8% of labels
        if np.random.random() < NOISE_RATE:
            other_goals = [g for g in GOALS if g != goal]
            goal = np.random.choice(other_goals)
        
        data.append({
            "bmi": bmi,
            "activity_level": activity,
            "fitness_goal": goal
        })
    
    df = pd.DataFrame(data)
    
    # ── Print Report ──
    print("=" * 55)
    print("SYNTHETIC DATA GENERATION REPORT")
    print("=" * 55)
    print(f"Total rows generated: {len(df)}")
    print(f"Noise rate: {NOISE_RATE * 100}%")
    print(f"BMI distribution: mean={df['bmi'].mean():.1f}, "
          f"std={df['bmi'].std():.1f}, "
          f"min={df['bmi'].min():.1f}, max={df['bmi'].max():.1f}")
    print()
    print("Class distribution:")
    for goal in GOALS:
        count = len(df[df["fitness_goal"] == goal])
        pct = count / len(df) * 100
        print(f"  {goal:20s}: {count:4d} ({pct:5.1f}%)")
    print()
    print("Activity distribution:")
    for act in ACTIVITIES:
        count = len(df[df["activity_level"] == act])
        pct = count / len(df) * 100
        print(f"  {act:10s}: {count:4d} ({pct:5.1f}%)")
    
    # ── Save ──
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "synthetic_training_data.csv")
    df.to_csv(output_path, index=False)
    print(f"\nSaved to: {output_path}")
    print("=" * 55)
    
    return df


if __name__ == "__main__":
    generate()
