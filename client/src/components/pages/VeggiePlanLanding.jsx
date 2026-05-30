import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import rectLogo from "../../assets/images/fitfuel_rectanglelogo.png";
import circleLogo from "../../assets/images/fitfuel_circlelogo.png";
import Footer from "../layout/Footer.jsx";
import "../../styles/VeggiePlanLanding.css";

export default function VeggiePlanLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Fit-Fuel";
  }, []);

  return (
    <div className="page-root">
      <div className="layout-container">
        {/* Header */}
        <header className="header">
          <div className="logo-container">
            <img src={rectLogo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
          </div>
          <div className="nav-actions">
            <nav className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/#services">Services</Link>
              <Link to="/user-manual">User Manual</Link>
              <Link to="/aboutus">About Us</Link>
              <Link to="/contactus">Contact Us</Link>
            </nav>
            <button className="btn-primary" onClick={() => navigate("/login_signup")}>Login/Signup</button>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          <div className="hero">
            <div className="hero-text">
              <img
                src={circleLogo}
                alt="Fit-Fuel Emblem"
                className="hero-logo"
              />
              <h1>
                Fuel Your Body, <span>Transform Your Life</span>
              </h1>
              <h2>
                Crafting personalized vegetarian meal plans to support your
                health goals. Start your journey to a balanced, plant-based
                lifestyle today.
              </h2>
            </div>
            <button
              className="btn-primary large hero-btn"
              onClick={() => navigate("/login_signup")}
            >
              Start Your Journey
            </button>
          </div>
        </div>

        {/* ***** SERVICES ****** */}
        <div id="services" className="services-fetures-container">
          <h2>Key Services</h2>

          <div className="d-grid gap-3 text-center custom-grid">
            <div>
              <img src="/images/diet_planning.jpg" alt="Diet Planning" className="service-card-img" />
              <div className="heading_services-feature">
                Personalized Diet Planning
              </div>
              <div className="details_services-feature">
                Meal plans tailored to your dietary needs and preferences, including budget options and recipes.
              </div>
            </div>
            <div>
              <img src="/images/fitness_tracking.jpg" alt="Fitness Goal Tracking" className="service-card-img" />
              <div className="heading_services-feature">
                Fitness Goal Tracking
              </div>
              <div className="details_services-feature">
                Track your progress towards weight loss, bulking, or lean muscle gain with detailed calorie and macro breakdowns.
              </div>
            </div>
            <div>
              <img src="/images/healthy_food.jpg" alt="Healthy Food Alternatives" className="service-card-img" />
              <div className="heading_services-feature">
                Healthy Food Alternatives
              </div>
              <div className="details_services-feature">
                Discover healthier swaps for your favorite foods and build sustainable healthy habits.
              </div>
            </div>
            <div>
              <img src="/images/body_analysis.jpg" alt="Body Analysis" className="service-card-img" />
              <div className="heading_services-feature">
                Body Analysis &amp; Recommendations
              </div>
              <div className="details_services-feature">
                Receive a comprehensive Body Type report, Age-Height-Weight chart, BMI, BMR, and personalized calorie needs.
              </div>
            </div>
          </div>
        </div>

        {/* ** Features ** */}
        <div className="services-fetures-container">
          <h2>Features</h2>

          <div className="d-grid gap-3 text-center custom-grid">
            <div>
              <img src="/images/feature_dashboard.jpg" alt="Dashboard" className="service-card-img" />
              <div className="heading_services-feature">
                User Dashboard &amp; Progress Monitoring
              </div>
              <div className="details_services-feature">
                Quick access to plans/stats, weight/calorie/hydration trackers.
              </div>
            </div>
            <div>
              <img src="/images/feature_profile.jpg" alt="Profile" className="service-card-img" />
              <div className="heading_services-feature">
                Profile &amp; Personalization
              </div>
              <div className="details_services-feature">
                Editable user profiles, saved preferences, history, and notifications.
              </div>
            </div>
            <div>
              <img src="/images/feature_community.jpg" alt="Community" className="service-card-img" />
              <div className="heading_services-feature">
                Community &amp; Support
              </div>
              <div className="details_services-feature">
                Feedback/chat, social sharing, and optional trainer access.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
