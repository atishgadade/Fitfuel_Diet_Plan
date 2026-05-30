const express = require('express');
const router = express.Router();
const axios = require('axios');

// Map directly to FastAPI microservice
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Mock Auth Validator Middleware
const validateJWT = (req, res, next) => {
    // In production: admin.auth().verifyIdToken(req.headers.authorization...)
    req.user = { uid: "test_user_validated" };
    next();
};

router.post('/recommend', validateJWT, async (req, res) => {
    try {
        const payload = req.body;

        // Ensure payload shape matches ML Service expectations 
        // Note: The new frontend should post { user_profile, filtered_plans } directly if migrated,
        // If not, we map it here. Assuming Frontend posts directly now:
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/recommend`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // NLP extraction can take time if cache misses
        });

        res.json(mlResponse.data);

    } catch (error) {
        console.error("Error in /api/ml/recommend Gateway Proxy:", error.message);
        if (error.response) {
            // Forward ML Service error
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(503).json({
            error: "ML service unavailable",
            message: "Recommendation engine is temporarily unavailable. Please try again later."
        });
    }
});

router.post('/extract-macros', validateJWT, async (req, res) => {
    try {
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/extract-macros`, req.body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        res.json(mlResponse.data);
    } catch (error) {
        console.error("Error in /api/ml/extract-macros Proxy:", error.message);
        res.status(503).json({ error: 'ML Microservice Unavailable' });
    }
});

router.get('/health', async (req, res) => {
    try {
        const mlResponse = await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 3000 });
        res.json(mlResponse.data);
    } catch (error) {
        res.status(503).json({ status: "Gateway Active", ml_service: "Offline" });
    }
});

module.exports = router;
