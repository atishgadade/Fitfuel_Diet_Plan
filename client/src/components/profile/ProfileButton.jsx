import React from "react";
import styled from "styled-components";

// ✅ Profile Button Component
const ProfileButton = ({ userData, onViewProfile, onLogout, onDeleteAccount }) => {
    return (
        <StyledWrapper>
            <div className="template">
                <div
                    tabIndex={0}
                    className="popup button"
                    style={{
                        padding: "0 0.225rem 0",
                        borderTopRightRadius: "1.2rem",
                        borderBottomRightRadius: "1.2rem",
                    }}
                >
                    <div className="popup-header">
                        <p
                            style={{
                                letterSpacing: 1,
                                fontWeight: 600,
                                padding: "0.625rem 0rem 0.625rem 0.825rem",
                                marginTop: "14px",
                                marginRight: "10px",
                            }}
                        >
                            {userData ? `Welcome, ${userData.firstname}` : "Loading..."}
                        </p>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${userData?.firstname || 'U'}+${userData?.lastname || ''}&background=FD7014&color=fff&rounded=true&bold=true`} 
                            alt="Profile Avatar" 
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                    </div>
                    <div className="popup-main">
                        <ul className="list-box">
                            <li className="button item" onClick={onViewProfile}>
                                View Profile
                            </li>
                            <li className="button item" onClick={onLogout}>
                                Logout
                            </li>
                            <hr />
                            <li className="button item quit" onClick={onDeleteAccount}>
                                Delete Account
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </StyledWrapper>
    );
};

// ✅ Styled components
const StyledWrapper = styled.div`
  .template {
    --fill: transparent;
    --fill-hover: rgba(45, 106, 79, 0.1);
    --fill-active: rgba(45, 106, 79, 0.2);
    --txt: var(--color-text-primary);
    --br: 0.625rem;
    --gap: 0.25rem;
    --popup-main-h: 20rem;
    display: flex;
    font-size: 0.975rem;
    color: var(--txt);
  }
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    height: auto;
    line-height: normal;
    background: none;
    border-radius: 6px;
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .button:hover {
    background-color: var(--fill-hover);
  }
  .button.quit:hover {
    background-color: #fee2e2;
    color: #b91c1c;
  }
  .button:focus,
  .button:active,
  .button.active {
    background-color: var(--fill-active);
  }
  hr {
    margin: 0.8rem;
    border: 1px dashed #313131;
  }
  .popup {
    position: relative;
  }
  .popup-header {
    display: flex;
    align-items: center;
    gap: calc(var(--gap) * 3);
  }
  .popup-main {
    position: absolute;
    top: 100%;
    right: 0;
    opacity: 0;
    margin-top: var(--gap);
    border-radius: var(--br);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    transition: 0.4s;
    overflow: hidden;
    height: auto;
    min-width: 180px;
    padding: 0.5rem 0;
    box-shadow: var(--shadow-md);
  }
  .popup:focus .popup-main {
    margin-top: 1rem;
    opacity: 1;
  }
  .list-box {
    overflow: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: calc(var(--gap) * 2) 0 calc(var(--gap) * 3) 0;
  }
`;

export default ProfileButton;
