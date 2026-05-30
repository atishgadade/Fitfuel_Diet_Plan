# FIT-FUEL: ML-Powered Personalized Diet Plan Recommendation System

## Technical Walkthrough

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [ML Pipeline — Detailed Breakdown](#4-ml-pipeline)
5. [Algorithms Used](#5-algorithms-used)
6. [NLP Macro Extraction Engine](#6-nlp-macro-extraction)
7. [Scientific Basis — Nutrition Calculations](#7-scientific-basis)
8. [Data Flow — End to End](#8-data-flow)
9. [Key Implementation Details](#9-key-implementation)
10. [Features](#10-features)
11. [API Documentation](#11-api-documentation)
12. [How to Run](#12-how-to-run)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Project Overview

FIT-FUEL is a full-stack web application that provides personalized vegetarian and vegan diet plan recommendations using machine learning. Unlike traditional diet apps that use simple rule-based filtering, FIT-FUEL employs a multi-layered ML pipeline that considers the user's body composition, activity level, fitness goals, dietary preferences, and budget to rank and recommend the most suitable complete meal plans.

Each recommendation includes:
- ML-validated goal prediction with confidence scoring
- Scientifically computed daily calorie and macronutrient targets
- Top 5 ranked meal plans with per-meal and per-plan nutrition breakdowns
- Multi-dimensional compatibility scoring (similarity, nutrition, budget, calorie match)

### What Makes This Different

| Traditional Diet App | FIT-FUEL |
|---|---|
| Rule-based filtering (if goal=X, show plan Y) | ML-powered ranking with cosine similarity |
| Static calorie charts | Dynamic BMR/TDEE computation with body-weight-based macros |
| No nutrition analysis of meals | NLP-based ingredient parsing with 100+ item nutrition database |
| Binary match (yes/no) | Multi-score fusion with weighted ranking |
| No goal validation | ML goal prediction model validates user's choice |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                        │
│  User inputs → Form validation → API call → Display      │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP POST /api/ml/recommend
┌────────────────────────▼─────────────────────────────────┐
│                  NODE.JS API GATEWAY                      │
│  Express server → CORS → Proxy to ML service             │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP POST /api/recommend
┌────────────────────────▼─────────────────────────────────┐
│              PYTHON FASTAPI ML SERVICE                     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              STARTUP (Pre-computation)               │ │
│  │  Load JSON → Parse Ingredients → Compute Nutrition  │ │
│  │  → Build Feature Vectors → Cache in Memory          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              PER-REQUEST PIPELINE                    │ │
│  │                                                      │ │
│  │  1. Input Validation (Pydantic)                     │ │
│  │  2. BMI Computation                                  │ │
│  │  3. Goal Prediction (Logistic Regression)           │ │
│  │  4. Calorie/Macro Targets (Mifflin-St Jeor)        │ │
│  │  5. Plan Filtering (Budget + Goal constraints)      │ │
│  │  6. Feature Vector Construction                      │ │
│  │  7. Cosine Similarity Ranking                       │ │
│  │  8. Multi-Score Fusion                              │ │
│  │  9. Response Construction                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Data Sources:                                            │
│  ├── data/veg_plans.json (27 vegetarian plans)           │
│  ├── data/vegan_plans.json (27 vegan plans)              │
│  └── nlp/nutrition_dictionary.py (100+ ingredients)      │
└──────────────────────────────────────────────────────────┘
```

### Why Microservice Architecture?

We separated the ML service from the Node.js backend because:
1. **Language optimization**: ML libraries (scikit-learn, numpy) are Python-native
2. **Independent scaling**: ML service can be scaled separately from the web server
3. **Isolation**: ML model updates don't require redeploying the entire application
4. **Pre-computation**: Python service pre-computes all plan nutrition at startup for fast responses

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | User interface, form handling, results display |
| Backend API | Node.js + Express | API gateway, authentication proxy, ML proxy |
| ML Service | Python + FastAPI | All ML computation, NLP extraction, recommendation |
| Database | Firebase Firestore | User profiles, authentication |
| Auth | Firebase Authentication | Email/password auth, password reset |
| ML Library | scikit-learn | Logistic Regression, Cosine Similarity, StandardScaler |
| Numerical | NumPy, Pandas | Feature vector construction, data manipulation |
| NLP | Custom regex parser | Ingredient string parsing ("50g oats" → structured data) |
| API Validation | Pydantic | Request/response schema validation |

---

## 4. ML Pipeline — Detailed Breakdown

### 4.1 Pre-computation Phase (Runs Once at Startup)

**File**: `fitfuel-ml-service/precompute/startup_engine.py`

At service startup, the engine performs heavy computation once so that per-request latency is minimal:

1. **Load Plans**: Reads `veg_plans.json` and `vegan_plans.json` from local files
2. **Parse Ingredients**: Every ingredient string in every meal of every plan is parsed
   - Example: `"50g oats"` → `{ingredient: "oats", serving_grams: 50}`
3. **Compute Nutrition**: Each ingredient is looked up in the 100+ item nutrition dictionary
   - Nutrition values are scaled from per-100g to actual serving size
   - Aggregated per-meal and per-plan
4. **Build Vectors**: An 8-dimensional feature vector is built for each plan
5. **Cache Everything**: All computed data stored in memory dictionaries

**Result**: 54 plans fully processed in ~1-2 seconds. Each subsequent request takes ~50-100ms.

### 4.2 Per-Request Pipeline

**File**: `fitfuel-ml-service/routes/recommend.py`

For each user request, the following pipeline executes:

#### Step 1: Input Validation
- Pydantic schema validates all fields (age, gender, weight, height, activity, goal, diet, budget)
- Type coercion and range checking

#### Step 2: BMI Computation
- Formula: `BMI = weight_kg / (height_m)²`
- Categorized: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (≥30)

#### Step 3: Goal Prediction (ML Model)
- **Algorithm**: Logistic Regression (scikit-learn)
- **Features**: [BMI_scaled, activity_level_encoded]
- **Training**: Bootstrapped from 1000 synthetic samples generated via domain rules
- **Purpose**: Validates user's selected goal against what the model predicts
- **Output**: Predicted goal + confidence percentage
- **Note**: User's selected goal is ALWAYS used for filtering (ML prediction is advisory only)

#### Step 4: Calorie & Macro Targets
- **BMR**: Mifflin-St Jeor equation (1990)
- **TDEE**: BMR × activity factor (FAO/WHO 2004)
- **Protein**: Body weight × goal-activity multiplier matrix
- **Fat**: Percentage of total calories (25% for cutting/lean, 30% for bulking)
- **Carbs**: Fill remaining calories

#### Step 5: Hard Constraint Filtering
- Budget filter: Low → only low plans; Medium → low+medium; High → all
- Goal filter: Only plans matching user's selected fitness goal
- String normalization handles format mismatches between frontend and dataset

#### Step 6: Feature Vector Construction
- **User vector**: [goal_onehot(3), budget_score(1), calorie_target(1), protein(1), carbs(1), fat(1)]
- **Plan vector**: [goal_onehot(3), budget_score(1), plan_calories(1), plan_protein(1), plan_carbs(1), plan_fat(1)]
- Both vectors are 8-dimensional with identical feature positions
- Numeric features (indices 3-7) are scaled using MinMaxScaler

#### Step 7: Cosine Similarity Ranking
- **Algorithm**: `sklearn.metrics.pairwise.cosine_similarity`
- Computes similarity between user vector and each plan vector
- Produces a similarity score between -1 and 1 (practically 0 to 1 for our vectors)

#### Step 8: Multi-Score Fusion
Four scores are computed per plan:
```
Final Score = 0.35 × Similarity
            + 0.30 × Nutrition Compatibility
            + 0.20 × Budget Compatibility
            + 0.15 × Calorie Match
```

- **Similarity**: From cosine similarity (Step 7)
- **Nutrition Compatibility**: Mathematical comparison of plan macros vs user targets
  - Weight Loss: penalizes excess calories, rewards high protein
  - Bulking: rewards meeting calorie target, rewards carbs
  - Lean Muscle: rewards balanced macros and protein
- **Budget Compatibility**: Exact match = 1.0, one level apart = 0.6, two levels = 0.2
- **Calorie Match**: `1 - |plan_calories - target_calories| / target_calories`

#### Step 9: Response Construction
Top 5 plans by final score are returned with:
- Complete meal details (breakfast, lunch, snack, dinner)
- Per-meal nutrition breakdown
- Plan-level nutrition totals
- Score breakdown showing each component
- User profile summary (BMI, calorie target, macro targets)
- Goal validation result

---

## 5. Algorithms Used

### 5.1 Logistic Regression — Goal Prediction

**Location**: `fitfuel-ml-service/models/goal_predictor.py`
**Training**: `fitfuel-ml-service/training/train_goal_model.py`

| Attribute | Value |
|---|---|
| Algorithm | sklearn.linear_model.LogisticRegression |
| Solver | lbfgs |
| Multi-class Strategy | multinomial |
| Class Weighting | balanced (handles imbalanced classes) |
| Features | BMI (scaled), Activity Level (label encoded) |
| Classes | Bulking, Lean Muscle Gain, Weight Loss |
| Training Data | 1000 synthetic samples from domain rules |
| Noise Rate | 8% (prevents overfitting to perfect rules) |
| Accuracy | >85% on test set |

**Why Logistic Regression?**
- Interpretable: We can explain predictions to users
- Fast inference: <1ms per prediction
- Works well with small, structured datasets
- Produces probability estimates (used as confidence score)
- No overfitting risk with regularization

**Why Not Deep Learning?**
- Only 2 input features — deep learning would overfit massively
- No complex patterns to learn — the relationship between BMI, activity, and goal is nearly linear
- Logistic Regression achieves >85% accuracy — sufficient for advisory predictions
- Explainability is more important than marginal accuracy improvement

### 5.2 Cosine Similarity — Plan Ranking

**Location**: `fitfuel-ml-service/models/plan_ranker.py`

| Attribute | Value |
|---|---|
| Algorithm | sklearn.metrics.pairwise.cosine_similarity |
| Vector Dimensionality | 8 |
| Scaling | MinMaxScaler on numeric features (indices 3-7) |
| Input | User vector vs each plan vector |
| Output | Similarity score 0-1 per plan |

**Why Cosine Similarity?**
- Works WITHOUT user interaction history (cold-start problem solved)
- Deterministic: same inputs always produce same ranking
- Fast: O(n×d) where n=plans, d=dimensions
- Measures DIRECTION similarity, not magnitude — ideal for comparing profiles
- No training required — uses feature geometry directly

**Feature Vector Design**:
```
Index 0-2: Goal one-hot encoding [is_bulking, is_weightloss, is_leanmuscle]
Index 3:   Budget score (ordinal: low=1, medium=2, high=3)
Index 4:   Calorie value (target for user, total for plan)
Index 5:   Protein grams (target for user, total for plan)
Index 6:   Carbs grams (target for user, total for plan)
Index 7:   Fat grams (target for user, total for plan)
```

### 5.3 Multi-Score Weighted Fusion — Final Ranking

**Location**: `fitfuel-ml-service/routes/recommend.py`

This is not a standard ML algorithm but a scoring model that combines multiple relevance signals:

```
Final = w₁·Similarity + w₂·NutritionCompat + w₃·BudgetCompat + w₄·CalorieMatch
```

Weights: w₁=0.35, w₂=0.30, w₃=0.20, w₄=0.15

**Why These Weights?**
- Similarity (0.35): Highest weight because it captures overall profile match
- Nutrition (0.30): Second because macro alignment directly impacts goal achievement
- Budget (0.20): Important constraint but secondary to nutritional fit
- Calorie (0.15): Supplementary signal — partially captured by nutrition score already

### 5.4 StandardScaler — Feature Scaling (Goal Prediction)

**Location**: `fitfuel-ml-service/training/train_goal_model.py`

Used to normalize BMI values before feeding into Logistic Regression.
BMI ranges from 15-45 while encoded activity is 0-2 — without scaling, BMI would dominate.

### 5.5 MinMaxScaler — Feature Scaling (Plan Ranking)

**Location**: `fitfuel-ml-service/preprocessing/feature_engineer.py`

Used to normalize numeric features (budget score, calorie values, macro values) to 0-1 range before cosine similarity computation. Without scaling, calorie values (~2000) would dominate budget values (1-3).

### 5.6 LabelEncoder — Categorical Encoding

**Location**: `fitfuel-ml-service/training/train_goal_model.py`

Converts categorical activity level ("Sedentary", "Moderate", "Active") to numeric (0, 1, 2) for model input.

---

## 6. NLP Macro Extraction Engine

**Location**: `fitfuel-ml-service/nlp/`

Since the diet plan dataset contains NO pre-computed nutrition data, we built a custom NLP pipeline to extract macronutrient information from ingredient lists.

### 6.1 Ingredient Parser

**File**: `nlp/ingredient_parser.py`

Parses quantity-embedded strings like `"50g oats"` or `"2 piece roti"` into structured data:

```python
Input:  "50g oats"
Output: {"ingredient": "oats", "quantity": 50, "unit": "g", "serving_grams": 50}

Input:  "2 piece roti"
Output: {"ingredient": "roti", "quantity": 2, "unit": "piece", "serving_grams": 80}
```

- Regex-based extraction: `r'^([\d./]+)\s*(g|piece|ml|cup|tbsp|tsp|...)\s+(.+)$'`
- Unit conversion: piece→grams using a lookup table (1 roti=40g, 1 idli=30g, etc.)
- Ingredient normalization: lowercase, remove adjectives, handle multi-word names

### 6.2 Nutrition Dictionary

**File**: `nlp/nutrition_dictionary.py`

A curated database of 100+ Indian vegetarian and vegan ingredients with nutrition values per 100g.

Values sourced from:
- USDA FoodData Central
- Indian Food Composition Tables (IFCT) by NIN Hyderabad
- Nutritionix verified data

Covers all ingredients in the dataset: grains (rice, oats, quinoa), legumes (dal, rajma, chole), dairy (paneer, curd, milk), nuts (almonds, walnuts, peanuts), vegetables, fruits, oils, and specialty items (tofu, tempeh, whey protein).

### 6.3 Macro Extractor

**File**: `nlp/macro_extractor.py`

Orchestrates the full extraction:
1. For each meal → parse all ingredients → look up nutrition → sum per meal
2. Sum all 4 meals → plan total
3. Compute macro percentages and analysis flags

---

## 7. Scientific Basis — Nutrition Calculations

**File**: `fitfuel-ml-service/models/calorie_engine.py`

Every nutritional calculation is grounded in peer-reviewed science:

### BMR — Mifflin-St Jeor Equation (1990)
```
Male:   BMR = 10×weight + 6.25×height - 5×age + 5
Female: BMR = 10×weight + 6.25×height - 5×age - 161
```
Source: Mifflin et al., American Journal of Clinical Nutrition, 51(2), 241-247

### TDEE — Activity Multipliers
Source: FAO/WHO/UNU (2004), Human Energy Requirements Report

### Protein — Body Weight Multiplier Matrix
Based on: ISSN Position Stand (Jager et al., 2017), Morton et al. (2018) meta-analysis, ACSM Guidelines (2016)

| Goal × Activity | Sedentary | Moderate | Active |
|---|---|---|---|
| Weight Loss | 1.2 g/kg | 1.4 g/kg | 1.6 g/kg |
| Lean Muscle | 1.2 g/kg | 1.5 g/kg | 1.7 g/kg |
| Bulking | 1.0 g/kg | 1.3 g/kg | 1.6 g/kg |

### Fat — Percentage of Total Calories
- Weight Loss: 25% (sufficient for hormones, leaves room for protein)
- Lean Muscle: 25% (balanced for body recomposition)
- Bulking: 30% (higher for testosterone optimization and calorie density)

Source: Dietary Guidelines for Americans 2020-2025, Iraki et al. (2019) JISSN

### Carbs — Fills Remaining Calories
Source: Institute of Medicine (2005) Dietary Reference Intakes, minimum 100g/day

---

## 8. Data Flow — End to End

```
User fills form in React
    ↓
React validates inputs client-side
    ↓
React sends POST /api/ml/recommend to Node.js (port 5000)
    ↓
Node.js Express proxy forwards to Python FastAPI (port 8000)
    ↓
FastAPI validates with Pydantic schema
    ↓
Pipeline: BMI → Goal Prediction → Calories → Filter → Rank → Score
    ↓
Response: user_profile + goal_validation + recommended_plans[] + metadata
    ↓
Node.js forwards response unchanged to React
    ↓
React stores in state: userProfile, goalValidation, recommendedPlans
    ↓
React renders: Profile Summary → Goal Badge → Plan Cards → Expandable Meals
```

---

## 9. Key Implementation Details

### 9.1 Cold Start Problem
Traditional recommendation systems need user history. We have none.
Solution: Content-based filtering using feature vectors — no interaction data needed.

### 9.2 Plan Integrity
Plans are NEVER flattened into individual meals. Each plan travels as a complete unit
(breakfast + lunch + snack + dinner) throughout the pipeline.

### 9.3 Pre-computation
All nutrition extraction and vector building happens ONCE at startup.
Per-request computation is arithmetic only — no I/O, no API calls.

### 9.4 String Normalization
The constraint filter normalizes 30+ variations of goal and budget strings
to handle format mismatches between frontend and dataset.

### 9.5 Fallback Strategy
If hard filtering removes all plans, the filter relaxes constraints and lets
ML ranking handle preference through scoring rather than elimination.

---

## 10. Features

### Current Features
- Personalized diet plan recommendation using ML
- Goal prediction with Logistic Regression
- Scientific macro computation (BMR/TDEE/body-weight-based macros)
- Content-based plan ranking with cosine similarity
- NLP-based nutrition extraction from ingredients
- Multi-score fusion ranking
- Expandable meal cards with per-meal nutrition
- Budget-aware filtering and scoring
- Goal validation with confidence scoring
- Firebase email/password authentication
- Password reset via Firebase
- Responsive UI design
- Profile management with activity level tracking

### Supported Goals
- Weight Loss (caloric deficit)
- Lean Muscle Gain (slight surplus)
- Bulking (significant surplus)

### Supported Diets
- Vegetarian (27 plans)
- Vegan (27 plans)

### Budget Levels
- Low (budget-friendly ingredients)
- Medium (moderate quality ingredients)
- High (premium ingredients)

---

## 11. API Documentation

### POST /api/recommend

**Request:**
```json
{
  "age": 25,
  "gender": "male",
  "weight_kg": 70,
  "height_cm": 175,
  "activity_level": "Moderate",
  "fitness_goal": "Weight Loss",
  "dietary_preference": "veg",
  "budget": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "user_profile": {
    "bmi": 22.9,
    "bmi_category": "Normal",
    "calorie_target": 2086.6,
    "macro_targets": { "protein_g": 98.0, "carbs_g": 270.5, "fat_g": 58.0 }
  },
  "goal_validation": {
    "user_selected": "Weight Loss",
    "ml_predicted": "Lean Muscle Gain",
    "confidence": 72.3,
    "match": false,
    "suggestion": "..."
  },
  "recommended_plans": [ ... top 5 plans with scores and nutrition ... ],
  "metadata": {
    "total_plans_in_database": 27,
    "plans_after_filtering": 6,
    "plans_returned": 5,
    "processing_time_ms": 85
  }
}
```

### GET /api/health
Returns service status, model load state, and plan count.

### POST /api/extract-macros
Standalone macro extraction for a single meal.

---

## 12. How to Run

### Prerequisites
- Node.js 16+
- Python 3.10+
- Firebase project with Authentication enabled

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd FitFuel

# 2. Install frontend dependencies
cd client
npm install

# 3. Install backend dependencies
cd ../server
npm install

# 4. Install ML service dependencies
cd ../fitfuel-ml-service
pip install -r requirements.txt

# 5. Train the ML model (first time only)
python training/generate_synthetic_data.py
python training/train_goal_model.py

# 6. Configure environment variables
# Copy .env.example to .env in each directory and fill in values

# 7. Start all services
# Terminal 1: ML Service
cd fitfuel-ml-service
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: Node.js Backend
cd server
npm start

# Terminal 3: React Frontend
cd client
npm start
```

---

## 13. Future Enhancements

### Short-term
- **User feedback loop**: Let users rate recommended plans → train a collaborative filtering model
- **Meal swapping**: Allow users to swap individual meals within a plan while maintaining nutritional balance
- **Grocery list generation**: Auto-generate shopping list from recommended plan ingredients
- **Weekly plan rotation**: Recommend 7-day plan cycles instead of single-day plans

### Medium-term
- **Collaborative filtering**: Once user ratings accumulate, implement matrix factorization (SVD) for hybrid recommendations
- **Allergy/intolerance filtering**: Add hard filters for nuts, gluten, soy, lactose
- **Regional cuisine preference**: Weight plans toward user's preferred cuisine style
- **Progressive overload nutrition**: Adjust macros week-over-week as user reports progress

### Long-term
- **Computer vision meal logging**: User photographs their meal → CNN identifies food items → auto-logs nutrition
- **Reinforcement learning**: Optimize meal recommendations over time based on user adherence and body composition changes
- **Biomarker integration**: Connect with wearable devices (smart scales, fitness trackers) for real-time TDEE adjustment
- **Generative meal plans**: Use LLMs to generate novel meal combinations that meet exact macro targets

---

## Project Structure

```
FitFuel/
├── client/                 React frontend
├── server/                 Node.js API gateway
├── fitfuel-ml-service/     Python ML microservice
│   ├── models/             ML models and computation engines
│   ├── preprocessing/      Data loading, filtering, feature engineering
│   ├── nlp/                Ingredient parsing and nutrition extraction
│   ├── precompute/         Startup pre-computation engine
│   ├── training/           Model training pipeline
│   ├── artifacts/          Trained model files (.pkl)
│   ├── data/               Diet plan datasets (.json)
│   ├── routes/             API endpoints
│   ├── schemas/            Request/response validation
│   └── utils/              Helpers and exceptions
└── docs/                   Documentation
```

---

*Built as an academic mini-project demonstrating applied machine learning in nutrition science.*
