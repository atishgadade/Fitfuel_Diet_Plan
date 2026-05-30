import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/login_signup.css";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";

/**
 * LoginSignup — Email/password & Google login page.
 * Includes emailVerified check: unverified users are redirected to OTP page.
 */
export default function LoginSignup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Fit Fuel Login";
  }, []);

  /**
   * Checks Firestore for a user profile document.
   * Routes to dashboard if profile exists & is completed, else to input form.
   * Enforces emailVerified check for email/password users.
   */
  const checkUserProfile = async (user, isGoogleLogin = false) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      // Email/password users must verify their email via OTP
      if (!isGoogleLogin && data.emailVerified === false) {
        setErrorMsg("Please verify your email first. Redirecting...");
        setTimeout(() => {
          navigate("/otp-verification", { state: { uid: user.uid, email: user.email } });
        }, 1500);
        return;
      }

      if (data.profileCompleted) {
        navigate("/user_dashboard");
      } else {
        navigate("/client_input_form");
      }
    } else {
      // First-time Google user — create minimal doc (Google users are auto-verified)
      const displayName = user.displayName || "";
      const splitName = displayName.split(" ");
      await setDoc(
        userRef,
        {
          email: user.email,
          firstname: splitName[0] || "",
          lastname: splitName.slice(1).join(" ") || "",
          createdAt: new Date(),
          profileCompleted: false,
          emailVerified: true, // Google users are auto-verified
        },
        { merge: true }
      );
      navigate("/client_input_form");
    }
  };

  /* ── Email/password login ─────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkUserProfile(userCredential.user, false);
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setErrorMsg("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMsg("No account found with this email. Please sign up first.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMsg("Too many failed attempts. Please try again later.");
      } else {
        setErrorMsg("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Google login ─────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkUserProfile(result.user, true);
    } catch (error) {
      console.error("Google Login Error:", error);
      setErrorMsg("Google Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="layout-container">
        <header className="header">
          <div className="logo-container">
            <img
              src={logo}
              alt="Fit-Fuel"
              style={{ height: "45px", objectFit: "contain" }}
            />
          </div>
          <div className="nav-actions">
            <nav className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/user-manual">User Manual</Link>
              <Link to="/aboutus">About Us</Link>
              <Link to="/contactus">Contact Us</Link>
            </nav>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/login_signup")}
            >
              Login/Signup
            </button>
          </div>
        </header>

        <main className="form-container">
          <StyledWrapper>
            <form className="form" onSubmit={handleLogin}>
              {errorMsg && <div className="msg msg-error">{errorMsg}</div>}

              <div className="flex-column">
                <label>Email </label>
              </div>
              <div className="inputForm">
                <svg height={20} viewBox="0 0 32 32" width={20}>
                  <g id="Layer_3" data-name="Layer 3">
                    <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
                  </g>
                </svg>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex-column">
                <label>Password </label>
              </div>
              <div className="inputForm">
                <svg height={20} viewBox="-64 0 512 512" width={20}>
                  <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                  <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                </svg>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex-row">
                <div>
                  <input type="checkbox" id="remember-me" />
                  <label htmlFor="remember-me">Remember me </label>
                </div>
                <span
                  className="span"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </span>
              </div>

              <button className="button-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="p">
                Don&apos;t have an account?{" "}
                <span onClick={() => navigate("/signup")} className="span">
                  Sign Up
                </span>
              </p>
              <p className="p line">Or With</p>

              <div className="flex-row">
                <button
                  type="button"
                  className="btn google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  Google
                </button>
                <button type="button" className="btn apple" disabled>
                  Apple
                </button>
              </div>
            </form>
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

  .msg {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .msg-error {
    background-color: rgba(196, 69, 54, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(196, 69, 54, 0.2);
  }

  ::placeholder {
    color: var(--color-text-muted);
  }

  .form button {
    align-self: flex-end;
  }

  .flex-column > label {
    color: var(--color-text-primary);
    font-weight: 600;
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

  .inputForm svg {
    fill: var(--color-text-secondary);
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

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .flex-row > div > label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  .span {
    font-size: var(--text-sm);
    margin-left: 5px;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  .span:hover { text-decoration: underline; }

  .button-submit {
    margin: 20px 0 10px 0;
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

  .btn {
    margin-top: 10px;
    width: 100%;
    height: 50px;
    border-radius: var(--radius-md);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    border: 1px solid var(--color-border);
    background-color: var(--color-bg-card);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  .btn:hover:not(:disabled) {
    border: 1px solid var(--color-primary);
    background-color: var(--color-bg-secondary);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
