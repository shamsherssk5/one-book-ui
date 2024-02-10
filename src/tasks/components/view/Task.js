import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Style from "../../css/task.module.css";
import Colors from "../helpers/Colors";
import Dots from "../../assets/dots.png";
import Subject from "../../assets/subject.png";
import Attach from "../../assets/attach.png";
import Message from "../../assets/message.png";
import Flag from "../../assets/flag.png";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import moment from "moment-timezone";

const Task = (props) => {
  let { task, setData, handleEdit, setToken } = props;
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let background = Colors[task.title];
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
  };
  let messageCount =
    task.conversations && task.conversations.length > 0
      ? task.conversations.length
      : task.messages;
  let attachmentsCount =
    task.attachments && task.attachments.length > 0
      ? [...new Set(task.attachments)].length
      : task.attachmentsCount;
  let updTasks = task;
  const handleTaskDelete = async () => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/tasks/deleteTask",
        { id: task.id },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prevState) => {
          let updatedTask = prevState.tasks.filter((t) => t.id !== task.id);
          return {
            tasks: updatedTask,
            rightContent: "Create",
            currentTask: {},
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
        toast.success("Task deleted successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleForward = () => {
    document.body.click();
    setData((prevState) => {
      return {
        tasks: prevState.tasks,
        rightContent: "Forward",
        currentTask: task,
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };

  return (
    <>
      <div
        onDragStart={(e) => onDragStart(e, task.id)}
        draggable
        onClick={(e) => props.taskClick(updTasks, e)}
        className={`${Style.Task} ${task.id ? undefined : Style.hideIt}`}
        style={{
          background:
            task.id === props.currentTaskID.id
              ? "rgba(215, 49, 38, 0.12)"
              : "#E5F1FA",
        }}
      >
        <div className={Style.priorityColourContainer}>
          <div
            className={Style.priorityBox}
            style={{
              background:
                task.priority !== "Custom Date"
                  ? Colors[task.priority]
                  : "transparent",
            }}
          ></div>
        </div>
        <div className={Style.taskDetContainer}>
          <div className={Style.taskDetBox}>
            <div style={{ display: "flex", width: "100%", height: "auto" }}>
              <div
                style={{ width: "70%", height: "100%", position: "relative" }}
              >
                <span
                  className={Style.title}
                  style={{ background: background }}
                >
                  {task.title}
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
                        <p className="p-leave" onClick={() => handleEdit(task)}>
                          Edit
                        </p>
                        <p className={Style.delete} onClick={handleTaskDelete}>
                          Delete
                        </p>
                        <p className="p-leave" onClick={handleForward}>
                          Forward
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
                    alt="Dots"
                  />
                </OverlayTrigger>
              </div>
            </div>
            <div className={Style.subject}>
              <div className={Style.subjectImage}>
                <img src={Subject} alt="Subject" />
              </div>
              <div className={Style.subjecttext}>{task.subject}</div>
            </div>
            <div className={Style.note} title={task.notes}>
              {task.notes}
            </div>
            <div style={{ display: "flex", width: "100%" }}>
              <div style={{ width: "30%", textAlign: "left" }}>
                <span>
                  {task.userNames
                    ? task.userNames
                        .split(",")
                        .filter((d, i) => i < 2)
                        .map((d) => (
                          <Avatar
                            size="1.25vw"
                            title={d}
                            round="50%"
                            textSizeRatio={3}
                            textMarginRatio={0.15}
                            name={d}
                          />
                        ))
                    : ""}
                  {task.userNames
                    ? task.userNames.split(",").length > 2 && (
                        <Avatar
                          size="1.25vw"
                          title={`+ ${task.userNames.split(",").length - 2}`}
                          round="50%"
                          textSizeRatio={1}
                          textMarginRatio={0.15}
                          name={`+ ${task.userNames.split(",").length - 2}`}
                        />
                      )
                    : ""}
                </span>
              </div>
              <div style={{ width: "40%", textAlign: "left" }}>
                {task.priority === "Custom Date" && task.endDate !== null ? (
                  <span className={Style.textCount}>
                    <img
                      title="End Date"
                      className={Style.endDateLogo}
                      src={Flag}
                      alt="flag"
                    />
                    {moment(task.endDate).format(currentUser.dateFormat)}
                  </span>
                ) : (
                  ""
                )}
              </div>
              <div style={{ width: "30%", textAlign: "right" }}>
                {messageCount > 0 ? (
                  <span className={Style.textCount}>
                    <img
                      title="Messages"
                      className={Style.messageCountLogo}
                      src={Message}
                      alt="Messages"
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
                      alt="Attachments"
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

export default Task;
