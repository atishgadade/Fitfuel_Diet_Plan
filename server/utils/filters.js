const admin = require('firebase-admin');

async function loadCollection(diet_pref) {
    const db = admin.firestore();
    let plans = [];

    // veg optionally union vegan
    const collections = diet_pref === 'vegan' ? ['vegan_plans'] : ['veg_plans', 'vegan_plans'];

    for (const col of collections) {
        const snapshot = await db.collection(col).get();
        snapshot.forEach(doc => {
            const planData = doc.data();
            plans.push({
                plan_id: doc.id,
                ...planData
            });
        });
    }
    return plans;
}

function budgetFilter(plans, tier) {
    const maxScoreMap = { low: 1, medium: 1.5, high: 3 };
    const maxScore = maxScoreMap[tier] || 3;

    const labelToNum = { low: 1, medium: 2, high: 3 };

    return plans.filter(p => {
        const meals = p.meals || [];
        if (meals.length === 0) return true;

        let totalScore = 0;
        meals.forEach(m => {
            totalScore += labelToNum[(m.budget_label || '').toLowerCase()] || 3;
        });
        const plan_score = totalScore / meals.length;
        p.plan_budget_score = plan_score;
        return plan_score <= maxScore;
    });
}

module.exports = {
    loadCollection,
    budgetFilter
};
