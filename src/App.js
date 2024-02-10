import React, { useEffect, useState } from "react";
import Reels from "./assets/images/reels.png";
import Srch from "./assets/images/srch.png";
import Usr from "./assets/images/usr.png";
import Plus from "./assets/images/plus.png";
import Bell from "./assets/images/bell.png";
import Apprv from "./assets/images/apprv.png";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./structure1.css";
import "./structure2.css";
import Structure2 from "./Structure2";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  HashRouter,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import Template1Tasks from "./tasks/components/view/template1Tasks";
import { Toaster } from "react-hot-toast";
import PageLoader from "./tasks/components/helpers/PageLoader";
import CustomersHome from "./customers/components/customersHome";
import Auth from "./login/Auth";
import {
  ButtonGroup,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { CustomToggle } from "./DropDown";
import Settings from "./Settings/Settings";
import UserPopUP from "./common/UserPopUP";
import axios from "axios";
import { FilePreviewerThumbnail } from "react-file-previewer";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import PhonebookHome from "./phonebook/components/PhonebookHome";
import MaterialRequestHome from "./materialRequest/components/MaterialRequestHome";
import SuppliersHome from "./suppliers/components/SuppliersHome";
import MaterialHome from "./materials/components/MaterialHome";
import Panel from "./panel/Panel";
import Inventoryhome from "./inventory/components/Inventoryhome";
import ReminderHome from "./reminders/ReminderHome";
import EstimateHome from "./estimate/components/EstimateHome";
import QuoteHome from "./quotes/components/QuoteHome";
function App() {
  let navigate = useNavigate();
  const [loader, loading] = useState({
    visibility: false,
    message: "Loading...",
  });
  const [token, setToken] = useState(window.localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(window.localStorage.getItem("currentUser"))
  );
  const [menuList, setMenuList] = useState([]);
  const [orgData, setOrgdData] = useState();

  useEffect(async () => {
    if (orgData) return;
    let tok = window.localStorage.getItem("token");
    let user = JSON.parse(window.localStorage.getItem("currentUser"));
    if (tok && user) {
      loading({ visibility: true, message: "Loading..." });
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/settings/getLandingPageData?userID=" +
            user.id,
          { headers: { Authorization: tok } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          loading({ visibility: false });
          if (res.data.length > 0) {
            setOrgdData(res.data[0]);
          } else {
            navigate("/settings");
          }
        })
        .catch((err) => {
          console.log(err);
          loading({ visibility: false });
        });
    }
  }, [token]);

  useEffect(async () => {
    if (menuList.length > 0) return;
    let tok = window.localStorage.getItem("token");
    let user = JSON.parse(window.localStorage.getItem("currentUser"));
    if (tok && user) {
      loading({ visibility: true, message: "Loading Menus..." });
      await axios
        .get(process.env.REACT_APP_API_ENDPOINT + "/settings/fetchMenus", {
          headers: { Authorization: tok },
        })
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          loading({ visibility: false });
          setMenuList(res.data);
        })
        .catch((err) => {
          console.log(err);
          loading({ visibility: false });
        });
    }
  }, [token]);

  const checkNavigation = (menu) => {
    let clickedMenu = menuList.filter((men) => men.menu === menu)[0];
    if (!clickedMenu.isClickable == 0) navigate(clickedMenu.url.toLowerCase());
  };

  const handleSubMenuClick = (e, men) => {
    e.preventDefault();
    if (window.location.pathname.includes(men.url)) {
      console.log("I am URL");
      window.location.reload();
    }
    console.log("I am navigate");
    navigate(men.url.toLowerCase());
  };

  if (!token) {
    return (
      <>
        <Toaster />
        <Auth setToken={setToken} setCurrentUser={setCurrentUser}></Auth>
      </>
    );
  }

  return (
    <>
      <PageLoader visible={loader.visibility} message={loader.message} />
      <div className="App myscrollbar">
        <Toaster />
        <div className="main-head">
          <div className="header-top-part">
            <div className="text-part">
              <div className="wh-bg-div">
                <div
                  className="wh-bg"
                  style={{
                    backgroundColor:
                      orgData && orgData.filename ? "transparent" : "#fff",
                  }}
                >
                  {orgData && orgData.filename && (
                    <FilePreviewerThumbnail
                      file={{
                        url:
                          process.env.REACT_APP_API_ENDPOINT +
                          "/auth/getFile?name=/orgLogo/" +
                          orgData.filename,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="non-wh-bg">
                <div style={{ width: "47%", height: "100%" }}>
                  <span>
                    Organization
                    <strong>
                      {(orgData && orgData.crm) || "Artefact Exhibition LLC"}
                    </strong>
                  </span>
                </div>
                <div className="horizontal-border"></div>
              </div>
            </div>
            <div className="r-text-part">
              <span>
                <marquee>One Book</marquee>
              </span>
              <img variant="success" className="rel" src={Reels} />
            </div>
          </div>
          <div className="header-bottom-part">
            <div class="links-container">
              {[...new Set(menuList.map((m) => m.menu))].map((menu, index) => (
                <Dropdown id="custome-menu">
                  <Dropdown.Toggle
                    as={CustomToggle}
                    id="dropdown-custom-components"
                  >
                    <span onClick={() => checkNavigation(menu)}> {menu}</span>
                  </Dropdown.Toggle>
                  {menuList.filter(
                    (men) => men.menu === menu && men.submenu.length > 0
                  ).length > 0 && (
                    <Dropdown.Menu id="list-menu">
                      {menuList
                        .filter((men) => men.menu === menu)
                        .map((men, index) => (
                          <Dropdown.Item
                            id="list-a-item"
                            onClick={(e) => handleSubMenuClick(e, men)}
                            eventKey={index}
                            href={men.url.toLowerCase()}
                          >
                            {men.submenu}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  )}
                </Dropdown>
              ))}
            </div>
            <div class="images-container">
              <img className="search" src={Srch} />
              <OverlayTrigger
                placement="bottom-end"
                trigger="click"
                rootClose={true}
                overlay={
                  <Popover>
                    <UserPopUP setToken={setToken} setOrgdData={setOrgdData} />
                  </Popover>
                }
              >
                <div className="user-holder">
                  {currentUser && currentUser.username ? (
                    <span>
                      <Avatar
                        size="1.7vw"
                        title={currentUser.username}
                        round="50%"
                        textSizeRatio={3}
                        textMarginRatio={0.15}
                        name={currentUser.username}
                      />
                    </span>
                  ) : (
                    <img className="user" src={Usr}></img>
                  )}
                </div>
              </OverlayTrigger>
            </div>
          </div>
        </div>
        <div className="content-part">
          <div className="main-content-div">
            <Routes>
              <Route exact path="/" element={<Panel setToken={setToken} />} />
              <Route path="/panel" element={<Panel setToken={setToken} />} />
              <Route
                path="/suppliers"
                element={
                  <SuppliersHome setToken={setToken} loading={loading} />
                }
              />
              <Route
                path="/materialrequest"
                element={
                  <MaterialRequestHome loading={loading} setToken={setToken} />
                }
              />
              <Route
                path="/pnm"
                element={<MaterialHome loading={loading} setToken={setToken} />}
              />
              <Route
                path="/phonebook"
                element={
                  <PhonebookHome loading={loading} setToken={setToken} />
                }
              />
              <Route
                path="/tasks"
                element={
                  <Template1Tasks loading={loading} setToken={setToken} />
                }
              />
              <Route
                path="/reminders"
                element={<ReminderHome loading={loading} setToken={setToken} />}
              />
              <Route
                path="/customers"
                element={
                  <CustomersHome setToken={setToken} loading={loading} />
                }
              />
              <Route
                path="/inventory"
                element={
                  <Inventoryhome setToken={setToken} loading={loading} />
                }
              />
              <Route
                path="/estimation"
                element={
                  <EstimateHome
                    setToken={setToken}
                    loading={loading}
                    logo={
                      process.env.REACT_APP_API_ENDPOINT +
                      "/auth/getFile?name=/orgLogo/" +
                      (orgData ? orgData.filename : "")
                    }
                  />
                }
              />
              <Route
                path="/quotes"
                element={
                  <QuoteHome
                    setToken={setToken}
                    loading={loading}
                    logo={
                      process.env.REACT_APP_API_ENDPOINT +
                      "/auth/getFile?name=/orgLogo/" +
                      (orgData ? orgData.filename : "")
                    }
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    setToken={setToken}
                    orgData={orgData}
                    setOrgdData={setOrgdData}
                    loading={loading}
                  />
                }
              />
            </Routes>
          </div>
          <div className="notification-bar">
            <div className="notif-table-container">
              <div className="notif-images-container">
                <span>
                  <img className="img-size" src={Bell} />
                </span>
                <span className="sup">44</span>
                <span className="notif-title"> Notification </span>
              </div>
              <div className="notif-images-container">
                <img className="img-size" src={Apprv} />
                <span className="sup">444</span>
                <span className="notif-title"> Approvals </span>
              </div>
              <div className="notif-images-container">
                <span>
                  <img className="img-size" src={Plus} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
