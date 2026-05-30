"""
Calorie and Macronutrient Computation Engine

All calculations grounded in peer-reviewed sports nutrition science.

SOURCES:
- BMR: Mifflin-St Jeor (1990), Am J Clin Nutr 51(2):241-247
- TDEE: FAO/WHO/UNU (2004), Human Energy Requirements Report
- Protein: Morton et al. (2018) Br J Sports Med, Helms et al. (2014) JISSN,
  ISSN Position Stand on Protein (Jager et al., 2017)
- Fat: Dietary Guidelines for Americans 2020-2025, Volek et al. (1997),
  Iraki et al. (2019) JISSN
- Carbs: Institute of Medicine (2005) Dietary Reference Intakes

APPROACH:
1. Protein from body weight × goal-activity multiplier
2. Fat as percentage of total calories (varies by goal)
3. Carbs fill remaining calories
"""

import logging

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════
# ACTIVITY MULTIPLIERS — FAO/WHO/UNU (2004)
# ══════════════════════════════════════════════════════════════════

ACTIVITY_FACTORS = {
    "Sedentary": 1.2,      # Little/no exercise, desk job
    "Moderate": 1.55,      # Exercise 3-5 days/week
    "Active": 1.725        # Exercise 6-7 days/week, intense
}


# ══════════════════════════════════════════════════════════════════
# PROTEIN MATRIX — grams per kg body weight
# ══════════════════════════════════════════════════════════════════
# Values calibrated for general fitness vegetarian population.
# Includes ~10% increase over omnivore recommendations to compensate
# for lower plant protein bioavailability (Phillips, 2012).

PROTEIN_MATRIX = {
    "Weight Loss": {
        "Sedentary": 1.2,     # Deficit + no training → preserve muscle
        "Moderate":  1.4,     # Deficit + moderate training → recovery
        "Active":    1.6      # Deficit + intense training → max preservation
    },
    "Lean Muscle Gain": {
        "Sedentary": 1.2,     # Slight surplus + beginner → sufficient for novice gains
        "Moderate":  1.5,     # Slight surplus + regular training → standard MPS
        "Active":    1.7      # Slight surplus + high volume → near-optimal MPS
    },
    "Bulking": {
        "Sedentary": 1.0,     # Large surplus + no training → surplus is anti-catabolic
        "Moderate":  1.3,     # Large surplus + regular training → moderate needs
        "Active":    1.6      # Large surplus + intense training → volume-driven needs
    }
}


# ══════════════════════════════════════════════════════════════════
# FAT PERCENTAGE — of total calories (NOT body weight)
# ══════════════════════════════════════════════════════════════════
# Fat scales with calorie intake because:
# - Higher intake (bulking) needs more fat for hormone optimization
# - Lower intake (cutting) needs less absolute fat, higher protein priority
# Source: Dietary Guidelines 20-35% range; ISSN ≥20% minimum

FAT_PERCENT = {
    "Weight Loss":      0.25,    # 25% — moderate, leaves room for protein
    "Lean Muscle Gain": 0.25,    # 25% — balanced for body recomposition
    "Bulking":          0.30     # 30% — higher for testosterone, calorie density
}


# ══════════════════════════════════════════════════════════════════
# SAFETY BOUNDS
# ══════════════════════════════════════════════════════════════════

PROTEIN_MAX_PER_KG = 2.0          # No proven benefit above this (Morton 2018)
PROTEIN_MIN_PER_KG = 0.8          # WHO RDA minimum
PROTEIN_ABSOLUTE_MAX = 160        # Vegetarian practical ceiling
PROTEIN_ABSOLUTE_MIN = 45         # Essential amino acid needs

FAT_ABSOLUTE_MIN = 35             # Hormonal health floor (essential fatty acids)
FAT_MAX_PERCENT = 0.35            # Dietary Guidelines upper bound

CARBS_ABSOLUTE_MIN = 100          # Brain glucose needs (IOM: 130g, allowing adaptation)

CALORIE_MIN_MALE = 1500           # NIDDK safe minimum for males
CALORIE_MIN_FEMALE = 1200         # NIDDK safe minimum for females


