# Fit-Fuel-ML

A hybrid plan-recommender that replaces rule-based filtering with plan-level ML while preserving our Firebase schema.

## Monorepo Layout
- `/frontend` - React Vite app using Chakra UI.
- `/server` - Express API Gateway validating JWT, processing hard filters against Firestore, and communicating with ML backend.
- `/ml-service` - FastAPI implementation performing ML ranking and inference. Evaluates Macro NLP values, constructs Cosine distance metrics over weighted attribute vectors.
- `/scripts` - Utilities such as old script `uploadDietPlans.js` and JSON data.

## Getting Started

1. Set up `.env` from `.env.example`.
2. In `server/`, run `npm install` and `npm start`.
3. In `ml-service/`, install Python 3.10+, run `pip install -r requirements.txt` and `uvicorn main:app --reload`.
4. In `frontend/`, run `npm i` and `npm run dev`.

## Explainable AI: Weights Justification
The ranking (`ml-service/services/ranker.py`) model uses normalized vectors based on cosine similarity, calorie deviations, macro-alignment, and budget penalties. The weights are passed via `WEIGHTS_JSON`:
- **`sim` (0.40):** 40% overarching feature match via cosine similarity (provides context to vector alignment).
- **`nutrition` (0.30):** 30% nutrition alignment guarantees macronutrient ratios directly align with physiological goals (such as high protein for weight loss vs carbs for bulking).
- **`penalty` (0.20):** 20% budget deviation imposes hard financial constraints on recommendations keeping user expectations intact.
- **`dev` (0.10):** 10% calorie deviation minimizes under/over-feeding against predicted BMR requirements.

## Example Request
`cURL` the Gateway (Server checks Firebase, merges documents, then ML endpoint provides scores):

```sh
curl -X POST http://localhost:4000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "height_cm": 180,
    "weight_kg": 80,
    "age": 28,
    "sex": "M",
    "activity_level": "moderate",
    "goal": "weight_loss",
    "diet_pref": "veg",
    "budget_tier": "medium"
  }'
```
"# Fit-Fuel" 
