import React, { useEffect, useRef, useState } from "react";
import G_plus from "../../.././assets/images/g_plus.png";
import Gr_Sr from "../../.././assets/images/gr_sr.png";
import Left_Arrow from "../../assets/left-arrow.png";
import Right_Arrow from "../../assets/right-arrow.png";
import AssignByMeImg from "../../assets/assignByMe.png";
import AssignByMeImgUnf from "../../assets/assignByMeUnfiltered.png";
import Filter from "../../assets/filter.png";
import UnFilter from "../../assets/unfilter.png";
import Filter_Clear from "../../assets/filter-clear.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import axios from "axios";
import "../../css/maincontainer.css";
import "../../css/scrollBar.scss";
import "bootstrap/dist/css/bootstrap.css";
import TaskCategory from "./TaskCategory";
import CreateTask from "../create/CreateTask";
import TaskDetails from "./TaskDetails";
import Departments from "./Departments";
import TitleSettings from "./TitleSettings";
import TaskPaginatedItems from "./taskpaginatedItems";
import DatePicker from "react-date-picker";
import Forward from "./Forward";
import Edit from "../update/Edit";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import toast from "react-hot-toast";
import Style from "../../css/task.module.css";

const Template1Tasks = ({ loading, setToken }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [assignByMe, setAssignByMe] = useState(false);
  const [taskID, setTaskID] = useState();
  const ref = useRef(null);
  const [filtered, setFiltered] = useState(false);
  const [actualData, setActualData] = useState([]);
  const [depData, setDepdata] = useState({
    departments: [],
    addVisible: false,
    newDep: "",
  });
  const [taskContainer, setTaskContainer] = useState({
    containers: [],
    addVisible: false,
    newContainer: "",
  });
  const [projects, setProjects] = useState([]);
  const [usersList, serUsersList] = useState([]);
  let [data, setData] = useState({
    tasks: [],
    rightContent: "Details",
    currentTask: {},
    category: "",
    isScrollButtonVisible: false,
  });
  let [filterView, openFilterview] = useState(false);
  let [listView, openListview] = useState(false);
  const handleDeleteAll = async () => {
    document.body.click();

    let deleteTask = data.tasks.filter(
      (t) => t.id != undefined && t.category === "Completed"
    );
    if (deleteTask.length > 0) {
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/tasks/delete-completed-tasks",
          { IDs: deleteTask.map((t) => t.id).join() },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }

          setData((prevState) => {
            return {
              tasks: data.tasks.filter(
                (t) => t.id === undefined || t.category !== "Completed"
              ),
              rightContent: "Create",
              currentTask: prevState.currentTask,
              category: prevState.category,
              isScrollButtonVisible: prevState.isScrollButtonVisible,
            };
          });

          toast.success("Tasks deleted Successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Tasks deletion failed");
        });
    }
  };

  const filterAssignByMe = () => {
    setAssignByMe(!assignByMe);
    if (!assignByMe) {
      setActualData(data.tasks);
      let updData = data.tasks.filter(
        (d) => d.id === undefined || d.assignee === currentUser.username
      );
      setData({ ...data, tasks: updData });
    } else {
      setData({ ...data, tasks: actualData });
      setActualData([]);
    }
  };
  useEffect(async () => {
    if (!currentUser) setToken(undefined);
    if (taskContainer.containers.length === 0 || data.tasks.length > 0) {
      setData((prevState) => {
        return {
          tasks: prevState.tasks,
          rightContent: prevState.rightContent,
          currentTask: prevState.currentTask,
          category: prevState.category,
          isScrollButtonVisible:
            ref.current &&
            ref.current.scrollWidth - ref.current.clientWidth > 3,
        };
      });
      return;
    }
    loading({ visibility: true, message: "Loading Tasks..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/tasks/tasks-list?userID=" +
          currentUser.id +
          "&role=" +
          currentUser.role +
          "&orgID=" +
          currentUser.orgID +
          "&username=" +
          currentUser.username,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        res.data = res.data.filter((d) => {
          d["history"] = [];
          d["conversations"] = [];
          d["attachments"] = [];
          if (d.endDate !== null)
            d.endDate = d.endDate.toString().split("T")[0];
          d.assignDate = d.assignDate.toString().split("T")[0];
          return d;
        });
        taskContainer.containers.forEach((category) =>
          res.data.push({ category: category.name })
        );
        setData({
          tasks: res.data,
          rightContent: "Details",
          currentTask: res.data[0],
          category: "To do",
          isScrollButtonVisible:
            ref.current.scrollWidth - ref.current.clientWidth > 3,
        });
        loading({ visibility: false, message: "Loading Tasks..." });
        setTaskID(1234567890); //fetch From Backend
      })
      .catch((err) => {
        console.log(err);
        loading(false);
      });
  }, [taskContainer, depData]);

  useEffect(() => {
    const handleResize = (e) => {
      if (listView || ref.current === null) {
        return;
      }
      setData((prevState) => {
        return {
          tasks: prevState.tasks,
          rightContent: prevState.rightContent,
          currentTask: prevState.currentTask,
          category: prevState.category,
          isScrollButtonVisible:
            ref.current.scrollWidth - ref.current.clientWidth > 3,
        };
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [listView]);

  const showrightContent = (value, title) => {
    document.body.click();
    setData((prevState) => {
      return {
        tasks: prevState.tasks,
        rightContent: value,
        currentTask: prevState.currentTask,
        category: title,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };
  const showTaskDetails = (task, e) => {
    var exist = ["dots", "p-leave", "delete"].some((c) =>
      e.target.className.toString().includes(c)
    );
    if (exist) return;
    setData((prevState) => {
      return {
        tasks: prevState.tasks,
        rightContent: "Details",
        currentTask: task,
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
  };

  const handleScroll = (scrollOffset) => {
    ref.current.scrollLeft += scrollOffset;
  };

  const onDrop = (e, category) => {
    let id = parseInt(e.dataTransfer.getData("id"));
    let task = data.tasks.filter((task) => task.id === id);
    if (category === task[0].category) return;
    let dt = new Date(
      new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
    );
    let updatedData = data.tasks.filter((task) => {
      if (task.id === id) {
        task.category = category;
        task.history.unshift({
          moduleID: "task" + id,
          action: "Moved to " + category,
          dateAndTime: dt.toLocaleString(),
          name: currentUser.username,
        });
      }
      return task;
    });
    setData((prevState) => {
      return {
        tasks: updatedData,
        rightContent: prevState.rightContent,
        currentTask: task[0],
        category: prevState.category,
        isScrollButtonVisible: prevState.isScrollButtonVisible,
      };
    });
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/tasks/updateTask",
        {
          id: id,
          category: category,
          assignDate:
            dt.getFullYear().toString() +
            "-" +
            (dt.getMonth() + 1).toString() +
            "-" +
            dt.getDate().toString(),
          assignTime:
            dt.getHours().toString() +
            ":" +
            dt.getMinutes().toString() +
            ":" +
            dt.getSeconds().toString(),
          assignee: currentUser.username,
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("category->updated");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const sortData = (key) => {
    let tasksP = data.tasks;
    const prior = { LOW: 0, MEDIUM: 1, HIGH: 2, "Custom Date": 4 };
    const categ = { "To do": 0, Progress: 1, Hold: 2, Completed: 3 };
    switch (key) {
      case "id":
        tasksP.sort((a, b) => (a.id > b.id ? -1 : b.id > a.id ? 1 : 0));
        break;
      case "id-dec":
        tasksP.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        break;
      case "title":
        tasksP.sort((a, b) => (a.id > b.id ? -1 : b.id > a.id ? 1 : 0));
        break;
      case "title-dec":
        tasksP.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        break;

      case "priority":
        tasksP.sort((a, b) => prior[b.priority] - prior[a.priority]);
        break;
      case "priority-dec":
        tasksP.sort((a, b) => prior[a.priority] - prior[b.priority]);
        break;
      case "category":
        tasksP.sort((a, b) => categ[b.category] - categ[a.category]);
        break;
      case "category-dec":
        tasksP.sort((a, b) => categ[a.category] - categ[b.category]);
        break;
      case "assignDate":
        tasksP.sort(
          (a, b) =>
            new Date(b.assignDate).valueOf() - new Date(a.assignDate).valueOf()
        );
        break;
      case "assignDate-dec":
        tasksP.sort(
          (a, b) =>
            new Date(a.assignDate).valueOf() - new Date(b.assignDate).valueOf()
        );
        break;

      default:
        break;
    }
    setData({ ...data, tasks: tasksP });
  };

  const handleEdit = (task) => {
    document.body.click();
    setData({ ...data, rightContent: "Edit", currentTask: task });
  };

  const handleSearchChange = (e) => {
    if (e.target.value === undefined || e.target.value === "") {
      setData({ ...data, tasks: actualData });
      return;
    }
    let tasksP = data.tasks.filter(
      (d) =>
        d.subject !== undefined &&
        d.subject.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setData({ ...data, tasks: tasksP });
  };
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete")
      setData({ ...data, tasks: actualData });
  };

  const filterData = () => {
    var department = document.getElementById("department").value;
    var status = document.getElementById("category").value;
    var user = document.getElementById("user").value;
    var assignFrom = assignByMe
      ? currentUser
      : document.getElementById("assignFrom").value;
    let updData = data.tasks
      .filter(
        (d) => d.id === undefined || department === "" || d.title === department
      )
      .filter(
        (d) => d.id === undefined || status === "" || d.category === status
      )
      .filter(
        (d) =>
          d.id === undefined ||
          user === "" ||
          (d.userNames !== undefined &&
            d.userNames !== null &&
            d.userNames.includes(user))
      )
      .filter(
        (d) =>
          d.id === undefined || assignFrom === "" || d.assignee === assignFrom
      )
      .filter(
        (d) =>
          d.id === undefined ||
          start === undefined ||
          new Date(d.assignDate).valueOf() >= new Date(start).valueOf()
      )
      .filter(
        (d) =>
          d.id === undefined ||
          end === undefined ||
          new Date(d.assignDate).valueOf() <= new Date(end).valueOf()
      );

    setData({ ...data, tasks: updData });
    setFiltered(true);
  };

  const clearFilter = () => {
    setStart();
    setEnd();
    setFiltered(false);
    document.getElementById("department").value = "";
    document.getElementById("category").value = "";
    document.getElementById("user").value = "";
    document.getElementById("assignFrom").value = "";
  };
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  useEffect(() => {
    if (filterView && (start !== undefined || end !== undefined)) {
      if (
        start !== undefined &&
        end != undefined &&
        new Date(start).valueOf() > new Date(end).valueOf()
      ) {
        setEnd();
        alert("End Date should be less or equal to Start Date");
        return;
      }
      filterData();
    }
  }, [start, end]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isSearchOpen, searchOpen] = useState(false);
  return (
    <>
      <div className="main-left-right-div-container myscrollbar">
        <div className="main-left-div">
          <div className="left-div-header">
            <span className="header-title-sub">OTHERS</span>
            <span className="header-title-main">Tasks</span>
            <img
              title="Add Task"
              className="g_plus"
              onClick={() => {
                showrightContent("Create", "To do");
              }}
              src={G_plus}
            />
            <img
              title="Assign By Me"
              className="assignByMe"
              src={assignByMe ? AssignByMeImg : AssignByMeImgUnf}
              onClick={() => filterAssignByMe()}
            />
            <OverlayTrigger
              placement="bottom-end"
              trigger="click"
              rootClose={true}
              overlay={
                <Popover>
                  <div className="popup">
                    <p
                      onClick={() => {
                        showrightContent("Create", "To do");
                        setTaskID();
                      }}
                    >
                      {" "}
                      Add Task
                    </p>
                    <p
                      onClick={() => {
                        document.body.click();
                        openListview(!listView);
                      }}
                    >
                      {listView ? "Table view" : "List View"}
                    </p>
                    <p
                      onClick={() =>
                        showrightContent("Title Settings", "To do")
                      }
                    >
                      {" "}
                      Title Setting
                    </p>
                    <p onClick={() => document.body.click()}> Export</p>
                    <p onClick={() => document.body.click()}> Import</p>
                    <p className={Style.delete} onClick={handleDeleteAll}>
                      {" "}
                      Delete All
                    </p>
                  </div>
                </Popover>
              }
            >
              <button variant="success" className="left-options-button">
                Options
              </button>
            </OverlayTrigger>
            {!isSearchOpen && (
              <img
                title="Search Task"
                className="left-gs-img search-button"
                src={Gr_Sr}
                onClick={() => {
                  searchOpen(true);
                  setActualData(data.tasks);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder="Enter Task Subject"
                  className="search-button-text"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                />
                <span
                  title="close Search"
                  className="calendar-closee template"
                  onClick={() => {
                    searchOpen(false);
                    setData({ ...data, tasks: actualData });
                  }}
                >
                  &#10006;
                </span>{" "}
              </>
            )}
            {!filtered && (
              <img
                title="Filter"
                className="left-gs-img filter-button"
                src={UnFilter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data.tasks);
                }}
              />
            )}
            {filtered && (
              <img
                title="Filter"
                className="left-gs-img filter-button"
                src={Filter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data.tasks);
                }}
              />
            )}
          </div>
          {filterView && (
            <div className="left-filter-view">
              <div className="filter-view-container">
                <div className="filter-view-inner-container">
                  <div className="create-task-container filter-fieldset">
                    <table
                      className="filter-table"
                      cellPadding="0"
                      cellSpacing="0"
                      width="100%"
                      border="0"
                    >
                      <tbody>
                        <tr>
                          <td className="filter-td">
                            <fieldset>
                              <legend>Department</legend>
                              <select
                                className="title"
                                id="department"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select Department
                                </option>
                                {[
                                  ...new Set(
                                    data.tasks
                                      .filter((task) => task.id != undefined)
                                      .map((task) => task.title)
                                  ),
                                ]
                                  .filter((field) => field != undefined)
                                  .map((field, index) => (
                                    <option key={index} value={field}>
                                      {field}
                                    </option>
                                  ))}
                              </select>
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>Status</legend>
                              <select
                                className="title"
                                id="category"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select Status
                                </option>
                                {[
                                  ...new Set(
                                    data.tasks
                                      .filter((task) => task.id != undefined)
                                      .map((task) => task.category)
                                  ),
                                ]
                                  .filter((field) => field != undefined)
                                  .map((field, index) => (
                                    <option key={index} value={field}>
                                      {field}
                                    </option>
                                  ))}
                              </select>
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>Assign To</legend>
                              <select
                                className="title"
                                id="user"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select name
                                </option>
                                {[
                                  ...new Set(
                                    data.tasks
                                      .filter((task) => task.id != undefined)
                                      .map((task) => task.userNames)
                                      .join(",")
                                      .split(",")
                                  ),
                                ].map(
                                  (field, index) =>
                                    field != undefined &&
                                    field.length > 0 && (
                                      <option key={index} value={field}>
                                        {field}
                                      </option>
                                    )
                                )}
                              </select>
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>Assign By</legend>
                              <select
                                className="title"
                                id="assignFrom"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select name
                                </option>
                                {[
                                  ...new Set(
                                    data.tasks
                                      .filter((task) => task.id != undefined)
                                      .map((task) => task.assignee)
                                  ),
                                ]
                                  .filter((field) => field != undefined)
                                  .map((field, index) => (
                                    <option key={index} value={field}>
                                      {field}
                                    </option>
                                  ))}
                              </select>
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>From Date</legend>
                              <DatePicker
                                dayPlaceholder="DD"
                                monthPlaceholder="MM"
                                yearPlaceholder="YYYY"
                                onChange={setStart}
                                value={start}
                                required={true}
                                calendarIcon={null}
                                clearIcon={null}
                              />
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>To Date</legend>
                              <DatePicker
                                dayPlaceholder="DD"
                                monthPlaceholder="MM"
                                yearPlaceholder="YYYY"
                                onChange={setEnd}
                                value={end}
                                required={true}
                                calendarIcon={null}
                                clearIcon={null}
                              />
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <table width="100%">
                              <tbody>
                                <tr width="100%">
                                  <td style={{ width: "65%" }}>
                                    <div className="filter-text-container">
                                      <button
                                        className="save-button filter-text"
                                        onClick={() => {
                                          setData({
                                            ...data,
                                            tasks: actualData,
                                          });
                                          clearFilter();
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </td>
                                  <td style={{ width: "35%" }}>
                                    <img
                                      title="Close Filter"
                                      className="filter-clear-button"
                                      src={Filter_Clear}
                                      onClick={() => {
                                        clearFilter();
                                        openFilterview(false);
                                        setData({ ...data, tasks: actualData });
                                      }}
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className={
              filterView ? "left-div-content filter-left" : "left-div-content"
            }
          >
            {!listView && (
              <>
                <div className="left-right-arrow-container">
                  <img
                    className="left-right-arrow"
                    style={{
                      display: data.isScrollButtonVisible ? "block" : "none",
                    }}
                    src={Left_Arrow}
                    onClick={() => handleScroll(-200)}
                  />
                </div>
                <div className="taskCategoryContainer" ref={ref}>
                  {taskContainer.containers.map((container, index) => (
                    <>
                      <TaskCategory
                        key={index}
                        handleEdit={handleEdit}
                        setData={setData}
                        onDrop={onDrop}
                        handleTaskClick={showTaskDetails}
                        showrightContent={showrightContent}
                        headerTitle={container.name}
                        currentTaskID={data.currentTask}
                        tasks={data.tasks.filter(
                          (task) => task.category === container.name
                        )}
                      />{" "}
                      <div key={index} className="empty-category"></div>{" "}
                    </>
                  ))}
                </div>
                <div className="left-right-arrow-container">
                  <img
                    className="left-right-arrow"
                    style={{
                      display: data.isScrollButtonVisible ? "block" : "none",
                    }}
                    src={Right_Arrow}
                    onClick={() => handleScroll(200)}
                  />
                </div>
              </>
            )}
            {listView && (
              <div className="left-list-view-box">
                <div
                  className="left-list-view-container"
                  style={{ borderTop: filterView ? "0.5px solid #239BCF" : "" }}
                >
                  <TaskPaginatedItems
                    setToken={setToken}
                    itemsPerPage={itemsPerPage}
                    items={
                      data.tasks.length > 0
                        ? data.tasks.filter((task) => task.id != undefined)
                        : []
                    }
                    currentTask={data.currentTask}
                    setData={showTaskDetails}
                    updateData={setData}
                    setItemsPerPage={setItemsPerPage}
                    sortData={sortData}
                    handleEdit={handleEdit}
                  ></TaskPaginatedItems>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="main-right-div">
          <div className="right-div-header">
            <span className="right-header-title">
              {data.rightContent === "Departments"
                ? "Create"
                : data.rightContent}
            </span>
            {(data.rightContent === "Create" ||
              data.rightContent === "Departments") && (
              <>
                <span
                  className={
                    data.rightContent === "Create"
                      ? "right-sub-header-1 clicked"
                      : "right-sub-header-1"
                  }
                  onClick={() => {
                    showrightContent("Create", "To do");
                  }}
                >
                  Tasks
                </span>
                <span
                  className={
                    data.rightContent === "Departments"
                      ? "right-sub-header-2 clicked"
                      : "right-sub-header-2"
                  }
                  onClick={() => {
                    showrightContent("Departments", "To do");
                  }}
                >
                  Departments
                </span>
              </>
            )}
          </div>
          <div className="right-div-content" style={{ position: "relative" }}>
            <CreateTask
              taskID={taskID}
              setTaskID={setTaskID}
              setToken={setToken}
              rightContent={data.rightContent}
              updateData={setData}
              currentUser={currentUser}
              category={data.category}
              departments={depData}
              projects={projects}
              setProjects={setProjects}
              usersList={usersList}
              serUsersList={serUsersList}
            />
            <TaskDetails
              setToken={setToken}
              rightContent={data.rightContent}
              taskData={data.currentTask}
              updateData={setData}
              currentUser={currentUser}
            />
            <Departments
              setToken={setToken}
              rightContent={data.rightContent}
              depData={depData}
              setDepdata={setDepdata}
            ></Departments>
            <TitleSettings
              setToken={setToken}
              loading={loading}
              rightContent={data.rightContent}
              taskContainer={taskContainer}
              settaskContainer={setTaskContainer}
            ></TitleSettings>
            <Forward
              setToken={setToken}
              rightContent={data.rightContent}
              currentTask={data.currentTask}
              usersList={usersList}
              setData={setData}
            ></Forward>
            <Edit
              setToken={setToken}
              rightContent={data.rightContent}
              task={data.currentTask}
              setData={setData}
              projects={projects}
              usersList={usersList}
              departments={depData}
              currentUser={currentUser}
            ></Edit>
          </div>
        </div>
      </div>
    </>
  );
};

export default Template1Tasks;
