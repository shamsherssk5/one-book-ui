import axios from "axios";
import React, { useEffect } from "react";
import FileUploaderListViewer from "../common/FileUploaderListViewer";
import Gap from "../common/Gap";
import History from "../common/History";
import { MessageBox } from "../common/MessageBox";
import Colors from "./Colors";
import moment from "moment-timezone";

const RemDetails = ({ rightContent, setToken, currentReminder, setData }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const handleDelete = (id) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.id === currentReminder.id) {
          let updatedAttach = cust.attachments.filter((a) => a.fileID != id);
          cust.attachments = updatedAttach;
        }
        return cust;
      });
      return updatedData;
    });
  };

  const handleUpload = (file) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.id === currentReminder.id) {
          cust.attachments.push(file);
        }
        return cust;
      });
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!currentReminder) return;
    if (currentReminder.attachments && currentReminder.attachments.length > 0)
      return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=rem" +
          currentReminder.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.id === currentReminder.id) {
              cust["attachments"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentReminder, rightContent]);

  useEffect(async () => {
    if (!currentReminder) return;
    if (currentReminder.history && currentReminder.history.length > 0) return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=rem" +
          currentReminder.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.id === currentReminder.id) {
              cust["history"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentReminder, rightContent]);

  useEffect(async () => {
    if (!currentReminder) return;
    if (currentReminder.contacts && currentReminder.contacts.length > 0) return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/contacts?ID=" +
          currentReminder.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.id === currentReminder.id) {
              cust["contacts"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentReminder, rightContent]);

  useEffect(async () => {
    if (!currentReminder) return;
    if (
      currentReminder.conversations &&
      currentReminder.conversations.length > 0
    )
      return;
    if (rightContent !== "Details") return;

    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/conversations?ID=rem" +
          currentReminder.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.id === currentReminder.id) {
              cust["conversations"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentReminder]);

  const handleOnSendMessage = (messageData) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.id === currentReminder.id) {
          cust.conversations.push(messageData);
        }
        return cust;
      });
      return updatedData;
    });
  };

  return rightContent === "Details" && currentReminder ? (
    <div className="task-details-box">
      <div className="task-details-container">
        <div className="details-container">
          <div className="user-details-container">
            <table
              className="equalDivide"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              border="0"
            >
              <tbody>
                <tr style={{ width: "100%!important" }}>
                  <td className="table-heading" style={{ width: "50%" }}>
                    Ref#
                  </td>
                  <td align="left" className="table-heading">
                    <span style={{ color: Colors[currentReminder.category] }}>
                      {currentReminder.category}
                    </span>
                  </td>
                </tr>
                <tr style={{ width: "100%!important" }}>
                  <td className="table-heading category-dark">
                    {currentReminder.refText}-{currentReminder.refNum}
                  </td>
                  <td align="left" className="table-heading">
                    <span
                      className="categoryTd"
                      style={{
                        background: Colors[currentReminder.category],
                        padding: "0.4vh 1.5vw",
                      }}
                    >
                      {currentReminder.days} Days
                    </span>
                  </td>
                </tr>
                <tr />
                <tr>
                  <td colSpan="2" className="table-heading">
                    Type
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="table-heading category-dark">
                    {currentReminder.type}
                  </td>
                </tr>
                <tr />
                <tr>
                  <td colSpan="2" className="table-heading">
                    Title
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="blue-heading">
                    {currentReminder.title}
                  </td>
                </tr>
                <tr />
                <tr>
                  <td colSpan="2">
                    <table>
                      <tbody>
                        <tr style={{ width: "100%!important" }}>
                          <td
                            className="table-heading"
                            style={{ width: "65%" }}
                          >
                            Reminder / Expiry Date
                          </td>
                          <td align="left" className="table-heading">
                            Repeat Interval
                          </td>
                        </tr>
                        <tr style={{ width: "100%!important" }}>
                          <td className="table-heading category-dark">
                            {moment(currentReminder.remDate).format(
                              currentUser.dateFormat
                            )}{" "}
                            {currentReminder.noTime !== 1 &&
                              `- ${moment(
                                currentReminder.remTime,
                                "HH:mm:ss"
                              ).format(
                                currentUser.timeFormat === "12 Hrs"
                                  ? "hh:mm A"
                                  : "HH:mm"
                              )}`}
                          </td>
                          <td
                            align="left"
                            className="table-heading category-dark"
                          >
                            {currentReminder.inter_val}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr />
                <tr>
                  <td colSpan="2" className="table-heading">
                    Alert me before
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="table-heading category-dark">
                    {currentReminder.be_fore} {currentReminder.beforeType}
                  </td>
                </tr>
                <tr />
                <tr>
                  <td colSpan="2" className="table-heading">
                    Assigned to
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="table-heading category-dark">
                    {currentReminder.userNames}
                  </td>
                </tr>
                <tr />
                <tr style={{ width: "100%!important" }}>
                  <td colSpan="2" className="table-heading">
                    Created By
                  </td>
                </tr>
                <tr style={{ width: "100%!important" }}>
                  <td className="table-heading category-dark">
                    {currentReminder.assignee}
                  </td>
                  <td align="right" className="table-heading category-dark">
                    {currentReminder.created_date &&
                      moment(
                        currentReminder.created_date
                          .replace("T", " ")
                          .replace("Z", "")
                      ).format(
                        currentUser.dateFormat +
                          (currentUser.timeFormat === "12 Hrs"
                            ? " hh:mm A"
                            : " HH:mm")
                      )}
                  </td>
                </tr>
                <tr />
                <tr>
                  <td
                    colSpan="2"
                    className="table-heading"
                    style={{ color: "#2687D7" }}
                  >
                    Notes
                  </td>
                </tr>
                <tr>
                  <td className="table-heading" colSpan="2">
                    {currentReminder.notes}
                  </td>
                </tr>
                <tr />
                <tr />
                {currentReminder &&
                  currentReminder.contacts &&
                  currentReminder.contacts.length > 0 && (
                    <tr
                      style={{
                        paddingBottom: "2vh",
                        borderTop: "0.5px solid #239BCF",
                      }}
                    ></tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {currentReminder &&
        currentReminder.contacts &&
        currentReminder.contacts.length > 0 && (
          <div className="messages task-details-container">
            <div className="message-Heading">Authorized Contact</div>
            <div className="message-content" style={{ border: "none" }}>
              {currentReminder.contacts.map((contact, i) => (
                <table
                  className="equalDivide"
                  cellPadding="0"
                  cellSpacing="0"
                  width="100%"
                  border="0"
                >
                  <tbody>
                    {i > 0 && (
                      <tr
                        style={{
                          paddingBottom: "2vh",
                          borderTop: "0.5px solid #239BCF",
                        }}
                      ></tr>
                    )}
                    <tr>
                      <td className="table-heading" colSpan="2">
                        Company Name
                      </td>
                    </tr>
                    <tr>
                      <td className="table-heading category-dark" colSpan="2">
                        {contact.companyName}
                      </td>
                    </tr>
                    <tr />
                    <tr>
                      <td className="table-heading" colSpan="2">
                        Contact person
                      </td>
                    </tr>
                    <tr>
                      <td className="table-heading category-dark" colSpan="2">
                        {contact.contactPerson}
                      </td>
                    </tr>
                    <tr />
                    <tr>
                      <td className="table-heading" colSpan="2">
                        Email ID
                      </td>
                    </tr>
                    <tr>
                      <td className="table-heading category-dark" colSpan="2">
                        {contact.email}
                      </td>
                    </tr>
                    <tr />
                    <tr>
                      <td className="table-heading" colSpan="2">
                        Tel Number
                      </td>
                    </tr>
                    <tr>
                      <td className="table-heading category-dark" colSpan="2">
                        {contact.phone}
                      </td>
                    </tr>
                    <tr />
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        )}
      <Gap />
      {currentReminder && currentReminder.conversations && (
        <MessageBox
          setToken={setToken}
          data={currentReminder.conversations}
          currentUser={currentUser}
          handleOnSendMessage={handleOnSendMessage}
          moduleID={"rem" + currentReminder.id}
          heading="Comments"
        ></MessageBox>
      )}
      <Gap />
      {currentReminder && currentReminder.attachments && (
        <FileUploaderListViewer
          isView={true}
          setToken={setToken}
          data={currentReminder.attachments}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="rem"
          id={"rem" + currentReminder.id}
        />
      )}
      <Gap />
      {currentReminder && currentReminder.history && (
        <History data={currentReminder.history} />
      )}
    </div>
  ) : (
    ""
  );
};

export default RemDetails;
