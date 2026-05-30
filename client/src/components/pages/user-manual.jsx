import React, { useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/user-manual.css"; // Import custom CSS
import Header from "../layout/Header.jsx";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";

export default function UserManual() {
  const navigate = useNavigate();
  const { userData, handleLogout, handleDeleteAccount } = useAuth();

  useEffect(() => {
    document.title = "Diet Companion | User Manual";
  }, []);

  return (
    <div className="page-root">
      <div className="layout-container">
        {/* Header */}
        <Header 
          userData={userData} 
          onLogout={() => {
            handleLogout(navigate);
          }}
          onDeleteAccount={() => handleDeleteAccount(navigate)}
        />
        <div className="main-section user-manual-wrapper">
          <div className="user-manual-container">
            {/* Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="title_main" style={{ color: "var(--color-secondary-dark)" }}>User Manual</h1>
            </div>

            {/* Getting Started */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Getting Started</h3>
            <p className="text-base font-normal pb-3 pt-1 px-4" style={{ color: "var(--color-text-secondary)" }}>
              Welcome to VeggieLife! This guide will help you navigate our platform and make the most of your vegetarian diet planning journey.
            </p>

            {/* Account Setup */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Account Setup</h3>

            {/* Create an Account */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Create an Account</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Click the 'Sign Up' button in the top right corner.</p>
              </div>
            </div>

            {/* Enter Details */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Enter Your Details</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Fill in your details, including name, email, and a secure password.</p>
              </div>
            </div>

            {/* Verify Email */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Verify Your Email</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Verify your email address by clicking the link sent to your inbox.</p>
              </div>
            </div>

            {/* Meal Planning */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Meal Planning</h3>

            {/* Browse Recipes */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Browse Recipes</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Go to the 'Recipes' section and browse our collection.</p>
              </div>
            </div>

            {/* Add to Meal Plan */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Add to Meal Plan</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Select recipes and add them to your weekly meal plan.</p>
              </div>
            </div>

            {/* Customize Plan */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Customize Your Plan</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Customize your meal plan by adjusting portion sizes and swapping recipes.</p>
              </div>
            </div>

            {/* Progress Tracking */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Progress Tracking</h3>

            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Track Your Intake</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Track your dietary intake, including calories, protein, and other nutrients.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Set Goals</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Set personal goals and track your achievements.</p>
              </div>
            </div>

            {/* Community */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Community</h3>
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg mt-2" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-center rounded-lg size-12" style={{ backgroundColor: "var(--color-secondary)", color: "white" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Join the Community</p>
                <p className="text-sm ml-6" style={{ color: "var(--color-text-secondary)" }}>Engage with other users, share recipes, and participate in discussions.</p>
              </div>
            </div>

            {/* Need Help */}
            <h3 className="text-lg font-bold px-4 pb-2 pt-4" style={{ color: "var(--color-secondary-dark)" }}>Need Help?</h3>
            <p className="text-base font-normal pb-3 pt-1 px-4" style={{ color: "var(--color-text-secondary)" }}>
              If you have any questions or need further assistance, please visit our 'About' section for contact information and FAQs.
            </p>
          </div>
        </div>


      </div> {/* ✅ Closed layout-container here */}

      {/* Footer */}
      <Footer />
    </div>
  );
}
