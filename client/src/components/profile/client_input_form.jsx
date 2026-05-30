import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import Header from "../layout/Header.jsx";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import "../../styles/client_input_form.css";

export default function ClientInputForm() {
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();

  const [showProfile, setShowProfile] = useState(false);

  // Form input states — pre-filled from existing user data
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [dietaryPreference, setDiet] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [fitnessGoal, setFitnessGoal] = useState("weightLoss");
  const [budget, setBudget] = useState("low");

  // Pre-fill form with existing Firestore data
  useEffect(() => {
    document.title = "Fit-Fuel - Client Input";

    if (userData) {
      if (userData.age) setAge(String(userData.age));
      if (userData.gender) setGender(userData.gender);
      if (userData.height) setHeight(String(userData.height));
      if (userData.weight) setWeight(String(userData.weight));
      if (userData.dietaryPreference) {
        // Handle both old format ("veg") and new format ("vegetarian")
        const dietMap = { "veg": "vegetarian" };
        setDiet(dietMap[userData.dietaryPreference] || userData.dietaryPreference);
      }
      if (userData.activityLevel) {
        // Handle both old format ("Sedentary") and new format ("sedentary")
        const actMap = { "Sedentary": "sedentary", "Moderate": "moderate", "Active": "active" };
        setActivityLevel(actMap[userData.activityLevel] || userData.activityLevel);
      }
      if (userData.fitnessGoal) {
        // Handle both old format ("Weight Loss") and new format ("weightLoss")
        const goalMap = { "Weight Loss": "weightLoss", "Bulking": "bulking", "Lean Muscle Gain": "leanMuscle" };
        setFitnessGoal(goalMap[userData.fitnessGoal] || userData.fitnessGoal);
      }
      if (userData.budget) setBudget(userData.budget);
    }
  }, [userData]);

  const handleSaveData = async () => {
    if (!user) {
      toast.error("Please log in first!");
      return;
    }

    if (!age || !gender || !height || !weight || !dietaryPreference || !activityLevel || !fitnessGoal || !budget) {
      toast.error("⚠️ Please fill in all required fields before continuing!");
      return;
    }

    const numericHeight = parseFloat(height);
    const numericWeight = parseFloat(weight);
    const heightMeters = numericHeight / 100;
    const bmi = numericWeight / (heightMeters * heightMeters);

    let bodyType = "";
    if (bmi < 18.5) bodyType = "Ectomorph";
    else if (bmi < 25) bodyType = "Mesomorph";
    else bodyType = "Endomorph";

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        age: parseInt(age),
        gender,
        height: numericHeight,
        weight: numericWeight,
        dietaryPreference: dietaryPreference,
        activityLevel: activityLevel,
        fitnessGoal: fitnessGoal,
        budget: budget.toLowerCase(),
        bmi: bmi.toFixed(2),
        bodyType: bodyType,
        profileCompleted: true,
      }, { merge: true });

      await refreshUserData();
      toast.success("✅ Data saved successfully!");
      navigate("/user_dashboard");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("❌ Failed to save data: " + (error.message || error));
    }
  };

  return (
    <div className="page-root">
      <div className="layout-container">
        <Header onViewProfile={() => setShowProfile(true)} />

        <div className="main_input_section">
          <h2>Personalize Your Plan</h2>
          <p>Tell us a bit about yourself to tailor your perfect vegetarian meal plan.</p>

          <h4 style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-secondary-dark)",
            marginBottom: "var(--space-3)",
            fontSize: "var(--text-xl)"
          }}>Basic Information</h4>

          <div className="form_elements">
            <input className="form-control small-input"
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required /><br />
            <label>
              <select
                className="form-select small-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)} required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <br /><br />

            <input
              className="form-control small-input"
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required />
            <br />

            <input
              className="form-control small-input"
              type="number"
              placeholder="Weight (Kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required />
            <br />

            <label>
              <select
                className="form-select small-input"
                value={dietaryPreference}
                onChange={(e) => setDiet(e.target.value)}
                required>
                <option value="">Select Dietary Preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="other">Other</option>
              </select>
            </label>

            <br /><br /><br />

            <h4 style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-secondary-dark)",
              marginBottom: "var(--space-3)",
              fontSize: "var(--text-xl)"
            }}>Activity Level</h4>

            <div className="form_elements activity-toggle">
              <label className="radio-option">
                <input type="radio" name="activityLevel" value="sedentary" checked={activityLevel === "sedentary"} onChange={(e) => setActivityLevel(e.target.value)} />
                Sedentary
              </label>
              <label className="radio-option">
                <input type="radio" name="activityLevel" value="moderate" checked={activityLevel === "moderate"} onChange={(e) => setActivityLevel(e.target.value)} />
                Moderate
              </label>
              <label className="radio-option">
                <input type="radio" name="activityLevel" value="active" checked={activityLevel === "active"} onChange={(e) => setActivityLevel(e.target.value)} />
                Active
              </label>
            </div><br /><br />

            <h4 style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-secondary-dark)",
              marginBottom: "var(--space-3)",
              fontSize: "var(--text-xl)"
            }}>Fitness Goal</h4>

            <div className="form_elements fitness-toggle">
              <label className="radio-option">
                <input type="radio" name="fitnessGoal" value="weightLoss" checked={fitnessGoal === "weightLoss"} onChange={(e) => setFitnessGoal(e.target.value)} />
                Weight Loss
              </label>
              <label className="radio-option">
                <input type="radio" name="fitnessGoal" value="bulking" checked={fitnessGoal === "bulking"} onChange={(e) => setFitnessGoal(e.target.value)} />
                Bulking
              </label>
              <label className="radio-option">
                <input type="radio" name="fitnessGoal" value="leanMuscle" checked={fitnessGoal === "leanMuscle"} onChange={(e) => setFitnessGoal(e.target.value)} />
                Lean Muscle Gain
              </label>
            </div><br /><br />

            <h4 style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-secondary-dark)",
              marginBottom: "var(--space-3)",
              fontSize: "var(--text-xl)"
            }}>Budget</h4>

            <div className="form_elements budget-toggle">
              <label className="radio-option">
                <input type="radio" name="budget" value="low" checked={budget === "low"} onChange={(e) => setBudget(e.target.value)} />
                Low
              </label>
              <label className="radio-option">
                <input type="radio" name="budget" value="medium" checked={budget === "medium"} onChange={(e) => setBudget(e.target.value)} />
                Medium
              </label>
              <label className="radio-option">
                <input type="radio" name="budget" value="high" checked={budget === "high"} onChange={(e) => setBudget(e.target.value)} />
                High
              </label>
            </div>
            <br /><br />

            <div className="generate-btn-container">
              <button className="btn btn-primary" onClick={handleSaveData}>
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile View Modal */}
      {showProfile && userData && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>👤 User Profile</h4>
            <p><strong>First Name:</strong> {userData.firstname}</p>
            <p><strong>Last Name:</strong> {userData.lastname}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <button className="btn btn-secondary" style={{ marginTop: '15px' }} onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
