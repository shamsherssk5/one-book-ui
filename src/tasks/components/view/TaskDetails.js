import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "../../css/taskdetails.css";
import Colors from "../helpers/Colors";
import { MessageBox } from "../../../common/MessageBox";
import toast from "react-hot-toast";
import FileUploaderListViewer from "../../../common/FileUploaderListViewer";
import History from "../../../common/History";
import NothingToShowHere from "../../../common/NothingToShowHere";
import moment from "moment-timezone";
const TaskDetails = (props) => {
  let { taskData, currentUser, updateData, setToken } = props;
  const ref = useRef(null);
  const handleUpload = (file) => {
    updateData((prevState) => {
      let updatedData = prevState.tasks.filter((task) => {
        if (task.id === prevState.currentTask.id) {
          task.attachments.push(file);
        }
        return task;
      });
      return {
        tasks: updatedData,
        rightContent: prevState.rightContent,
        currentTask: prevState.currentTask,
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };

  const handleDelete = (id) => {
    updateData((prevState) => {
      let updatedData = prevState.tasks.filter((task) => {
        if (task.id === prevState.currentTask.id) {
          let updatedAttach = task.attachments.filter((a) => a.fileID != id);
          task.attachments = updatedAttach;
          task.attachmentsCount -= 1;
        }
        return task;
      });
      return {
        tasks: updatedData,
        rightContent: prevState.rightContent,
        currentTask: prevState.currentTask,
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };

  useEffect(async () => {
    if (taskData.id === undefined) return;
    if (taskData.attachments && taskData.attachments.length > 0) return;
    if (taskData.attachmentsCount === 0) {
      updateData((prevState) => {
        let updatedData = prevState.tasks.filter((task) => {
          if (task.id == taskData.id) {
            task["attachments"] = [];
          }
          return task;
        });
        return {
          tasks: updatedData,
          rightContent: prevState.rightContent,
          currentTask: prevState.currentTask,
          category: prevState.category,
          isScrollButtonVisible: prevState.isScrollButtonVisible,
        };
      });
      return;
    }

    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=task" +
          taskData.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        updateData((prevState) => {
          let updatedData = prevState.tasks.filter((task) => {
            if (task.id == taskData.id) {
              task["attachments"] = res.data;
            }
            return task;
          });
          return {
            tasks: updatedData,
            rightContent: prevState.rightContent,
            currentTask: prevState.currentTask,
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [taskData]);

  useEffect(async () => {
    if (ref.current !== null) ref.current.scrollTop = 0;
    if (taskData.id === undefined) return;
    if (taskData.messages === 0) {
      updateData((prevState) => {
        let updatedData = prevState.tasks.filter((task) => {
          if (task.id == taskData.id) {
            task["conversations"] = [];
          }
          return task;
        });
        return {
          tasks: updatedData,
          rightContent: prevState.rightContent,
          currentTask: prevState.currentTask,
          category: prevState.category,
          isScrollButtonVisible: prevState.isScrollButtonVisible,
        };
      });
      return;
    }
    if (taskData.conversations && taskData.conversations.length > 0) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/conversations?ID=task" +
          taskData.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        updateData((prevState) => {
          let updatedData = prevState.tasks.filter((task) => {
            if (task.id == taskData.id) {
              task["conversations"] = res.data;
            }
            return task;
          });
          return {
            tasks: updatedData,
            rightContent: prevState.rightContent,
            currentTask: prevState.currentTask,
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [taskData]);

  const handleOnSendMessage = (messageData) => {
    updateData((prevState) => {
      let updatedData = prevState.tasks.filter((task) => {
        if (task.id == taskData.id) {
          task.conversations.push(messageData);
        }
        return task;
      });
      return {
        tasks: updatedData,
        rightContent: "Details",
        currentTask: prevState.currentTask,
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };

  useEffect(async () => {
    if (taskData.history && taskData.history.length > 0) return;
    if (taskData.id === undefined) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=task" +
          taskData.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        updateData((prevState) => {
          let updatedData = prevState.tasks.filter((task) => {
            if (task.id == taskData.id) {
              task["history"] = res.data;
            }
            return task;
          });
          return {
            tasks: updatedData,
            rightContent: prevState.rightContent,
            currentTask: prevState.currentTask,
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [taskData]);

  const handleView = (attachment) => {
    window.open(
      process.env.REACT_APP_API_ENDPOINT +
        "/getFile?name=" +
        attachment.fileName,
      attachment.fileName,
      "toolbar=no, menubar=no,scrollbars=no,resizable=no,location=no,directories=no,status=no,left=30,top=30,width=" +
        (window.innerWidth - 60) +
        ",height=" +
        (window.innerHeight - 60)
    );
  };
  return (
    props.rightContent === "Details" &&
    (taskData.id ? (
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
                  <tr className="table-heading">
                    <td className="left-td">Task Ref#</td>
                    <td className="right-td">Status</td>
                  </tr>
                  <tr>
                    <td className="table-heading category-dark">
                      {taskData.refText ? taskData.refText : "TASK-"}
                      {taskData.referenceNum
                        ? taskData.referenceNum
                        : taskData.id}
                    </td>
                    <td>
                      <span
                        className="categoryTd"
                        style={{ background: Colors[taskData.category] }}
                      >
                        {taskData.category}
                      </span>
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
                      {taskData.title}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Subject
                    </td>
                  </tr>
                  <tr>
                    <td className="blue-heading" colSpan="2">
                      {taskData.subject}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Related Project
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {taskData.project}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Assigned To
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {taskData.userNames}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      Assigned By
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
                              {taskData.assignee}
                            </td>
                            <td align="right" className="table-heading">
                              {moment(
                                taskData.assignDate + " " + taskData.assignTime
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
                        color: Colors[taskData.priority],
                        fontWeight: "700",
                      }}
                      className="table-heading category-dark"
                      colSpan="2"
                    >
                      {taskData.priority === "Custom Date"
                        ? ""
                        : taskData.priority}
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
                      {taskData.notes}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="empty-details-container"></div>

        <MessageBox
          setToken={setToken}
          data={taskData.conversations}
          currentUser={currentUser}
          handleOnSendMessage={handleOnSendMessage}
          moduleID={"task" + taskData.id}
          heading="Conversations"
        ></MessageBox>
        <div className="empty-details-container"></div>
        {taskData.id && (
          <FileUploaderListViewer
            isView={true}
            setToken={setToken}
            data={taskData.attachments}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            module="task"
            id={"task" + taskData.id}
          />
        )}
        <div className="empty-details-container"></div>
        <History data={taskData.history}></History>
      </div>
    ) : (
      <NothingToShowHere />
    ))
  );
};

export default TaskDetails;
