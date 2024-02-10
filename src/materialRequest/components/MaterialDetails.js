import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Colors from "./MatColors";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import { MessageBox } from "../../common/MessageBox";
import History from "../../common/History";
import Gap from "../../common/Gap";
import moment from "moment-timezone";

const MaterialDetails = ({
  rightContent,
  matData,
  setData,
  currentUser,
  setToken,
}) => {
  const ref = useRef(null);
  const handleDelete = (id) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.matID === matData.matID) {
          let updatedAttach = cust.attachments.filter((a) => a.fileID != id);
          cust.attachments = updatedAttach;
          cust.attachmentsCount = (cust.attachmentsCount || 1) - 1;
        }
        return cust;
      });
      return updatedData;
    });
  };
  const handleUpload = (file) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.matID === matData.matID) {
          cust.attachments.push(file);
        }
        return cust;
      });
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!matData) return;
    if (matData.attachments && matData.attachments.length > 0) return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=mtr" +
          matData.matID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.matID === matData.matID) {
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
  }, [matData]);

  useEffect(async () => {
    if (!matData) return;
    if (matData.history && matData.history.length > 0) return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=mtr" +
          matData.matID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.matID === matData.matID) {
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
  }, [matData]);

  const handleOnSendMessage = (messageData) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.matID === matData.matID) {
          cust.conversations.push(messageData);
        }
        return cust;
      });
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!matData) return;
    if (matData.conversations && matData.conversations.length > 0) return;
    if (rightContent !== "Details") return;

    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/conversations?ID=mtr" +
          matData.matID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.matID === matData.matID) {
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
  }, [matData]);

  return (
    rightContent === "Details" &&
    (matData != null ? (
      <div className="task-details-box" ref={ref}>
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
                  <tr>
                    <td colSpan="2">
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr style={{ width: "100%!important" }}>
                            <td
                              className="table-heading"
                              style={{ width: "50%" }}
                            >
                              MR Ref#
                            </td>
                            <td align="left" className="table-heading">
                              Status
                            </td>
                          </tr>
                          <tr style={{ width: "100%!important" }}>
                            <td className="table-heading category-dark">
                              {matData.refText}
                              {matData.refNum}
                            </td>
                            <td align="left" className="table-heading">
                              <span
                                className="categoryTd"
                                style={{ background: Colors[matData.status] }}
                              >
                                {matData.status}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Department/Section
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading category-dark" colSpan="2">
                      {matData.department}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      MaterialName
                    </td>
                  </tr>
                  <tr>
                    <td className="blue-heading" colSpan="2">
                      {matData.materialName}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="left-td">QTY</td>
                    <td className="right-td">Unit</td>
                  </tr>
                  <tr>
                    <td className="blue-heading">{matData.quantity}</td>
                    <td className="blue-heading">{matData.unit}</td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Related Project
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {matData.projectCode} - {matData.projectRelated}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      CreatedBy
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr style={{ width: "100%!important" }}>
                            <td className="table-heading category-dark">
                              {matData.createdBy}
                            </td>
                            <td align="right" className="table-heading">
                              {moment(
                                matData.requestedDate
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
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Priority
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        color: Colors[matData.priority],
                        fontWeight: "700",
                      }}
                      className="table-heading category-dark"
                      colSpan="2"
                    >
                      {matData.priority === "Custom Date"
                        ? ""
                        : matData.priority}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td
                      className="table-heading category-dark"
                      colSpan="2"
                      style={{ color: "#2687D7" }}
                    >
                      Notes
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {matData.notes}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Gap />
        {matData && matData.attachments && (
          <FileUploaderListViewer
            isView={true}
            setToken={setToken}
            data={matData.attachments}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            module="mtr"
            id={"mtr" + matData.matID}
          />
        )}
        <Gap />
        {matData && matData.conversations && (
          <MessageBox
            setToken={setToken}
            data={matData.conversations}
            currentUser={currentUser}
            handleOnSendMessage={handleOnSendMessage}
            moduleID={"mtr" + matData.matID}
            heading="Conversations"
          ></MessageBox>
        )}
        <Gap />
        {matData && matData.history && <History data={matData.history} />}
      </div>
    ) : (
      ""
    ))
  );
};

export default MaterialDetails;
