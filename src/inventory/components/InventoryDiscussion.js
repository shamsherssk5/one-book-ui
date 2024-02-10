import React, { useEffect, useState } from "react";
import CustomComponent from "../../discussion/OneBookDiscussion";
import axios from "axios";
import OneBookDiscussion from "../../discussion/OneBookDiscussion";

const InventoryDiscussion = ({
  rightContent,
  currentInventory,
  setData,
  setToken,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  useEffect(async () => {
    if (!currentInventory) return;
    if (rightContent !== "Product Summary" && rightContent !== "Discussions")
      return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/discussion?ID=inv" +
          currentInventory.invID,
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

          setData((prev) => {
            let updatedData = prev.filter((cust) => {
              if (cust.invID === currentInventory.invID) {
                cust.dcount = actual.length;
                cust["discussions"] = withReplies;
              }
              return cust;
            });
            return updatedData;
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentInventory, rightContent]);

  const handleSubmit = (data) => {
    let payload = {
      ...data,
      moduleID: "inv" + currentInventory.invID,
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

  const handleDelete = (data) => {
    let payload = { ...data, moduleID: "inv" + currentInventory.invID };
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
    let payload = { ...data, moduleID: "inv" + currentInventory.invID };
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
      moduleID: "inv" + currentInventory.invID,
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

  const setDiscussionData = (data) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.invID === currentInventory.invID) {
          cust.dcount = data.length;
        }
        return cust;
      });
      return updatedData;
    });
  };

  return (
    <div className="task-details-container inventory-discussion">
      <OneBookDiscussion
        data={currentInventory.discussions}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleReply={handleReply}
        handleSubmit={handleSubmit}
        setDiscussionData={setDiscussionData}
      />
    </div>
  );
};

export default InventoryDiscussion;
