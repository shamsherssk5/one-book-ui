import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Style from "../../tasks/css/task.module.css";
import Dots from "../../tasks/assets/vertical-dots.png";
import axios from "axios";
import toast from "react-hot-toast";

const UserListItems = ({ currentItems, editRole, setToken, setUsersList }) => {
  const handleBlockUnBlock = async (user) => {
    document.body.click();
    await axios
      .post(process.env.REACT_APP_API_ENDPOINT + "/settings/blockUser", user, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        setUsersList((prevState) => {
          let updated = prevState.filter((us) => {
            if (us.userID === user.userID) {
              us.active = user.active == "yes" ? "no" : "yes";
            }
            return us;
          });
          return updated;
        });
        toast.success(
          "User " +
            (user.active == "yes" ? "UnBlocked" : "Blocked") +
            " Sucessfully"
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("User Block/UnBlock Failed");
      });
  };

  const handleDelete = async (user) => {
    document.body.click();
    await axios
      .post(process.env.REACT_APP_API_ENDPOINT + "/settings/deleteUser", user, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        setUsersList((prevState) => {
          let updated = prevState.filter((us) => us.userID !== user.userID);
          return updated;
        });
        toast.success("User Deleted Sucessfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("User Deletion Failed");
      });
  };

  return (
    <div className="list-container-box">
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <table className="list-view-table">
          <thead className="thead-class">
            <tr className="list-view-header-row users-list-th">
              <th width="24%">User Name</th>
              <th width="24%">Email</th>
              <th width="24%">Role</th>
              <th width="24%">Last Login Info</th>
              <th width="4%"></th>
            </tr>
          </thead>
          <tbody className="tbody-class">
            {currentItems &&
              currentItems.map((user, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container users-list-tr"
                    >
                      <td width="24%">{user.userName}</td>
                      <td width="24%">{user.email}</td>
                      <td width="24%">{user.role}</td>
                      <td width="24%">{user.lastLoginInfo}</td>
                      <td width="4%">
                        <OverlayTrigger
                          placement="left"
                          trigger="click"
                          rootClose
                          overlay={
                            <Popover>
                              <div className={Style.popup}>
                                <p
                                  className="p-leave"
                                  onClick={() => editRole(user)}
                                >
                                  Edit Role
                                </p>
                                <p
                                  className={Style.delete}
                                  onClick={() => handleDelete(user)}
                                >
                                  Delete
                                </p>
                                <p
                                  className={Style.delete}
                                  onClick={() => handleBlockUnBlock(user)}
                                >
                                  {user.active == "yes" ? "Block" : "UnBlock"}
                                </p>
                              </div>
                            </Popover>
                          }
                        >
                          <img
                            title="Modify"
                            variant="success"
                            className="vertical-dots"
                            src={Dots}
                          />
                        </OverlayTrigger>
                      </td>
                    </tr>
                    <tr className="empty-row-container">
                      <td width="100%" className="border-td" colSpan="8">
                        <div></div>
                      </td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListItems;
