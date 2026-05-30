import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import emailConfig from "../../config/emailConfig";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import Header from "../layout/Header.jsx";
import "../../styles/login_signup.css";

export default function OTPVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { uid, email } = location.state || {};

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Fit-Fuel — Verify Email";

        if (!uid) {
            navigate("/signup");
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [uid, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        if (element.value !== "" && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prev = e.target.previousSibling;
            if (prev) prev.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                if (userData.otp === enteredOtp) {
                    const OTP_EXPIRY_MS = 10 * 60 * 1000;
                    const otpCreatedAt = userData.otpCreatedAt?.toDate 
                        ? userData.otpCreatedAt.toDate().getTime() 
                        : new Date(userData.otpCreatedAt).getTime();
                        
                    if (Date.now() - otpCreatedAt > OTP_EXPIRY_MS) {
                        setError("OTP has expired (valid for 10 minutes). Please request a new one.");
                        setLoading(false);
                        return;
                    }

                    await updateDoc(userRef, {
                        emailVerified: true,
                        otp: null,
                    });

                    toast.success("✅ Email Verified Successfully!");
                    navigate("/login_signup");
                } else {
                    setError("Invalid OTP. Please check your email and try again.");
                }
            } else {
                setError("User not found.");
            }
        } catch (err) {
            console.error(err);
            setError("Verification failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setTimer(60);

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            await updateDoc(userRef, { otp: newOtp, otpCreatedAt: new Date().toISOString() });

            const templateParams = {
                email: email,
                to_name: userData.firstname || "User",
                passcode: newOtp,
            };

            await emailjs.send(
                emailConfig.serviceId,
                emailConfig.templateId,
                templateParams,
                emailConfig.publicKey
            );

            toast.success(`New OTP sent to ${email}`);
        } catch (err) {
            console.error("Error resending OTP:", err);
            toast.error("Failed to resend OTP");
        }
    };

    return (
        <div className="page-root">
            <div className="layout-container">
                <Header />

                <main className="form-container">
                    <StyledWrapper>
                        <div className="form">
                            <h2 className="form-title">Verify Your Email</h2>
                            <p className="form-subtitle">
                                Enter the 6-digit code sent to <strong>{email}</strong>
                            </p>

                            {error && <div className="msg msg-error">{error}</div>}

                            <form onSubmit={handleVerify}>
                                <div className="flex-column"><label>Enter OTP</label></div>
                                <div className="otp-container mt-3">
                                    {otp.map((data, index) => (
                                        <input
                                            type="text"
                                            name="otp"
                                            maxLength="1"
                                            className="otp-input"
                                            key={index}
                                            value={data}
                                            onChange={(e) => handleChange(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onFocus={(e) => e.target.select()}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                <button className="button-submit mt-4" type="submit" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify Code"}
                                </button>
                            </form>

                            <div className="resend-section">
                                <p className="p mt-3">Didn't receive code?</p>
                                <span
                                    className={`span resend-btn ${timer > 0 ? "disabled" : ""}`}
                                    onClick={handleResend}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                                </span>
                            </div>
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

  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }

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

  .resend-section {
    text-align: center;
    margin-top: 10px;
  }

  .span {
    font-size: var(--text-sm);
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  .span:hover {
    text-decoration: underline;
  }

  .span.disabled {
    color: var(--color-text-muted);
    cursor: not-allowed;
    text-decoration: none;
  }
`;
