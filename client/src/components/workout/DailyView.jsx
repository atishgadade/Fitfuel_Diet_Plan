import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWorkoutTemplate } from "../../utils/workoutUtils";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import "../../styles/daily_view.css";

const DailyView = () => {
  const { templateId, day } = useParams();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDay = async () => {
      const template = await fetchWorkoutTemplate(templateId);
      if (template) {
        const foundDay = template.schedule.find(d => d.day_number === parseInt(day));
        setDayData(foundDay);
      }
      setLoading(false);
    };
    loadDay();
  }, [templateId, day]);

  if (loading) return <div className="loading-spinner">Loading workout...</div>;
  if (!dayData) return <div className="no-data">Workout day not found.</div>;

  return (
    <div className="daily-page">
      <Header />
      <main className="daily-container">
        <button className="back-btn" onClick={() => navigate("/workout_dashboard")}>
          ← Back to Dashboard
        </button>

        <header className="daily-header">
          <h1 className="day-title">{dayData.day_name}</h1>
          <p className="day-subtitle">Everything you need for Day {dayData.day_number}</p>
        </header>

        <div className="exercise-list">
          {dayData.routine.map((ex, index) => (
            <div key={index} className="exercise-card">
              <div className="exercise-info">
                <h3 className="exercise-name">{ex.name}</h3>
                <div className="exercise-meta">
                  <span className="meta-item"><strong>{ex.sets}</strong> Sets</span>
                  <span className="meta-item"><strong>{ex.reps}</strong> Reps</span>
                  {ex.rest && <span className="meta-item"><strong>{ex.rest}s</strong> Rest</span>}
                </div>
              </div>
              <div className="exercise-status">
                {/* Optional: Add a checkbox for completion later */}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyView;
