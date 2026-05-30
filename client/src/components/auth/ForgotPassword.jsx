import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import emailConfig from "../../config/emailConfig";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import Header from "../layout/Header.jsx";
import "../../styles/login_signup.css";

/**
 * ForgotPassword — EmailJS OTP Password Reset Flow
 * Step 1: Enter email → server generates OTP & stores via Admin SDK → client sends via EmailJS
 * Step 2: Verify OTP via server endpoint
 * Step 3: Set new password → server updates Firebase Auth
 */
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userDocId, setUserDocId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Fit-Fuel — Reset Password";
  }, []);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Step 1: Request OTP — calls server to generate & store OTP, then sends via EmailJS
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setErrorMsg("Please enter your email."); return; }
    if (!isValidEmail(trimmed)) { setErrorMsg("Invalid email format."); return; }

    setLoading(true);
    try {
      // Call server to generate OTP and store in Firestore via Admin SDK
      const response = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Failed to process request.");
        setLoading(false);
        return;
      }

      setUserDocId(result.uid);
      setUserName(result.firstname);

      // Send OTP email via EmailJS (client-side)
      const templateParams = {
        to_name: result.firstname,
        email: trimmed,
        passcode: result.otp,
      };

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.publicKey
      );

      setSuccessMsg("OTP sent successfully to your email!");
      setStep(2);
    } catch (error) {
      console.error("OTP Error:", error);
      setErrorMsg("Failed to send OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newArr = [...otpInputs];
    newArr[index] = value;
    setOtpInputs(newArr);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Step 2: Verify OTP via server
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const enteredOtp = otpInputs.join("");

    if (enteredOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userDocId, otp: enteredOtp }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Failed to verify OTP.");
        return;
      }

      if (result.verified) {
        setSuccessMsg("OTP Verified! Please enter your new password.");
        setStep(3);
      } else {
        setErrorMsg(result.error || "Invalid OTP. Please check your email and try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password — calls server to update Firebase Auth
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userDocId, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password.");
      }

      setSuccessMsg("Password successfully updated! Redirecting to login...");
      setTimeout(() => {
        navigate("/login_signup");
      }, 2500);
    } catch (error) {
      console.error("Reset Error:", error);
      setErrorMsg(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="layout-container">
        <Header />

        <main className="form-container">
          <StyledWrapper>
            <div className="form">
              <h2 className="form-title">
                {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
              </h2>

              {successMsg && <div className="msg msg-success">{successMsg}</div>}
              {errorMsg && <div className="msg msg-error">{errorMsg}</div>}

              {/* --- STEP 1: EMAIL --- */}
              {step === 1 && (
                <form onSubmit={handleSendOTP}>
                  <p className="form-subtitle">
                    Enter your registered email address to receive an OTP.
                  </p>
                  <div className="flex-column"><label>Email</label></div>
                  <div className="inputForm">
                    <input
                      type="email"
                      className="input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button className="button-submit mt-4" type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send Reset Code"}
                  </button>
                </form>
              )}

              {/* --- STEP 2: OTP --- */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP}>
                  <p className="form-subtitle">
                    Please enter the 6-digit OTP sent to {email}.
                  </p>
                  <div className="flex-column"><label>Enter OTP</label></div>
                  <div className="otp-container mt-3">
                    {otpInputs.map((val, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        className="otp-input"
                        value={val}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <button className="button-submit mt-4" type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
              )}

              {/* --- STEP 3: NEW PASSWORD --- */}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <p className="form-subtitle">
                    Please create a new password for your account.
                  </p>

                  <div className="flex-column"><label>New Password</label></div>
                  <div className="inputForm mb-3">
                    <input
                      type="password"
                      className="input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex-column"><label>Confirm Password</label></div>
                  <div className="inputForm mb-3">
                    <input
                      type="password"
                      className="input"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button className="button-submit mt-4" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </form>
              )}

              {step === 1 && (
                <p className="p mt-3">
                  Remember your password?{" "}
                  <span className="span" onClick={() => navigate("/login_signup")}>
                    Back to Login
                  </span>
                </p>
              )}
            </div>
          </StyledWrapper>
        </main>
      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: var(--color-bg-card);
    padding: 40px;
    width: 450px;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    margin: 50px auto;
  }

  .form-title {
    color: var(--color-primary);
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 700;
    margin: 0 0 10px 0;
  }

  .form-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    margin: 0 0 20px 0;
    line-height: 1.5;
  }

  .msg {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .msg-success {
    background-color: rgba(95, 113, 97, 0.1);
    color: var(--color-success);
    border: 1px solid rgba(95, 113, 97, 0.2);
  }

  .msg-error {
    background-color: rgba(196, 69, 54, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(196, 69, 54, 0.2);
  }

  .flex-column > label {
    color: var(--color-text-primary);
    font-weight: 600;
    margin-bottom: 5px;
    font-size: var(--text-sm);
  }

  .inputForm {
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
    background-color: var(--color-bg-secondary);
  }

  .input {
    margin-left: 10px;
    border-radius: var(--radius-md);
    border: none;
    width: 100%;
    height: 100%;
    background-color: transparent;
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }

  .input:focus { outline: none; }

  .inputForm:focus-within {
    border: 1.5px solid var(--color-primary);
  }

  .mb-3 { margin-bottom: 1rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }

  .button-submit {
    margin: 10px 0;
    background-color: var(--color-primary);
    border: none;
    color: white;
    font-size: var(--text-base);
    font-weight: 600;
    border-radius: var(--radius-md);
    height: 50px;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .button-submit:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  .button-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .p {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    margin: 5px 0;
  }

  .span {
    font-size: var(--text-sm);
    margin-left: 5px;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  .span:hover { text-decoration: underline; }

  .otp-container {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  .otp-input {
    width: 45px;
    height: 50px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
    transition: 0.2s;
  }

  .otp-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;
