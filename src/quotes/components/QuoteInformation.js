import React, { useRef } from "react";
import EstimateColors from "../../estimate/components/EstimateColors";
import moment from "moment-timezone";
import Gap from "../../common/Gap";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import OneBookDiscussion from "../../discussion/OneBookDiscussion";
import History from "../../common/History";

const QuoteInformation = ({
  rightContent,
  currentQuote,
  stats,
  setToken,
  sideMenu,
}) => {
  const [attachments, setAttachments] = useState();
  const [discussions, setDiscussions] = useState();
  const [history, setHistory] = useState();
  const ref = useRef(null);
  useEffect(async () => {
    if (!currentQuote || sideMenu !== "discussions") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/discussion?ID=quote" +
          currentQuote.quoteID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data) {
          let actual = res.data;
          let comment = actual.filter((c) => c.isreply === "no");
          let withReplies = comment.map((c) => {
            c["replies"] = actual.filter((a) => a.parentId === c.comId);
            return c;
          });

          setDiscussions(withReplies);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentQuote, sideMenu]);
  useEffect(async () => {
    if (!currentQuote || sideMenu !== "history") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=quote" +
          currentQuote.quoteID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setHistory(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentQuote, sideMenu]);

  useEffect(() => {
    setDiscussions();
    setHistory();
  }, [currentQuote, rightContent]);

  const handleSubmit = (data) => {
    let payload = {
      ...data,
      moduleID: "quote" + currentQuote.quoteID,
      timeZone: currentUser.timeZone,
    };
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/common/postComment",
        payload,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("Comment Post success with ID" + res.data.insertId);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDiscusDelete = (data) => {
    let payload = { ...data, moduleID: "quote" + currentQuote.quoteID };
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/common/deleteComment",
        payload,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("Comment Deleted");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleEdit = (data) => {
    let payload = { ...data, moduleID: "quote" + currentQuote.quoteID };
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/common/editComment",
        payload,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("Comment Edited success");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleReply = (data) => {
    if (data.parentOfRepliedCommentId) {
      data.repliedToCommentId = data.parentOfRepliedCommentId;
    }
    let payload = {
      ...data,
      moduleID: "quote" + currentQuote.quoteID,
      timeZone: currentUser.timeZone,
    };
    axios
      .post(process.env.REACT_APP_API_ENDPOINT + "/common/addReply", payload, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("Comment Replied");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const setDiscussionData = (data) => {};
  const handleDelete = (id) => {
    setAttachments((prev) => {
      let updatedData = prev.filter((a) => a.fileID != id);
      return updatedData;
    });
  };

  const handleUpload = (file) => {
    setAttachments((prev) => {
      let updatedData = [...prev, file];
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!currentQuote) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=quote" +
          currentQuote.quoteID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setAttachments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentQuote]);

  const [approver, setApprover] = useState(null);
  const [requester, setRequester] = useState(null);
  useEffect(async () => {
    if (!currentQuote) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/quotes/latest-quote-activity?quoteID=" +
          currentQuote.quoteID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data && res.data.length > 0) {
          let approver = res.data.find((m) => m.activity === "Approved By");
          let requester = res.data.find((m) => m.activity === "Requested By");
          setApprover(approver || null);
          setRequester(requester || null);
        } else {
          setApprover(null);
          setRequester(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentQuote]);

  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  return (
    rightContent === "Information" && (
      <div className="task-details-box">
        {sideMenu === "view" && (
          <>
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
                                  Quote Ref#
                                </td>
                                <td align="left" className="table-heading">
                                  Status
                                </td>
                              </tr>
                              <tr style={{ width: "100%!important" }}>
                                <td className="table-heading category-dark">
                                  {currentQuote.refText}
                                  {currentQuote.refNum}
                                </td>
                                <td align="left" className="table-heading">
                                  <span
                                    className="categoryTd"
                                    style={{
                                      background:
                                        EstimateColors[currentQuote.status],
                                    }}
                                  >
                                    {currentQuote.status}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr />
                      <tr>
                        <td colSpan={2} className="table-heading">
                          Related
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="table-heading category-dark">
                          QU-0012,PRJ-0023
                        </td>
                      </tr>
                      <tr />
                      <tr>
                        <td colSpan={2} className="table-heading category-dark">
                          Sales Person
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="table-heading">
                          {currentQuote.managers}
                        </td>
                      </tr>
                      <tr />
                      <tr />
                      <tr style={{ borderTop: "0.5px solid #C4C4C4" }} />
                      <tr />
                      {requester && (
                        <>
                          <tr>
                            <td
                              colSpan={2}
                              className="table-heading category-dark"
                            >
                              Requested By
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
                                    <td className="table-heading">
                                      {requester.name}
                                    </td>
                                    <td align="right" className="table-heading">
                                      {moment(
                                        requester.created
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
                          <tr />
                        </>
                      )}
                      <tr>
                        <td colSpan={2} className="table-heading category-dark">
                          Quoted By
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
                                <td className="table-heading">
                                  {currentQuote.createdBy}
                                </td>
                                <td align="right" className="table-heading">
                                  {moment(
                                    currentQuote.created
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
                      <tr />
                      {approver && (
                        <>
                          <tr>
                            <td
                              colSpan={2}
                              className="table-heading category-dark"
                            >
                              Approved By
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
                                    <td className="table-heading">
                                      {approver.name}
                                    </td>
                                    <td align="right" className="table-heading">
                                      {moment(
                                        approver.created
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
                          <tr />
                        </>
                      )}
                      <tr />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <Gap />
            {attachments && (
              <FileUploaderListViewer
                isView={true}
                setToken={setToken}
                data={attachments}
                handleUpload={handleUpload}
                handleDelete={handleDelete}
                module="quote"
                id={"quote" + currentQuote.quoteID}
              />
            )}
          </>
        )}
        {sideMenu === "discussions" && (
          <div className="task-details-container inventory-discussion">
            <OneBookDiscussion
              data={discussions}
              handleDelete={handleDiscusDelete}
              handleEdit={handleEdit}
              handleReply={handleReply}
              handleSubmit={handleSubmit}
              setDiscussionData={setDiscussionData}
            />
          </div>
        )}
        {sideMenu === "history" && history && history.length > 0 && (
          <History data={history} headerNotRequired={true} />
        )}
      </div>
    )
  );
};

export default QuoteInformation;
