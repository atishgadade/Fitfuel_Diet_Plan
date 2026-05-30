import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import workoutData from "../data/workout_data.json";

/**
 * Matches user profile to a template_id based on activityLevel and age.
 * Logic based on workout_data.json structure.
 */
export const getTemplateIdForUser = (userData) => {
  if (!userData) return null;

  const age = parseInt(userData.age);
  const activityLevel = userData.activityLevel?.toLowerCase() || "sedentary";

  let ageGroup = "";
  if (age <= 10) ageGroup = "0-10";
  else if (age <= 20) ageGroup = "11-20";
  else if (age <= 40) ageGroup = "21-40"; // Maps to 21-30, 31-40
  else if (age <= 60) ageGroup = "41-60"; // Maps to 41-50, 51-60
  else ageGroup = "61-70+";

  // Refined mapping logic based on workout_data.json template_ids
  if (ageGroup === "0-10") {
    return `youth_0_10_${activityLevel}`;
  } else if (ageGroup === "11-20") {
    return `teens_11_20_${activityLevel}`;
  } else if (ageGroup === "21-40") {
    return `adult_21_40_${activityLevel}`;
  } else if (ageGroup === "41-60") {
    return `adult_41_60_${activityLevel}`;
  } else {
    return `senior_61_70_${activityLevel}`;
  }
};

/**
 * Fetches the workout template details from Firestore or falls back to local JSON.
 */
export const fetchWorkoutTemplate = async (templateId) => {
  try {
    // Try Firestore first
    const docRef = doc(db, "workout_templates", templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Firestore fetch failed, falling back to local JSON:", error);
  }

  // Fallback to local JSON
  const template = workoutData.find(t => t.template_id === templateId);
  return template || null;
};
