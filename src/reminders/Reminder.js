import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Style from "../tasks/css/task.module.css";
import Colors from "./Colors";
import Dots from "../tasks/assets/dots.png";
import Attach from "../tasks/assets/attach.png";
import Message from "../tasks/assets/message.png";
import DateTime from "./assets/datetime.png";
import Repeat from "./assets/repeat.png";
import Renewal from "./assets/Renewal.png";
import Birthday from "./assets/BirthDay.png";
import Calls from "./assets/Calls.png";
import Custom from "./assets/Custom.png";
import Meeting from "./assets/Meeting.png";
import Payments from "./assets/Payments.png";
import Other from "./assets/Other.png";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import moment from "moment-timezone";

const Reminder = ({
  reminder,
  setData,
  setToken,
  setCurrentReminder,
  currentReminder,
  setRightContent,
  handleDeleteReminder,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
  };
  let messageCount =
    reminder.conversations && reminder.conversations.length > 0
      ? reminder.conversations.length
      : reminder.messages;
  let attachmentsCount =
    reminder.attachments && reminder.attachments.length > 0
      ? [...new Set(reminder.attachments)].length
      : reminder.attachmentsCount;

  const getTypeImage = () => {
    switch (reminder.type) {
      case "Renewals":
        return Renewal;
      case "Payments":
        return Payments;
      case "Calls":
        return Calls;
      case "Birthdays":
        return Birthday;
      case "Others":
        return Other;
      case "Meeting":
        return Meeting;
      default:
        return Custom;
    }
  };
  const handleReminderClick = (e) => {
    setCurrentReminder(reminder);
    let className = e.target.className;
    if (className === "p-leave" || className.includes("delete")) return;
    setRightContent("Details");
  };

  return (
    <>
      <div
        onDragStart={(e) => onDragStart(e, reminder.id)}
        draggable
        onClick={handleReminderClick}
        className={`${Style.Task} ${reminder.id ? undefined : Style.hideIt}`}
        style={{
          background:
            reminder.id === currentReminder.id
              ? "rgba(215, 49, 38, 0.12)"
              : "#E5F1FA",
        }}
      >
        <div
          className="reminderTypeFiller"
          style={{ background: Colors[reminder.category] }}
        >
          <img className="remtypeimg" src={getTypeImage()} alt="" />
          <div className="days-warning">
            <p>
              {reminder.category !== "Expired" ? "Days" : reminder.category}
            </p>
            <p className="numdays">{reminder.days}</p>
            <p>{reminder.category === "Expired" ? "Days" : "Left"}</p>
          </div>
        </div>
        <div className="remBoxDataCon">
          <div className="remDetBox">
            <div style={{ display: "flex", width: "100%", height: "auto" }}>
              <div
                style={{ width: "70%", height: "100%", position: "relative" }}
              >
                <span
                  className={Style.title}
                  style={{ background: Colors[reminder.type] }}
                >
                  {reminder.type}
                </span>
              </div>
              <div
                style={{ width: "30%", position: "relative", height: "23px" }}
              >
                <OverlayTrigger
                  placement="bottom-end"
                  trigger="click"
                  rootClose
                  overlay={
                    <Popover>
                      <div className={Style.popup}>
                        <p className="p-leave">Mark as Updated</p>
                        <p className="p-leave">On Process</p>
                        <p
                          className="p-leave"
                          onClick={() => {
                            document.body.click();
                            setRightContent("Edit");
                          }}
                        >
                          Edit
                        </p>
                        <p
                          className={Style.delete}
                          onClick={() => {
                            handleDeleteReminder(reminder.id);
                          }}
                        >
                          Delete
                        </p>
                      </div>
                    </Popover>
                  }
                >
                  <img
                    title="Modify"
                    variant="success"
                    className={Style.dots}
                    src={Dots}
                    alt=""
                  />
                </OverlayTrigger>
              </div>
            </div>
            <div className={Style.subject} style={{ height: "37px" }}>
              <div className={Style.subjecttext}>{reminder.title}</div>
            </div>
            <div className={`${Style.subject} reminText`}>
              <div className={`${Style.subjectImage} reminImage`}>
                <img src={DateTime} alt="DateTime" />
              </div>
              <div className="reminNote">
                {moment(reminder.remDate).format(currentUser.dateFormat)}
                {reminder.noTime !== 1 &&
                  `- ${moment(reminder.remTime, "HH:mm:ss").format(
                    currentUser.timeFormat === "12 Hrs" ? "hh:mm A" : "HH:mm"
                  )}`}
              </div>
            </div>
            <div style={{ height: "2px" }}></div>
            <div className={`${Style.subject} reminText`}>
              <div className={`${Style.subjectImage} reminImage`}>
                <img src={Repeat} alt="DateTime" />
              </div>
              <div className="reminNote">{reminder.inter_val}</div>
            </div>
            <div style={{ height: "11px" }}></div>
            <div style={{ display: "flex", width: "100%" }}>
              <div style={{ width: "60%", textAlign: "left" }}>
                <span>
                  {reminder.userNames
                    ? reminder.userNames
                        .split(",")
                        .filter((d, i) => i < 3)
                        .map((d) => (
                          <Avatar
                            size="1.3vw"
                            title={d}
                            round="50%"
                            textSizeRatio={3}
                            textMarginRatio={0.15}
                            name={d}
                          />
                        ))
                    : ""}
                  {reminder.userNames
                    ? reminder.userNames.split(",").length > 3 && (
                        <Avatar
                          size="1.3vw"
                          title={`+ ${
                            reminder.userNames.split(",").length - 3
                          }`}
                          round="50%"
                          textSizeRatio={1}
                          textMarginRatio={0.15}
                          name={`+ ${reminder.userNames.split(",").length - 3}`}
                        />
                      )
                    : ""}
                </span>
              </div>

              <div style={{ width: "40%", textAlign: "right" }}>
                {messageCount > 0 ? (
                  <span className={Style.textCount}>
                    <img
                      title="Messages"
                      className={Style.messageCountLogo}
                      src={Message}
                      alt=""
                    />
                    {messageCount}
                  </span>
                ) : (
                  ""
                )}
                {attachmentsCount > 0 ? (
                  <span className={Style.textCount}>
                    <img
                      title="attachments"
                      className={Style.attachments}
                      src={Attach}
                      alt=""
                    />
                    {attachmentsCount}
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={Style.emptyTaskBox}></div>
    </>
  );
};

export default Reminder;
