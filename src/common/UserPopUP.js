import React from "react";
import Avatar from "react-avatar";
import { useNavigate } from "react-router-dom";
import "./styles/userpopup.css";

const UserPopUP = ({ setToken, setOrgdData }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let navigate = useNavigate();

  const handleLogout = () => {
    setToken(undefined);
    setOrgdData(undefined);
    window.localStorage.removeItem("currentUser");
    window.localStorage.removeItem("token");
  };
  return (
    <div className="user-pop-up">
      <div className="profile-pic-container">
        <div className="profile-pic-box">
          {currentUser.username && (
            <Avatar
              size="6vw"
              title={currentUser.username}
              round="50%"
              textSizeRatio={3}
              textMarginRatio={0.15}
              name={currentUser.username}
            />
          )}
        </div>
      </div>
      <div className="user-name-container">
        <span>{currentUser.username}</span>
      </div>
      <div className="user-email-container">{currentUser.email}</div>
      <div className="log-out-button-container">
        <button className="save-button log-out-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      <div className="user-email-container border-container">
        <span className="edit-profile">Edit Profile</span>
      </div>
      <div className="settings-option-container">
        <a
          className="edit-profile"
          onClick={() => {
            navigate("/settings");
            document.body.click();
          }}
        >
          Account Settings
        </a>
      </div>
      <div className="settings-option-container">
        <a className="edit-profile">Appearance Settings</a>
      </div>
    </div>
  );
};

export default UserPopUP;
