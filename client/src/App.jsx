import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import VeggiePlanLanding from "./components/pages/VeggiePlanLanding.jsx";
import LoginSignup from "./components/auth/login_signup.jsx";
import AboutUs from "./components/pages/aboutus.jsx";
import UserManual from "./components/pages/user-manual.jsx";
import Signup from "./components/auth/signup.jsx";
import ContactUS from "./components/pages/contact-us.jsx";
import ClientInputForm from "./components/profile/client_input_form.jsx";
import UserDashboard from "./components/profile/user_dashboard.jsx";
import HealthyAlternatives from "./components/profile/healthy.jsx";
import OptimalWeightHeight from "./components/profile/optimal_h_w.jsx";
import DietPlan from "./components/recommendation/diet_plan_page.jsx";
import WorkoutDashboard from "./components/workout/WorkoutDashboard.jsx";
import DailyView from "./components/workout/DailyView.jsx";
import OTPVerification from "./components/auth/OTPVerification.jsx";
import ForgotPassword from "./components/auth/ForgotPassword.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { Toaster } from "react-hot-toast";

/** Simple 404 Page */
function NotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", fontFamily: "var(--font-body)",
      backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)",
      textAlign: "center", padding: "2rem"
    }}>
      <h1 style={{ fontSize: "5rem", fontFamily: "var(--font-display)", color: "var(--color-primary)", marginBottom: "0.5rem" }}>404</h1>
      <h2 style={{ marginBottom: "1rem", color: "var(--color-secondary-dark)" }}>Page Not Found</h2>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{
        backgroundColor: "var(--color-primary)", color: "white", padding: "12px 32px",
        borderRadius: "var(--radius-md)", fontWeight: 600, textDecoration: "none",
        transition: "background-color 0.2s"
      }}>
        Go Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* ── Public Routes ──────────────────────────────── */}
          <Route path="/" element={<VeggiePlanLanding />} />
          <Route path="/login_signup" element={<LoginSignup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/user-manual" element={<UserManual />} />
          <Route path="/contactus" element={<ContactUS />} />

          {/* ── Authenticated Routes ───────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/client_input_form" element={<ClientInputForm />} />
            <Route path="/user_dashboard" element={<UserDashboard />} />
            <Route path="/healthy" element={<HealthyAlternatives />} />
            <Route path="/optimal_h_w" element={<OptimalWeightHeight />} />
            <Route path="/diet_plan_page" element={<DietPlan />} />
            <Route path="/workout_dashboard" element={<WorkoutDashboard />} />
            <Route path="/workout_day/:templateId/:day" element={<DailyView />} />
          </Route>

          {/* ── 404 Page ──────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
