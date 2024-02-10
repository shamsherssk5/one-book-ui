import React, { useEffect, useRef, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import G_plus from ".././assets/images/g_plus.png";
import search from "../assets/images/gr_sr.png";
import Filter_Clear from "../tasks/assets/filter-clear.png";
import Filter from "../tasks/assets/filter.png";
import UnFilter from "../tasks/assets/unfilter.png";
import DatePicker from "react-date-picker";
import Left_Arrow from "../tasks/assets/left-arrow.png";
import Right_Arrow from "../tasks/assets/right-arrow.png";
import "./styles/reminders.css";
import ReminderCategory from "./ReminderCategory";
import CreateReminder from "./CreateReminder";
import ReminderTypes from "./ReminderTypes";
import axios from "axios";
import { index } from "d3";
import moment from "moment-timezone";
import RemDetails from "./RemDetails";
import ReminderPaginatedItems from "./ReminderPaginatedItems";
import { getConfirmation } from "../common/DialogBox";
import toast from "react-hot-toast";
import EditReminder from "./EditReminder";

const ReminderHome = ({ loading, setToken }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [rightContent, setRightContent] = useState("Details");
  const [listView, openListview] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [typeData, setTypedata] = useState({
    departments: [],
    addVisible: false,
    newDep: "",
  });
  const [data, setData] = useState([]);
  const [currentReminder, setCurrentReminder] = useState();
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [filtered, setFiltered] = useState(false);
  const [actualData, setActualData] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  let [filterView, openFilterview] = useState(false);
  const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);
  const [triggerEvent, setTriggerEvent] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const ref = useRef(null);
  const reminderContainer = [
    "Expired",
    "Expiry in 1-7 Days",
    "Expiry in 8-30 Days",
    "Scheduled",
  ];

  const handleExpiredDelete = () => {
    let IDs = data
      .filter((c) => c.category === "Expired")
      .map((c) => c.id)
      .join(",");
    handleDeleteReminder(IDs);
  };

  const handleDeleteReminder = async (IDs) => {
    document.body.click();
    await getConfirmation("You want to delete Reminder(s)?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/rem/delete-rem",
          { IDs: IDs },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setData((prev) => {
            let updatedData = prev.filter(
              (cust) => !IDs.toString().split(",").includes(cust.id.toString())
            );
            return updatedData;
          });
          toast.success("Reminder(s) deleted Successfully");
          setRightContent("Create");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Reminder(s) deletion failed");
        });
    });
  };

  useEffect(async () => {
    if (data.length > 0) {
      return;
    }
    loading({ visibility: true, message: "Loading Reminedrs..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/get-reminders?userID=" +
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
          d["contacts"] = [];
          return d;
        });
        if (res.data.length > 0) {
          setCurrentReminder(res.data[0]);
          setRightContent("Details");
        }
        setData(res.data);
        loading({ visibility: false });
        setScrollButtonVisible(
          ref.current.scrollWidth - ref.current.clientWidth > 3
        );
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [typeData]);

  useEffect(() => {
    const handleResize = (e) => {
      if (listView || ref.current === null) {
        return;
      }
      setScrollButtonVisible(
        ref.current.scrollWidth - ref.current.clientWidth > 3
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [listView]);

  const handleSearchChange = (e) => {
    setData((prev) => {
      let updatedDate = prev.filter((m) =>
        m.title.toLowerCase().includes(e.target.value.toLowerCase())
      );
      return updatedDate;
    });
  };
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") setData(actualData);
  };

  const filterData = () => {
    var type = document.getElementById("type").value;
    var category = document.getElementById("category").value;
    var user = document.getElementById("user").value;
    var assignee = document.getElementById("assignFrom").value;
    let updData = data
      .filter((d) => type === "" || d.type === type)
      .filter((d) => category === "" || d.category === category)
      .filter((d) => assignee === "" || d.assignee === assignee)
      .filter(
        (d) =>
          user === "" ||
          (d.userNames !== undefined &&
            d.userNames !== null &&
            d.userNames.includes(user))
      )
      .filter(
        (d) =>
          start === undefined ||
          new Date(d.remDate).valueOf() >= new Date(start).valueOf()
      )
      .filter(
        (d) =>
          end === undefined ||
          new Date(d.remDate).valueOf() <= new Date(end).valueOf()
      );

    setData(updData);
    setFiltered(true);
  };

  useEffect(() => {
    if (filterView && (start !== undefined || end != undefined)) {
      if (
        start !== undefined &&
        end != undefined &&
        new Date(start).valueOf() > new Date(end).valueOf()
      ) {
        setEnd();
        toast.error("End Date should be less or equal to Start Date");
        return;
      }
      filterData();
    }
  }, [start, end]);

  const clearFilter = () => {
    setStart();
    setEnd();
    setFiltered(false);
    document.getElementById("type").value = "";
    document.getElementById("category").value = "";
    document.getElementById("user").value = "";
    document.getElementById("assignFrom").value = "";
  };

  const handleScroll = (scrollOffset) => {
    ref.current.scrollLeft += scrollOffset;
  };

  const onDrop = (e, category) => {
    let id = parseInt(e.dataTransfer.getData("id"));
    let rem = data.filter((rem) => rem.id === id);
    let date;
    if (category === rem[0].category) return;
    setData((prev) => {
      let updateData = prev.filter((rem) => {
        if (rem.id === id) {
          console.log("called");
          let ind = reminderContainer.findIndex((c) => c === category);
          let mmnt = moment(
            new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            )
          );
          if (ind === 0) {
            mmnt = mmnt.subtract(1, "days");
          } else if (ind == 1) {
            mmnt = mmnt.add(7, "days");
          } else if (ind == 2) {
            mmnt = mmnt.add(30, "days");
          } else if (ind == 3) {
            mmnt = mmnt.add(365, "days");
          }
          date = mmnt.toDate();
          rem.remDate =
            date.getFullYear().toString() +
            "-" +
            (date.getMonth() + 1).toString() +
            "-" +
            date.getDate().toString();
          rem.history.unshift({
            moduleID: "rem" + id,
            action: "Reminder Date changed to " + rem.remDate,
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: currentUser.username,
          });
          rem.lastUpdate = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: currentUser.timeZone,
            })
          ).toLocaleString();
        }
        return rem;
      });
      return updateData;
    });
    setRightContent("Details");
    if (!date) return;
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/updateRemDate?timeZone=" +
          currentUser.timeZone,
        {
          id: id,
          remDate:
            date.getFullYear().toString() +
            "-" +
            (date.getMonth() + 1).toString() +
            "-" +
            date.getDate().toString(),
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

  return (
    <>
      <div className="main-left-right-div-container myscrollbar">
        <div className="main-left-div">
          <div className="left-div-header">
            <span className="header-title-sub">OTHERS</span>
            <span className="header-title-main">Reminders</span>
            <img
              title="Add Reminder"
              className="g_plus reminder"
              onClick={() => {
                setRightContent("Create");
              }}
              src={G_plus}
              alt="Create Reminder"
            />
            <OverlayTrigger
              placement="bottom-end"
              trigger="click"
              rootClose={true}
              overlay={
                <Popover>
                  <div className="popup">
                    <p
                      className="p-leave"
                      onClick={() => {
                        document.body.click();
                        setRightContent("Create");
                      }}
                    >
                      Add New
                    </p>
                    <p
                      className="p-leave"
                      onClick={() => {
                        document.body.click();
                        openListview(!listView);
                      }}
                    >
                      {listView ? "Table" : "List"} View
                    </p>
                    <p
                      className="p-leave"
                      onClick={() => {
                        document.body.click();
                      }}
                    >
                      Import
                    </p>
                    <p
                      className="p-leave"
                      onClick={() => {
                        document.body.click();
                      }}
                    >
                      Export
                    </p>
                    <p className="popup-danger" onClick={handleExpiredDelete}>
                      Delete Expired
                    </p>
                    {listView && (
                      <p
                        className="popup-danger"
                        onClick={() => {
                          setTriggerEvent(true);
                        }}
                      >
                        Delete Selected
                      </p>
                    )}
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
                title="Search Material"
                className="left-gs-img search-button"
                src={search}
                onClick={() => {
                  searchOpen(true);
                  setActualData(data);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder="Enter Title"
                  className="search-button-text matreq-search"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                  autoFocus
                />
                <img
                  title="Close"
                  className="search-close rem"
                  src={Filter_Clear}
                  onClick={() => {
                    searchOpen(false);
                    setData(actualData);
                  }}
                />
              </>
            )}
            {!filtered && (
              <img
                title="Filter"
                className="left-gs-img filter-button"
                src={UnFilter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data);
                }}
                alt=""
              />
            )}
            {filtered && (
              <img
                title="Filter"
                className="left-gs-img filter-button"
                src={Filter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data);
                }}
                alt=""
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
                              <legend>Reminder Type</legend>
                              <select
                                className="title"
                                id="type"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select Type
                                </option>
                                {[...new Set(data.map((rem) => rem.type))].map(
                                  (field, index) => (
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
                                {reminderContainer.map((field, index) => (
                                  <option key={index} value={field}>
                                    {field}
                                  </option>
                                ))}
                              </select>
                            </fieldset>
                          </td>
                          <td className="filter-td">
                            <fieldset>
                              <legend>Created By</legend>
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
                                  ...new Set(data.map((rem) => rem.assignee)),
                                ].map((field, index) => (
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
                                    data
                                      .map((rem) => rem.userNames)
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
                                          setData(actualData);
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
                                        setData(actualData);
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
                      display: isScrollButtonVisible ? "block" : "none",
                    }}
                    src={Left_Arrow}
                    onClick={() => handleScroll(-200)}
                  />
                </div>
                <div className="taskCategoryContainer" ref={ref}>
                  {reminderContainer.map((container, index) => (
                    <>
                      <ReminderCategory
                        key={index}
                        headerTitle={container}
                        data={data
                          .map((d) => {
                            let diff =
                              new Date(
                                new Date(d.remDate).toLocaleString("en-US", {
                                  timeZone: currentUser.timeZone,
                                })
                              ).valueOf() -
                              new Date(
                                new Date().toLocaleString("en-US", {
                                  timeZone: currentUser.timeZone,
                                })
                              ).valueOf();
                            let min = diff / 60000;
                            let days = Math.round(min / 1440);
                            if (days < 0) {
                              d["category"] = reminderContainer[0];
                            } else if (days >= 0 && days <= 7) {
                              d["category"] = reminderContainer[1];
                            } else if (days > 7 && days <= 30) {
                              d["category"] = reminderContainer[2];
                            } else {
                              d["category"] = reminderContainer[3];
                            }
                            d["days"] = days;
                            return d;
                          })
                          .filter((d) => d.category === container)}
                        currentReminder={currentReminder}
                        setCurrentReminder={setCurrentReminder}
                        onDrop={onDrop}
                        setRightContent={setRightContent}
                        handleDeleteReminder={handleDeleteReminder}
                      />{" "}
                      <div key={index} className="empty-category"></div>{" "}
                    </>
                  ))}
                </div>
                <div className="left-right-arrow-container">
                  <img
                    className="left-right-arrow"
                    style={{
                      display: isScrollButtonVisible ? "block" : "none",
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
                  <ReminderPaginatedItems
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    items={data}
                    setRightContent={setRightContent}
                    setToken={setToken}
                    setCurrentReminder={setCurrentReminder}
                    currentReminder={currentReminder}
                    handleDeleteReminder={handleDeleteReminder}
                    triggerEvent={triggerEvent}
                    setTriggerEvent={setTriggerEvent}
                    setData={setData}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="main-right-div">
          <div className="right-div-header">
            <span className="right-header-title">
              {rightContent === "Type" ? "Create" : rightContent}
            </span>
            {(rightContent === "Create" || rightContent === "Type") && (
              <>
                <span
                  className={
                    rightContent === "Create"
                      ? "right-sub-header-1 clicked"
                      : "right-sub-header-1"
                  }
                  onClick={() => {
                    setRightContent("Create");
                  }}
                >
                  Reminder
                </span>
                <span
                  className={
                    rightContent === "Type"
                      ? "right-sub-header-2 clicked"
                      : "right-sub-header-2"
                  }
                  onClick={() => {
                    setRightContent("Type");
                  }}
                >
                  Type
                </span>
              </>
            )}
          </div>
          <div className="right-div-content" style={{ position: "relative" }}>
            <CreateReminder
              setToken={setToken}
              rightContent={rightContent}
              setRightContent={setRightContent}
              setData={setData}
              typeData={typeData}
              usersList={usersList}
              setUsersList={setUsersList}
              currentUser={currentUser}
              setCurrentReminder={setCurrentReminder}
            />
            <ReminderTypes
              setToken={setToken}
              rightContent={rightContent}
              depData={typeData}
              setDepdata={setTypedata}
            />
            <RemDetails
              setToken={setToken}
              rightContent={rightContent}
              currentReminder={currentReminder}
              setData={setData}
            />
            <EditReminder
              rightContent={rightContent}
              currentReminder={currentReminder}
              typeData={typeData}
              usersList={usersList}
              setToken={setToken}
              setData={setData}
              setRightContent={setRightContent}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReminderHome;
