import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Gr_Sr from "../../assets/images/gr_sr.png";
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import UserPaginatedItems from "./UserPaginatedItems";
import "./userFrom.css";

const User = ({
  setNext,
  setToken,
  actionName,
  setactionName,
  loading,
  rolesList,
  setRolesList,
}) => {
  const [actualData, setActualData] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  let emptyUser = { userName: "", email: "", role: "", lastLoginInfo: "" };
  const [formData, setFormdata] = useState(emptyUser);
  const [isCreateVisible, setIscreateVisible] = useState(false);
  const handleFormChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const editRole = (user) => {
    document.body.click();
    setFormdata(user);
    setSubmitValue("Update");
    setIscreateVisible(true);
  };

  const [usersList, setUsersList] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [submitValue, setSubmitValue] = useState("Save");

  useEffect(async () => {
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    if (actionName !== "Users" && actionName !== "Roles") return;
    if (rolesList.length > 0) return;
    if (currentUser && currentUser.orgID === 0) {
      setFormdata(emptyUser);
      setUsersList([]);
      alert("Please Update Organization");
      setactionName("Organization");
      return;
    } else {
      loading({ visibility: true, message: "Loading Roles..." });
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/settings/rolesList?ID=" +
            currentUser.orgID,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setRolesList(res.data);
          loading({ visibility: false });
        })
        .catch((err) => {
          console.log(err);
          loading({ visibility: false });
        });
    }
  }, [actionName]);

  const handleSave = async (e) => {
    e.preventDefault();
    let mailformat =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (formData.userName.trim().length <= 0) {
      toast.error("Please Enter username");
      return;
    } else if (formData.email.trim().length <= 0) {
      toast.error("Please Enter Email");
      return;
    } else if (!formData.email.match(mailformat)) {
      toast.error("Invalid Email");
      return;
    } else if (formData.role.length <= 0) {
      toast.error("Please select Role");
    } else {
      let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
      if (submitValue === "Update") {
        setSubmitValue("...Updating");
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/settings/updateUserRole",
            formData,
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }

            setUsersList((prevState) => {
              prevState.filter((user) => {
                if (user.userID === formData.userID) {
                  user.role = formData.role;
                }
                return user;
              });
              return prevState;
            });
            toast.success("User updated Sucessfully");
            setSubmitValue("Save");
            setIscreateVisible(false);
            setFormdata(emptyUser);
          })
          .catch((err) => {
            console.log(err);
            toast.error("User updation Failed");
            setSubmitValue("Update");
          });
      } else {
        setSubmitValue("...Saving");
        formData["env"] = process.env.REACT_APP_URL;
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT +
              "/settings/createUser?orgID=" +
              currentUser.orgID +
              "&orgname=" +
              currentUser.orgID,
            formData,
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }

            if (res.data.message) {
              toast.error(res.data.message);
              setSubmitValue("Save");
            } else {
              formData["userID"] = res.data.insertId;
              formData["active"] = "yes";
              setUsersList([...usersList, formData]);
              toast.success("User Created Sucessfully");
              setIscreateVisible(false);
              setFormdata(emptyUser);
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("User creation Failed");
            setSubmitValue("Save");
          });
      }
    }
  };

  useEffect(async () => {
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    if (actionName !== "Users") return;
    if (usersList.length > 0) return;
    if (currentUser && currentUser.orgID === 0) {
      setFormdata(emptyUser);
      setUsersList([]);
      alert("Please Update Organization");
      setactionName("Organization");
      return;
    } else {
      loading({ visibility: true, message: "Loading Users..." });
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/settings/getUsers?ID=" +
            currentUser.orgID,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }

          if (res.data.length > 0) {
            setUsersList(res.data);
          } else {
            setUsersList([]);
          }

          loading({ visibility: false });
        })
        .catch((err) => {
          console.log(err);
          loading({ visibility: false });
        });
    }
  }, [actionName]);

  const handleSearchChange = (e) => {
    if (e.target.value === undefined || e.target.value === "") {
      setUsersList(actualData);
      return;
    }
    let UserP = usersList.filter(
      (d) =>
        d.userName !== undefined &&
        d.userName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setUsersList(UserP);
  };

  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") setUsersList(actualData);
  };

  return (
    actionName === "Users" && (
      <div className="users-list-add-container">
        <div className="user-header-container">
          <div style={{ width: "50%", heigt: "100%", textAlign: "left" }}>
            <span className="usr-count-text">
              Current Users ({usersList.length} User)
            </span>
          </div>
          <div style={{ width: "50%", heigt: "100%", textAlign: "right" }}>
            {!isSearchOpen && (
              <img
                title="Search Task"
                className="left-gs-img search-button search-users"
                src={Gr_Sr}
                onClick={() => {
                  searchOpen(true);
                  setActualData(usersList);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder="Enter Text"
                  className="search-button-text search-users"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                />
                <span
                  title="close Search"
                  className="calendar-closee template search-users"
                  onClick={() => {
                    searchOpen(false);
                    setUsersList(actualData);
                  }}
                >
                  &#10006;
                </span>{" "}
              </>
            )}
          </div>
        </div>

        <div className="users-add-container create-task-container">
          <form autoComplete="off" noValidate={true}>
            <div className="users-equal-div" style={{ paddingLeft: "1.4vw" }}>
              <button
                className="user-entry-new-Btn save-button"
                onClick={(e) => {
                  e.preventDefault();
                  setIscreateVisible(true);
                  setSubmitValue("Save");
                  setFormdata(emptyUser);
                }}
              >
                Create New User
              </button>
            </div>
            {isCreateVisible && (
              <>
                <div className="users-equal-div">
                  <fieldset>
                    <legend>User Name</legend>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleFormChange}
                      placeholder="Enter User Name"
                      readOnly={submitValue === "Update"}
                    />
                  </fieldset>
                </div>
                <div className="users-equal-div">
                  <fieldset>
                    <legend>Email ID</legend>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Enter Email ID"
                      readOnly={submitValue === "Update"}
                    />
                  </fieldset>
                </div>
                <div className="users-equal-div">
                  <fieldset>
                    <legend>Role</legend>
                    <select
                      className="title"
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select Role
                      </option>
                      {rolesList &&
                        rolesList.map((role) => (
                          <option value={role.name}>{role.name}</option>
                        ))}
                    </select>
                  </fieldset>
                </div>
                <div className="users-equal-div">
                  <button
                    className="user-entry-new-Btn save-button"
                    onClick={handleSave}
                  >
                    {submitValue}
                  </button>
                  <img
                    title="Close"
                    className="user-add-close"
                    src={Filter_Clear}
                    onClick={() => {
                      setIscreateVisible(false);
                      setFormdata(emptyUser);
                      setSubmitValue("Save");
                    }}
                  />
                </div>
              </>
            )}
          </form>
        </div>

        <div className="users-list-container">
          <UserPaginatedItems
            setToken={setToken}
            setUsersList={setUsersList}
            editRole={editRole}
            itemsPerPage={itemsPerPage}
            items={usersList}
            setItemsPerPage={setItemsPerPage}
          />
        </div>
      </div>
    )
  );
};

export default User;
