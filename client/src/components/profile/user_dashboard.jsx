import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import "../../styles/user_dashboard.css";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import Header from "../layout/Header.jsx";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { userData, refreshUserData, handleLogout, handleDeleteAccount } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleViewProfile = () => {
    setFormData(userData);
    setIsEditing(false);
    setError("");
    setShowProfile(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated.");

      const userRef = doc(db, "users", currentUser.uid);

      const updated = {
        firstname: formData.firstname || "",
        lastname: formData.lastname || "",
        age: formData.age ? Number(formData.age) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        gender: formData.gender || "",
        dietaryPreference: formData.dietaryPreference || "",
        fitnessGoal: formData.fitnessGoal || "",
        activityLevel: formData.activityLevel || "",
        budget: formData.budget || "low",
        height: formData.height ? Number(formData.height) : null,
        bmi: (formData.weight && formData.height)
          ? (formData.weight / ((formData.height / 100) * (formData.height / 100))).toFixed(2)
          : userData?.bmi,
      };

      let newBodyType = userData?.bodyType;
      if (updated.bmi) {
        const bmiVal = parseFloat(updated.bmi);
        if (bmiVal < 18.5) newBodyType = "Ectomorph";
        else if (bmiVal < 25) newBodyType = "Mesomorph";
        else newBodyType = "Endomorph";
      }
      updated.bodyType = newBodyType;

      await updateDoc(userRef, updated);
      await refreshUserData();

      setIsEditing(false);
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfile(false);
    setIsEditing(false);
    setFormData(null);
    setError("");
  };

  return (
    <div className="page-root">
      <div className="layout-container">
        <Header onViewProfile={handleViewProfile} />

        <div className="main-dashboard-section">
          <h1 className="dashboard-welcome">
            {userData ? `Welcome, ${userData.firstname}` : "Loading..."}
          </h1>

          <div className="dashboard-subtitle">
            Your Personalized Dashboard for a Healthier You.
          </div>

          <h4 className="dashboard-info-title">Your Body Type:</h4>
          <p className="dashboard-info-text">
            {userData?.bodyType
              ? `${userData.bodyType}: Your body type is calculated based on BMI and personal details.`
              : "Body type not calculated yet."}
          </p>

          <h4 className="dashboard-info-title">
            Your BMI: {userData?.bmi ? userData.bmi : "Not calculated yet"}
          </h4>

          <div className="quick-access">
            <h3 className="qa-title">Quick Access:</h3>
            <div className="qa-scroll">
              <div className="qa-container" style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
                <div
                  className="qa-card"
                  onClick={() => navigate("/healthy")}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="qa-card-image"
                    style={{ backgroundImage: 'url("/images/button_healthy.jpg")' }}
                  ></div>
                  <p className="qa-card-text">
                    Healthy Alternatives of Common Junk Foods
                  </p>
                </div>

                <div
                  className="qa-card"
                  onClick={() => navigate("/optimal_h_w")}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="qa-card-image"
                    style={{ backgroundImage: 'url("/images/button_optimal.jpg")' }}
                  ></div>
                  <p className="qa-card-text">
                    Optimal Body Weight & Height (According to Age)
                  </p>
                </div>

                <div
                  className="qa-card"
                  onClick={() => navigate("/workout_dashboard")}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="qa-card-image"
                    style={{ backgroundImage: 'url("/images/fitness_tracking.jpg")' }}
                  ></div>
                  <p className="qa-card-text">
                    Personalized Workout Routine (Based on your Profile)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-btn-container">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/diet_plan_page")}
          >
            Get Diet Plan
          </button>
        </div>
      </div>

      {/* Profile / Edit Profile Modal */}
      {showProfile && userData && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>👤 User Profile</h3>

            {error && <p className="error-text">{error}</p>}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-form">
                <label>First Name
                  <input type="text" name="firstname" value={formData?.firstname || ""} onChange={handleProfileChange} />
                </label>
                <label>Last Name
                  <input type="text" name="lastname" value={formData?.lastname || ""} onChange={handleProfileChange} />
                </label>
                <label>Age
                  <input type="number" min="0" name="age" value={formData?.age ?? ""} onChange={handleProfileChange} />
                </label>
                <label>Height (cm)
                  <input type="number" min="0" name="height" value={formData?.height ?? ""} onChange={handleProfileChange} />
                </label>
                <label>Weight (kg)
                  <input type="number" min="0" step="0.1" name="weight" value={formData?.weight ?? ""} onChange={handleProfileChange} />
                </label>
                <label>Gender
                  <select name="gender" value={formData?.gender || ""} onChange={handleProfileChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>Activity Level
                  <select name="activityLevel" value={formData?.activityLevel || ""} onChange={handleProfileChange}>
                    <option value="">Select</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Active">Active</option>
                  </select>
                </label>
                <label>Dietary Preference
                  <select name="dietaryPreference" value={formData?.dietaryPreference || ""} onChange={handleProfileChange}>
                    <option value="">Select</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>Fitness Goal
                  <select name="fitnessGoal" value={formData?.fitnessGoal || ""} onChange={handleProfileChange}>
                    <option value="">Select</option>
                    <option value="weightLoss">Weight Loss</option>
                    <option value="bulking">Bulking</option>
                    <option value="leanMuscle">Lean Muscle Gain</option>
                  </select>
                </label>
                <label>Budget
                  <select name="budget" value={formData?.budget || "low"} onChange={handleProfileChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <p><strong>Email (read-only):</strong> {userData.email}</p>
                <div className="modal-buttons">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setFormData(userData); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>First Name:</strong> {userData.firstname}</p>
                <p><strong>Last Name:</strong> {userData.lastname}</p>
                <p><strong>Age:</strong> {userData.age || "Not provided"}</p>
                <p><strong>Height:</strong> {userData.height || "Not provided"} cm</p>
                <p><strong>Weight:</strong> {userData.weight || "Not provided"} kg</p>
                <p><strong>Gender:</strong> {userData.gender || "Not provided"}</p>
                <p><strong>Activity Level:</strong> {userData.activityLevel || "Not provided"}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Dietary Preference:</strong> {userData.dietaryPreference || "Not provided"}</p>
                <p><strong>Fitness Goal:</strong> {userData.fitnessGoal || "Not provided"}</p>
                <p><strong>Budget:</strong> {userData.budget || "low"}</p>
                <div className="modal-buttons">
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="btn btn-secondary" onClick={closeProfileModal}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}