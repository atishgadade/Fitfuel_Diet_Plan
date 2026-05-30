
import vegPlans from '../data/veg_plans.json';
import veganPlans from '../data/vegan_plans.json';

/**
 * Service to handle diet plan data operations
 */
export const dietService = {
    /**
     * Calculate BMR and TDEE based on user stats
     * @param {Object} user - User data object
     * @returns {Object} - { bmr, tdee, targetCalories, goal }
     */
    calculateCalories: (user) => {
        if (!user || !user.weight || !user.height || !user.age || !user.gender || !user.activityLevel) {
            return null;
        }

        const weight = parseFloat(user.weight);
        const height = parseFloat(user.height); // cm
        const age = parseFloat(user.age);
        const gender = user.gender.toLowerCase();
        const activityLevel = user.activityLevel.toLowerCase();
        const fitnessGoal = user.fitnessGoal ? user.fitnessGoal.toLowerCase() : 'weightloss';

        // 1. Calculate BMR (Mifflin-St Jeor Equation)
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // 2. Calculate TDEE (Total Daily Energy Expenditure)
        const activityMultipliers = {
            'sedentary': 1.2,
            'moderate': 1.375,
            'active': 1.55
        };
        const multiplier = activityMultipliers[activityLevel] || 1.2;
        const tdee = bmr * multiplier;

        // 3. Adjust for Fitness Goal
        let targetCalories = tdee;
        if (fitnessGoal === 'weightloss') {
            targetCalories -= 500;
        } else if (fitnessGoal === 'bulking') {
            targetCalories += 500;
        } else if (fitnessGoal === 'leanmuscle') {
            targetCalories += 250;
        }

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            goal: fitnessGoal
        };
    },

    /**
     * Get diet plan based on user criteria
     * @param {Object} criteria - User criteria for filtering
     * @param {string} criteria.dietaryPreference - 'veg' or 'vegan'
     * @param {string} criteria.bodyType - 'ectomorph', 'mesomorph', or 'endomorph'
     * @param {string} criteria.fitnessGoal - 'weightLoss', 'leanMuscle', or 'bulking'
     * @param {string} criteria.activityLevel - User's activity level
     * @returns {Object|null} - Matching diet plan or null
     */
    getPlan: (criteria) => {
        const { dietaryPreference, bodyType, fitnessGoal, activityLevel, budget } = criteria;

        // Select the appropriate dataset
        const dataset = dietaryPreference === 'vegan' ? veganPlans : vegPlans;

        // Step 1: Score each plan based on criteria
        const scoredPlans = dataset.map(plan => {
            let score = 0;

            // Priority 1: Physical constraints (Body Type) - Critical
            if (plan.bodyType.toLowerCase() === bodyType.toLowerCase()) {
                score += 10;
            }

            // Priority 2: Fitness Goal - Critical
            if (plan.fitnessGoal.toLowerCase() === fitnessGoal.toLowerCase()) {
                score += 10;
            }

            // Priority 3: Activity Level - Important for calorie needs
            if (plan.activityLevelSupport.map(al => al.toLowerCase()).includes(activityLevel.toLowerCase())) {
                score += 5;
            }

            // Priority 4: Budget - Preference
            // Check if lunch budget matches (assuming consistency across meals)
            const planBudget = plan.plan?.lunch?.budget?.toLowerCase();
            if (planBudget === budget.toLowerCase()) {
                score += 3;
            }

            return { plan, score };
        });

        // Step 2: Sort by score (descending)
        scoredPlans.sort((a, b) => b.score - a.score);

        // Step 3: Return the highest scoring plan (if it meets a minimum threshold, e.g., matches at least one critical criteria)
        // For now, we return the absolute best match found.
        const bestMatch = scoredPlans[0];

        // Debugging log (optional, remove in production)
        console.log(`Best match score: ${bestMatch?.score} for budget: ${budget}`);

        return bestMatch?.score > 0 ? bestMatch.plan : null;
    }
};
