const express = require('express');
const router = express.Router();
const axios = require('axios');
const { loadCollection, budgetFilter } = require('../utils/filters');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

function calculateBMI(height_cm, weight_kg) {
    const h_m = height_cm / 100;
    return weight_kg / (h_m * h_m);
}

// Map Activity and Body Type
const activityFactors = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725
};

const budgetScores = {
    low: 1,
    medium: 2,
    high: 3
};

// Mock Auth Validator Middleware
const validateJWT = (req, res, next) => {
    // In production: admin.auth().verifyIdToken(req.headers.authorization...)
    req.user = { uid: "test_user" };
    next();
};

router.post('/recommend', validateJWT, async (req, res) => {
    try {
        const { height_cm, weight_kg, age, sex, activity_level, goal, diet_pref, budget_tier } = req.body;

        const bmi = calculateBMI(height_cm, weight_kg);

        // 1. Fetch from Firestore via filters
        let allPlans = await loadCollection(diet_pref);

        // 2. Budget filter
        let filteredPlans = budgetFilter(allPlans, budget_tier);

        // Map inputs for ML
        const user_profile = {
            sex,
            age: parseInt(age),
            height: parseFloat(height_cm),
            weight: parseFloat(weight_kg),
            activity_factor: activityFactors[activity_level] || 1.2,
            activity_level,
            goal,
            budget_score: budgetScores[budget_tier],
            calorie_target: 2000 // Just a fallback, ML service calculates it too, but ranker requires BMR. The prompt mentioned "cal_target = BMR..." in ranker, and passing profile to ranker.
        };

        // 3. Call ML Service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/recommend`, {
            user_profile,
            filtered_plans: filteredPlans
        }, { timeout: 55000 });

        // 4. Enrich/Format for client 
        const rankedPlans = mlResponse.data.ranked.map(planRanking => {
            // Find full plan to merge back macros, meals, etc.
            const fullPlanMeta = filteredPlans.find(p => p.plan_id === planRanking.plan_id);
            return {
                ...planRanking,
                plan_name: fullPlanMeta?.plan_name || 'Unnamed Plan',
                meals: fullPlanMeta?.meals || []
            };
        });

        res.json({ ranked: rankedPlans });

    } catch (error) {
        console.error("Error in /recommend Gateway:", error.message);
        res.status(500).json({ error: 'Internal Gateway Error' });
    }
});

router.post('/explain', async (req, res) => {
    // Endpoints for SHAP explanations stub
    res.json({ message: "Future endpoint for SHAP explanations", feature_importance: {} });
});

module.exports = router;
