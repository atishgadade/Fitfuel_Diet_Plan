import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import emailjs from "@emailjs/browser";
import emailConfig from "../../config/emailConfig";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import "../../styles/login_signup.css";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";

export default function Signup() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "Fit-Fuel - Signup";

    // Inject Google Fonts + Bootstrap
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com/";
    pre.crossOrigin = "";

    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href =
      "https://fonts.googleapis.com/css2?display=swap&family=Lexend:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900";

    const bootstrap = document.createElement("link");
    bootstrap.rel = "stylesheet";
    bootstrap.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";
    bootstrap.integrity =
      "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB";
    bootstrap.crossOrigin = "anonymous";

    document.head.append(pre, font, bootstrap);

    return () => {
      document.head.removeChild(pre);
      document.head.removeChild(font);
      document.head.removeChild(bootstrap);
    };
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send OTP via EmailJS
      const templateParams = {
        email: email,       // Changed from to_email to match your template {{email}}
        to_name: firstname,
        passcode: otp       // Changed from otp to match your template {{passcode}}
      };

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.publicKey
      );

      console.log(`[DEMO] OTP for ${email}: ${otp}`); // Keep for debug/demo fallback

      // 3️⃣ Store user info + OTP in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstname,
        lastname,
        email,
        createdAt: new Date(),
        emailVerified: false,
        otp: otp,
        otpCreatedAt: new Date()
      });

      toast.success("✅ Account created! please Verify your email to continue.");

      // Redirect to OTP verification page
      navigate("/otp-verification", { state: { uid: user.uid, email: email } });

    } catch (error) {
      console.error("Signup Error Detailed:", error);

      let errorMessage = "Unknown error occurred.";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.text) {
        // EmailJS errors often have a 'text' property
        errorMessage = error.text;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }

      toast.error("❌ Signup failed: " + errorMessage);
    }
  };
  return (
    <div className="page-root">
      <div className="layout-container">
        {/* Header */}
        <header className="header">
          <div className="logo-container">
            <img src={logo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
          </div>
          <div className="nav-actions">
            <nav className="nav-links">
              <Link to="/">Home</Link>
              <Link to="#">Services</Link>
              <Link to="/user-manual">User Manual</Link>
              <Link to="/aboutus">About Us</Link>
              <Link to="/contactus">Contact Us</Link>
              <Link to="#">Privacy Policy</Link>
            </nav>
            <button className="btn btn-primary" onClick={() => navigate("/login_signup")} >Login/Signup</button>
          </div>
        </header>

        {/* ✅ Form merged directly */}
        <main className="form-container">
          <StyledWrapper>
            <div className="form-wrapper">
              <form className="form" onSubmit={handleSignup}>
                <p className="title">Register </p>
                <p className="message">Signup now and get full access to our app. </p>
                <div className="flex">
                  <label>
                    <input className="input"
                      type="text"
                      placeholder=""
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required />
                    <span>Firstname</span>
                  </label>
                  <label>
                    <input className="input"
                      type="text"
                      placeholder=""
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)} required />
                    <span>Lastname</span>
                  </label>
                </div>
                <label>
                  <input className="input"
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />
                  <span>Email</span>
                </label>
                <label>
                  <input className="input"
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />
                  <span>Password</span>
                </label>
                <label>
                  <input className="input"
                    type="password"
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required />
                  <span>Confirm password</span>
                </label>
                <button className="submit">
                  Submit
                </button>
                {/* <p className="signin">Already have an acount ? <a href="/login_signup">Signin</a> </p> */}
                <p className="signin">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login_signup")}
                    className="span"
                  >
                    Sign In
                  </span>
                </p>
              </form>
            </div>
          </StyledWrapper>

        </main>
      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  .form-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 450px;
    padding: 30px;
    border-radius: var(--radius-xl);
    background-color: var(--color-bg-card);
    box-shadow: var(--shadow-xl);
    position: relative;
    border: 1px solid var(--color-border);
  }

  .title {
    font-size: var(--text-2xl);
    font-weight: 600;
    letter-spacing: -0.5px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    color: var(--color-primary);
    font-family: var(--font-display);
    margin-bottom: 5px;
  }

  .title::before {
    width: 18px;
    height: 18px;
  }

   .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: var(--color-primary);
  }

  .message, 
  .signin {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .signin {
    text-align: center;
    margin-top: 15px;
  }
  
  .span {
    font-size: var(--text-sm);
    margin-left: 5px;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  .signin a:hover {
    text-decoration: underline;
  }

  .signin a {
    color: var(--color-primary);
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 10px;
  }

  .form label {
    position: relative;
    width: 100%;
  }

  .form label .input {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
    width: 100%;
    padding: 24px 10px 10px 10px;
    outline: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    transition: 0.3s ease;
  }

  .form label .input:focus {
    border-color: var(--color-primary);
  }

  .form label .input + span {
    color: var(--color-text-muted);
    position: absolute;
    left: 10px;
    top: 18px;
    font-size: var(--text-sm);
    cursor: text;
    transition: 0.3s ease;
    pointer-events: none;
  }

  .form label .input:focus + span,
  .form label .input:valid + span {
    color: var(--color-primary);
    top: 4px;
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .input {
    font-size: var(--text-base);
  }

  .submit {
    border: none;
    outline: none;
    padding: 12px;
    border-radius: var(--radius-md);
    color: #fff;
    font-size: var(--text-base);
    font-weight: 600;
    background-color: var(--color-primary);
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s;
    margin-top: 10px;
  }

  .submit:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;
