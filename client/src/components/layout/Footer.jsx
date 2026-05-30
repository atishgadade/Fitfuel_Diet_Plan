import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

/**
 * Shared Footer — consistent across all pages.
 * Unified contact info, proper links, correct copyright year.
 */
export default function Footer() {
    return (
        <StyledFooter>
            <div className="footer-container">
                <div className="footer-grid">
                    {/* About */}
                    <div className="footer-col">
                        <h3>Fit Fuel Diet Companion</h3>
                        <p>
                            FitFuel is your smart diet companion that creates personalized meal
                            plans, tracks your fitness goals, and helps you build a healthier
                            lifestyle with ease.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/aboutus">About Us</Link>
                            </li>
                            <li>
                                <Link to="/contactus">Contact Us</Link>
                            </li>
                            <li>
                                <Link to="/user-manual">User Manual</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <p>Email: support@FitFuel.com</p>
                        <p>Phone: +91 98765 43210</p>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>&copy; 2026 Fit-Fuel. All rights reserved.</p>
                </div>
            </div>
        </StyledFooter>
    );
}

const StyledFooter = styled.footer`
  background-color: var(--color-bg-dark, #2C3333);
  color: #e0e0e0;
  padding: 3rem 0 1.5rem;
  font-family: var(--font-body);

  .footer-container {
    max-width: var(--max-width-xl, 1200px);
    margin: 0 auto;
    padding: 0 2rem;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-col h3 {
    color: #fff;
    font-family: var(--font-display);
    font-size: var(--text-lg);
    margin-bottom: 0.75rem;
  }

  .footer-col h4 {
    color: #fff;
    font-size: var(--text-base);
    margin-bottom: 0.75rem;
  }

  .footer-col p {
    color: #b0b0b0;
    font-size: var(--text-sm);
    line-height: 1.6;
    margin-bottom: 0.25rem;
  }

  .footer-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-col ul li {
    margin-bottom: 0.5rem;
  }

  .footer-col ul li a {
    color: #b0b0b0;
    font-size: var(--text-sm);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-col ul li a:hover {
    color: var(--color-primary-light, #E8C4A0);
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 1.5rem;
    text-align: center;
  }

  .footer-bottom p {
    color: #888;
    font-size: var(--text-sm);
    margin: 0;
  }
`;
