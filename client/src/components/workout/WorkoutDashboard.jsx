import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTemplateIdForUser, fetchWorkoutTemplate } from "../../utils/workoutUtils";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import "../../styles/workout_dashboard.css";

const WorkoutDashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkout = async () => {
      if (userData) {
        const templateId = getTemplateIdForUser(userData);
        const data = await fetchWorkoutTemplate(templateId);
        setTemplate(data);
      }
      setLoading(false);
    };
    loadWorkout();
  }, [userData]);

  if (loading) return <div className="loading-spinner">Loading your plan...</div>;

  return (
    <div className="workout-page">
      <Header />
      <main className="workout-container">
        <header className="workout-header">
          <h1 className="workout-title">Your Workout Routine</h1>
          <p className="workout-subtitle">
            Tailored for: <strong>{userData?.activityLevel}</strong> | Age: <strong>{userData?.age}</strong>
          </p>
          {template && (
            <div className="focus-badge">
              <span>Goal Focus:</span> {template.focus}
            </div>
          )}
        </header>

        {!template ? (
          <div className="no-template">
            <h3>No specific template found for your profile.</h3>
            <p>Please update your profile details to get a personalized plan.</p>
          </div>
        ) : (
          <div className="workout-grid">
            {template.schedule.map((day) => (
              <div 
                key={day.day_number} 
                className={`day-card ${day.routine.length === 0 ? "rest-day" : ""}`}
                onClick={() => day.routine.length > 0 && navigate(`/workout_day/${template.template_id}/${day.day_number}`)}
              >
                <div className="day-header">
                  <span className="day-number">Day {day.day_number}</span>
                  <h3 className="day-name">{day.day_name}</h3>
                </div>
                <div className="day-body">
                  {day.routine.length > 0 ? (
                    <>
                      <p className="exercise-count">{day.routine.length} Exercises</p>
                      <button className="view-btn">View Workout</button>
                    </>
                  ) : (
                    <p className="rest-text">Time to recover and grow! 🧘‍♂️</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WorkoutDashboard;