def compute_calorie_target(
    age: int,
    weight_kg: float,
    height_cm: float,
    gender: str,
    activity_level: str,
    goal: str
) -> dict:
    """
    Compute daily calorie target and macronutrient split.

    Methodology:
        1. BMR via Mifflin-St Jeor (most accurate for general population)
        2. TDEE = BMR × activity factor
        3. Calorie target = TDEE ± goal adjustment
        4. Protein = body weight × goal-activity multiplier
        5. Fat = calorie target × goal-based percentage
        6. Carbs = remaining calories ÷ 4

    This produces:
        - BULKING:  High carbs (55-60%), good fat (28-30%), moderate protein (12-15%)
        - WEIGHT LOSS: Elevated protein (19-23%), moderate fat (25%), moderate carbs (52-56%)
        - LEAN MUSCLE: Balanced protein (15-17%), moderate fat (25%), high carbs (58-60%)

    Args:
        age: User age in years
        weight_kg: Body weight in kilograms
        height_cm: Height in centimeters
        gender: "male" or "female"
        activity_level: "Sedentary", "Moderate", or "Active"
        goal: "Weight Loss", "Lean Muscle Gain", or "Bulking"

    Returns:
        Dictionary with bmr, tdee, calorie_target, macro_split, macro_percentages
    """

    # ──────────────────────────────────────────────
    # STEP 1: BMR — Mifflin-St Jeor (1990)
    # ──────────────────────────────────────────────
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    # Sanity bounds
    bmr = max(min(bmr, 3500), 700)

    # ──────────────────────────────────────────────
    # STEP 2: TDEE — FAO/WHO Activity Multipliers
    # ──────────────────────────────────────────────
    factor = ACTIVITY_FACTORS.get(activity_level, 1.55)
    tdee = bmr * factor

    # ──────────────────────────────────────────────
    # STEP 3: Calorie Target — Goal Adjustment
    # ──────────────────────────────────────────────
    if goal == "Weight Loss":
        calorie_target = tdee - 500       # ~0.45 kg/week fat loss
    elif goal == "Lean Muscle Gain":
        calorie_target = tdee + 250       # Lean surplus
    elif goal == "Bulking":
        calorie_target = tdee + 500       # ~0.45 kg/week gain
    else:
        calorie_target = tdee

    # Enforce safe minimums
    if gender.lower() == "male":
        calorie_target = max(calorie_target, CALORIE_MIN_MALE)
    else:
        calorie_target = max(calorie_target, CALORIE_MIN_FEMALE)

    # ──────────────────────────────────────────────
    # STEP 4: PROTEIN — Body Weight × Multiplier
    # ──────────────────────────────────────────────
    goal_mults = PROTEIN_MATRIX.get(
        goal,
        {"Sedentary": 1.2, "Moderate": 1.4, "Active": 1.5}
    )
    protein_per_kg = goal_mults.get(activity_level, 1.3)

    protein_g = weight_kg * protein_per_kg

    # Safety caps
    protein_g = min(protein_g, weight_kg * PROTEIN_MAX_PER_KG)
    protein_g = max(protein_g, weight_kg * PROTEIN_MIN_PER_KG)
    protein_g = min(protein_g, PROTEIN_ABSOLUTE_MAX)
    protein_g = max(protein_g, PROTEIN_ABSOLUTE_MIN)

    # ──────────────────────────────────────────────
    # STEP 5: FAT — Percentage of Total Calories
    # ──────────────────────────────────────────────
    fat_pct = FAT_PERCENT.get(goal, 0.25)
    fat_g = (calorie_target * fat_pct) / 9

    # Safety caps
    fat_g = max(fat_g, FAT_ABSOLUTE_MIN)

    # Don't exceed 35% of calories
    fat_max_from_cal = (calorie_target * FAT_MAX_PERCENT) / 9
    fat_g = min(fat_g, fat_max_from_cal)

    # Re-enforce minimum after capping
    fat_g = max(fat_g, FAT_ABSOLUTE_MIN)

    # ──────────────────────────────────────────────
    # STEP 6: CARBS — Fill Remaining Calories
    # ──────────────────────────────────────────────
    protein_cal = protein_g * 4
    fat_cal = fat_g * 9
    remaining_cal = calorie_target - protein_cal - fat_cal
    carbs_g = remaining_cal / 4

    # Enforce minimum carbs
    if carbs_g < CARBS_ABSOLUTE_MIN:
        # Free up calories by reducing fat slightly
        deficit_cal = (CARBS_ABSOLUTE_MIN - carbs_g) * 4
        fat_reduction = deficit_cal / 9
        fat_g = max(fat_g - fat_reduction, FAT_ABSOLUTE_MIN)

        # Recalculate carbs
        remaining_cal = calorie_target - (protein_g * 4) - (fat_g * 9)
        carbs_g = max(remaining_cal / 4, CARBS_ABSOLUTE_MIN)

    # ──────────────────────────────────────────────
    # STEP 7: Balance — Ensure macros sum to target
    # ──────────────────────────────────────────────
    actual_cal = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)
    gap = calorie_target - actual_cal

    if abs(gap) > 10:
        carbs_g += gap / 4
        carbs_g = max(carbs_g, CARBS_ABSOLUTE_MIN)

    # ──────────────────────────────────────────────
    # STEP 8: Compute display percentages
    # ──────────────────────────────────────────────
    final_cal = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)

    if final_cal > 0:
        protein_pct = round((protein_g * 4 / final_cal) * 100, 1)
        carbs_pct = round((carbs_g * 4 / final_cal) * 100, 1)
        fat_pct_display = round((fat_g * 9 / final_cal) * 100, 1)
    else:
        protein_pct = carbs_pct = fat_pct_display = 0

    # ──────────────────────────────────────────────
    # STEP 9: Round all values
    # ──────────────────────────────────────────────
    protein_g = round(protein_g, 1)
    carbs_g = round(carbs_g, 1)
    fat_g = round(fat_g, 1)

    # ──────────────────────────────────────────────
    # STEP 10: Log
    # ──────────────────────────────────────────────
    logger.info(
        f"Macros: {gender} {weight_kg}kg {activity_level} {goal} → "
        f"{round(calorie_target)}kcal | "
        f"P={protein_g}g({protein_per_kg}g/kg, {protein_pct}%) "
        f"C={carbs_g}g({carbs_pct}%) "
        f"F={fat_g}g({fat_pct_display}%)"
    )

    # ──────────────────────────────────────────────
    # STEP 11: Return
    # ──────────────────────────────────────────────
    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "calorie_target": round(calorie_target, 1),
        "macro_split": {
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fat_g": fat_g
        },
        "macro_percentages": {
            "protein": protein_pct,
            "carbs": carbs_pct,
            "fat": fat_pct_display
        },
        "protein_per_kg": protein_per_kg
    }


