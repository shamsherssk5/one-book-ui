import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Financial from "./Financial";
import { Location } from "./Location";
import Organization from "./Organization/index";
import { Series } from "./Series";
import "./settings.css";
import Back_Button from "../assets/images/back-button.png";
import User from "./Users/User";
import Roles from "./Roles/Roles";
import { useLocation } from "react-router-dom";

const Settings = (props) => {
  let orgList = [
    "Organization",
    "Financial",
    "Users",
    "Roles",
    "Location",
    "Series",
    "Approvals",
    "Email & PDF Templates",
    "History",
    "Subscription & Billing",
  ];
  const { state } = useLocation();
  const [actionName, setactionName] = useState(
    (state && state.component) || "Organization"
  );
  const settingScroll = useRef(null);
  const [rolesList, setRolesList] = useState([]);
  const handleBack = () => {
    setactionName(orgList[orgList.indexOf(actionName) - 1]);
  };

  const setNext = () => {
    setactionName(orgList[orgList.indexOf(actionName) + 1]);
  };
  return (
    <div className="main-left-right-div-container temp2Setting">
      <div className="left-div-header setting-header">
        <img
          className="back-button-pic"
          src={Back_Button}
          onClick={handleBack}
          style={{
            display: orgList.indexOf(actionName) > 0 ? "block" : "none",
          }}
        />
        <span className="header-title-sub setting-left">GENERAL</span>
        <span className="header-title-main setting-left">Settings</span>
      </div>
      <div className="settings-content-box">
        <div className="setting-content-left-box">
          <div className="menubox">
            {orgList.map((item, index) => {
              return (
                <div
                  id={index}
                  style={
                    actionName === item
                      ? { color: "#2687d7", fontWeight: "700" }
                      : {}
                  }
                  className="menulabal"
                  onClick={(e) => setactionName(item)}
                >
                  <span
                    style={
                      actionName === item
                        ? { borderBottom: "0.15vw solid #ffc086" }
                        : {}
                    }
                    className="menu-label-text"
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="setting-content-right-box" ref={settingScroll}>
          <Organization
            setNext={setNext}
            settingScroll={settingScroll}
            loading={props.loading}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
            orgData={props.orgData}
            setOrgdData={props.setOrgdData}
          />
          <Financial
            setNext={setNext}
            settingScroll={settingScroll}
            loading={props.loading}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
          />
          <Location
            setNext={setNext}
            loading={props.loading}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
          />
          <User
            setNext={setNext}
            loading={props.loading}
            rolesList={rolesList}
            setRolesList={setRolesList}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
          />
          <Roles
            setNext={setNext}
            loading={props.loading}
            rolesList={rolesList}
            setRolesList={setRolesList}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
          />
          <Series
            setNext={setNext}
            loading={props.loading}
            setToken={props.setToken}
            actionName={actionName}
            setactionName={setactionName}
          />
          {/* <Approvals setNext={setNext} loading={props.loading} setToken={props.setToken} actionName={actionName} setactionName={setactionName} /> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
