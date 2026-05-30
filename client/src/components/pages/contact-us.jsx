import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import ProfileButton from "../profile/ProfileButton.jsx";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import "../../styles/contact-us.css";

export default function ContactUs() {
  const navigate = useNavigate();
  const { user, userData, handleLogout, handleDeleteAccount } = useAuth();
  const isLoggedIn = !!user;

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Fit-Fuel — Contact Us";
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to a backend or Formspree
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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

        {/* Contact Us Section */}
        <div className="contact-section">
          <div className="contact-content">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              We're here to help! Reach out to us with any questions,
              feedback, or concerns. Our team is dedicated to providing
              you with the best meal planning experience.
            </p>

            {submitted && (
              <div className="success-msg">Thank you! Your message has been sent. ✅</div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="contact-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="contact-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  className="contact-input"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  className="contact-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="contact-submit-btn">
                Send Message
              </button>
            </form>

            {/* Other Contact Methods */}
            <h3 className="other-contact-title">Other Ways to Reach Us</h3>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"></path>
                </svg>
              </div>
              <div className="contact-card-text">
                <p className="contact-card-label">Email</p>
                <p className="contact-card-value">support@FitFuel.com</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
                </svg>
              </div>
              <div className="contact-card-text">
                <p className="contact-card-label">Phone</p>
                <p className="contact-card-value">+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}