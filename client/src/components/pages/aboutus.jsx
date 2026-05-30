import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import ProfileButton from "../profile/ProfileButton.jsx";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import "../../styles/aboutus.css";

export default function AboutUs() {
  const navigate = useNavigate();
  const { user, userData, handleLogout, handleDeleteAccount } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    document.title = "Fit-Fuel — About Us";
  }, []);

  return (
    <div className="page-root">
      <div className="layout-container">
        {/* Adaptive Header */}
        <header className="header">
          <div className="logo-container">
            <Link to={isLoggedIn ? "/user_dashboard" : "/"}>
              <img src={logo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
            </Link>
          </div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <nav className="nav-links">
                <Link to="/user_dashboard">Home</Link>
                <Link to="/aboutus">About Us</Link>
                <Link to="/contactus">Contact Us</Link>
                <ProfileButton
                  userData={userData}
                  onViewProfile={() => { }}
                  onLogout={() => handleLogout(navigate)}
                  onDeleteAccount={() => handleDeleteAccount(navigate)}
                />
              </nav>
            ) : (
              <>
                <nav className="nav-links">
                  <Link to="/">Home</Link>
                  <Link to="/user-manual">User Manual</Link>
                  <Link to="/aboutus">About Us</Link>
                  <Link to="/contactus">Contact Us</Link>
                </nav>
                <button className="btn btn-primary" onClick={() => navigate("/login_signup")}>
                  Login / Signup
                </button>
              </>
            )}
          </div>
        </header>

        {/* About Section */}
        <div className="main_section1">
          <div className="about-content">
            <h1>About FitFuel</h1>
            <p className="details_services-feature">
              <strong>FitFuel</strong> is more than just a diet planner – it's your
              personal health companion. We design <em>personalized diet plans</em> based
              on your age, activity level, and fitness goals, ensuring that healthy
              living is simple and achievable for everyone.
            </p>
            <p className="details_services-feature">
              Whether you aim for <strong>weight loss, muscle gain, or balanced
                nutrition</strong>, FitFuel provides meal suggestions that match your
              lifestyle and even considers your budget preferences. With quick access to
              healthy alternatives and recommended fitness metrics, we empower you to
              make better food choices every day.
            </p>
            <p className="details_services-feature">
              Our mission is to <strong>help you eat smart, stay fit, and live a
                healthier life</strong> without the stress of complicated diets or
              expensive plans.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
