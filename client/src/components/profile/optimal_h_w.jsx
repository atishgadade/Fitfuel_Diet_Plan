import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../layout/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import ProfileButton from "./ProfileButton.jsx";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";

export default function OptimalHeightWeight() {
  const navigate = useNavigate();
  const { user, userData, handleLogout, handleDeleteAccount } = useAuth();

  useEffect(() => {
    document.title = "Fit-Fuel — Optimal Height & Weight";
  }, []);

  const ageData = [
    ["0–4", 95, 14],
    ["5–9", 114, 23],
    ["10–14", 150, 41],
    ["15–19", 172, 54],
    ["20–24", 179, 62],
    ["25–29", 179, 63],
    ["30–34", 178, 64],
    ["35–39", 177, 65],
    ["40–44", 176, 66],
    ["45–49", 175, 67],
    ["50–54", 174, 68],
    ["55–59", 173, 68],
    ["60–64", 172, 68],
    ["65–69", 170, 67],
    ["70+", 168, 66],
  ];

  return (
    <div className="page-root">
      <div className="layout-container">
        <header className="header">
          <div className="logo-container">
            <Link to="/user_dashboard">
              <img src={logo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
            </Link>
          </div>
          <div className="nav-actions">
            <nav className="nav-links-input">
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
          </div>
        </header>

        <PageContainer>
          <Title>Optimal Body Height &amp; Weight According to Age</Title>

          <Table>
            <thead>
              <tr>
                <Th>Age Group (years)</Th>
                <Th>Optimal Height (cm)</Th>
                <Th>Optimal Weight (kg)</Th>
              </tr>
            </thead>
            <tbody>
              {ageData.map(([age, height, weight], index) => (
                <Row key={index}>
                  <Td>{age}</Td>
                  <Td>{height}</Td>
                  <Td>{weight}</Td>
                </Row>
              ))}
            </tbody>
          </Table>
        </PageContainer>
      </div>

      <Footer />
    </div>
  );
}

const PageContainer = styled.div`
  background-color: var(--color-bg-primary);
  min-height: 60vh;
  padding: 40px 60px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-display);
  margin-bottom: 40px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 30px;
`;

const Th = styled.th`
  background-color: var(--color-primary);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
`;

const Td = styled.td`
  padding: 12px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: top;
`;

const Row = styled.tr`
  &:hover {
    background-color: var(--color-bg-secondary);
  }
`;
