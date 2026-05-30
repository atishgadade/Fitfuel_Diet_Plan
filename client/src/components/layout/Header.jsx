import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import ProfileButton from "../profile/ProfileButton.jsx";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";

/**
 * Shared Header — adapts to auth state.
 * Public: full nav links + Login/Signup button
 * Authenticated: dashboard links + ProfileButton dropdown
 */
export default function Header({ onViewProfile }) {
    const navigate = useNavigate();
    const { user, userData, handleLogout, handleDeleteAccount } = useAuth();
    const isLoggedIn = !!user;

    return (
        <StyledHeader className="header">
            <div className="logo-container">
                <Link to={isLoggedIn ? "/user_dashboard" : "/"}>
                    <img
                        src={logo}
                        alt="Fit-Fuel"
                        style={{ height: "45px", objectFit: "contain" }}
                    />
                </Link>
            </div>
            <div className="nav-actions">
                {isLoggedIn ? (
                    <nav className="nav-links-input">
                        <Link to="/user_dashboard">Home</Link>
                        <Link to="/aboutus">About Us</Link>
                        <Link to="/contactus">Contact Us</Link>
                        <ProfileButton
                            userData={userData}
                            onViewProfile={onViewProfile || (() => { })}
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
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/login_signup")}
                        >
                            Login / Signup
                        </button>
                    </>
                )}
            </div>
        </StyledHeader>
    );
}

const StyledHeader = styled.header`
  /* Uses existing .header styles from page-level CSS */
`;
