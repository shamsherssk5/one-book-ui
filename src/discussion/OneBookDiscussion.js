import React, { useEffect } from "react";
import { CommentSection } from "react-comments-section";
import "react-comments-section/dist/index.css";

const OneBookDiscussion = ({
  data,
  handleDelete,
  handleEdit,
  handleReply,
  handleSubmit,
  setDiscussionData,
}) => {
  const customNoComment = () => (
    <div className="no-com">No Discussions Yet!</div>
  );
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  useEffect(() => {
    var elements = document.getElementsByClassName("postComment");
    [...elements].forEach((element) => {
      element.placeholder = "Post Your Comment...";
    });
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <CommentSection
        currentUser={{
          currentUserId: currentUser.id,
          currentUserImg:
            "https://ui-avatars.com/api/name=" +
            currentUser.username +
            "?background=2687D7&color=fff",
          currentUserFullName: currentUser.username,
        }}
        hrStyle={{ border: "0.5px solid #ff0072", display: "none" }}
        titleStyle={{ color: "#f2f2f2", display: "none" }}
        commentData={data}
        onSubmitAction={handleSubmit}
        onDeleteAction={handleDelete}
        onReplyAction={handleReply}
        onEditAction={handleEdit}
        currentData={setDiscussionData}
        customNoComment={() => customNoComment()}
        imgStyle={{ borderRadius: "50%", width: "1.5vw", height: "1.5vw" }}
        // customImg='https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60'
        inputStyle={{ borderBottom: "1px solid #C4C4C4", marginLeft: "0.1vw" }}
        formStyle={{
          backgroundColor: "rgba(229, 241, 250,.9)",
          padding: "3.2vh 0.3vw",
        }}
        submitBtnStyle={{
          border: "0.1px solid #2687D7",
          backgroundColor: "#2687D7",
          padding: "0.4vh 0.4vw",
          fontSize: "0.8vw",
          marginLeft: "0.15vw",
          color: "#fff",
        }}
        cancelBtnStyle={{
          border: "0.1px solid rgb(124, 124, 124)",
          backgroundColor: "rgb(124, 124, 124)",
          padding: "0.4vh 0.4vw",
          fontSize: "0.8vw",
          marginLeft: "0.15vw",
          color: "#fff",
        }}
        removeEmoji={false}
        replyInputStyle={{ borderBottom: "1px solid black", color: "black" }}
      />
    </div>
  );
};

export default OneBookDiscussion;