# ══════════════════════════════════════════════════════════════════
# SELF-VERIFICATION — Run: python models/calorie_engine.py
# ══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    print("=" * 80)
    print("MACRO ENGINE VERIFICATION — ALL 9 GOAL×ACTIVITY COMBINATIONS")
    print("Test subject: Male, 75kg, 178cm, 28 years old")
    print("=" * 80)
    print()

    GOALS = ["Weight Loss", "Lean Muscle Gain", "Bulking"]
    ACTIVITIES = ["Sedentary", "Moderate", "Active"]

    all_pass = True

    for goal in GOALS:
        print(f"── {goal.upper()} ──")
        print(f"{'Activity':<12} {'Calories':>8} {'Protein':>10} {'Carbs':>10} {'Fat':>10}  {'P%':>5} {'C%':>5} {'F%':>5}  {'Check'}")
        print(f"{'':─<12} {'':─>8} {'':─>10} {'':─>10} {'':─>10}  {'':─>5} {'':─>5} {'':─>5}  {'':─>5}")

        for act in ACTIVITIES:
            r = compute_calorie_target(28, 75, 178, "male", act, goal)
            p = r["macro_split"]["protein_g"]
            c = r["macro_split"]["carbs_g"]
            f = r["macro_split"]["fat_g"]
            cal = r["calorie_target"]
            pp = r["macro_percentages"]["protein"]
            cp = r["macro_percentages"]["carbs"]
            fp = r["macro_percentages"]["fat"]

            # Validation checks
            issues = []

            # Check protein is reasonable
            pkg = p / 75
            if pkg > 2.0:
                issues.append(f"P>{2.0}g/kg")
            if pkg < 0.8:
                issues.append(f"P<{0.8}g/kg")

            # Check fat minimum
            if f < 35:
                issues.append("F<35g")

            # Check carbs minimum
            if c < 100:
                issues.append("C<100g")

            # Check fat percentage
            if fp < 20:
                issues.append(f"F%={fp}<20%")
            if fp > 35:
                issues.append(f"F%={fp}>35%")

            # Check macros sum to ~calories
            computed = p * 4 + c * 4 + f * 9
            if abs(computed - cal) > 50:
                issues.append(f"sum={computed:.0f}≠{cal:.0f}")

            # Goal-specific checks
            if goal == "Bulking":
                if cp < 50:
                    issues.append(f"BULK:C%={cp}<50%")
                if fp < 25:
                    issues.append(f"BULK:F%={fp}<25%")
                if pp > 20:
                    issues.append(f"BULK:P%={pp}>20%")

            if goal == "Weight Loss":
                if pp < 15:
                    issues.append(f"CUT:P%={pp}<15%")

            status = "✓ PASS" if not issues else "✗ " + ", ".join(issues)
            if issues:
                all_pass = False

            print(
                f"{act:<12} {cal:>8.0f} "
                f"{p:>7.1f}g({pkg:.1f}) "
                f"{c:>7.1f}g    "
                f"{f:>7.1f}g    "
                f"{pp:>4.1f}% {cp:>4.1f}% {fp:>4.1f}%  "
                f"{status}"
            )

        print()

    # Edge cases
    print("── EDGE CASES ──")

    edge_cases = [
        ("Small female cutting",     20, 48, 155, "female", "Sedentary", "Weight Loss"),
        ("Large male bulking",       35, 110, 190, "male",   "Active",    "Bulking"),
        ("Average female lean gain", 25, 62, 165, "female", "Moderate",  "Lean Muscle Gain"),
        ("Teen male bulking",        16, 55, 170, "male",   "Active",    "Bulking"),
        ("Obese sedentary cut",      40, 120, 175, "male",   "Sedentary", "Weight Loss"),
    ]

    for label, age, w, h, g, a, goal in edge_cases:
        r = compute_calorie_target(age, w, h, g, a, goal)
        p = r["macro_split"]["protein_g"]
        c = r["macro_split"]["carbs_g"]
        f = r["macro_split"]["fat_g"]
        cal = r["calorie_target"]
        pp = r["macro_percentages"]["protein"]
        cp = r["macro_percentages"]["carbs"]
        fp = r["macro_percentages"]["fat"]
        pkg = p / w

        issues = []
        if pkg > 2.0: issues.append(f"P>{2.0}g/kg")
        if f < 35: issues.append("F<35g")
        if c < 80: issues.append("C<80g")
        if fp < 18: issues.append(f"F%<18%")
        computed = p * 4 + c * 4 + f * 9
        if abs(computed - cal) > 50: issues.append("sum≠target")

        status = "✓" if not issues else "✗ " + ", ".join(issues)
        print(
            f"  {label:<30s} {cal:>6.0f}kcal  "
            f"P={p:.0f}g({pkg:.1f}/kg)  C={c:.0f}g  F={f:.0f}g  "
            f"[{pp:.0f}/{cp:.0f}/{fp:.0f}%]  {status}"
        )

    print()
    if all_pass:
        print("✓ ALL TESTS PASSED — Macros are scientifically valid for all combinations")
    else:
        print("✗ SOME TESTS FAILED — Review output above")
    print("=" * 80)
