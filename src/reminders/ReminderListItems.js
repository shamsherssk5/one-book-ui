import axios from "axios";
import React, { useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import { getConfirmation } from "../common/DialogBox";
import Subject_Sort from "../tasks/assets/subject-sort.png";
import Sort from "../tasks/assets/sort.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Dots from "../tasks/assets/vertical-dots.png";
import Style from "../tasks/css/task.module.css";
import Colors from "./Colors";

const ReminderListItems = ({
  setRightContent,
  setToken,
  setCurrentReminder,
  currentReminder,
  handleDeleteReminder,
  triggerEvent,
  setTriggerEvent,
  setData,
  currentItems,
}) => {
  const [sort, setSort] = useState("");
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  useEffect(() => {
    if (currentItems == null) return;
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.id).checked = false;
    });
  }, [currentItems]);

  useEffect(() => {
    sortData(sort);
  }, [sort]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.id).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.id).checked = e.target.checked;
    });
  };

  const handleCustomerClick = (e, cust) => {
    let className = e.target.className;
    if (className === "chk-box-container-td" || className === "chkbx") return;
    setCurrentReminder(cust);
    if (className === "p-leave" || className.includes("delete")) return;
    setRightContent("Details");
  };

  const sortData = (key) => {
    setData((prev) => {
      let updateData = prev;
      switch (key) {
        case "title":
          updateData.sort((a, b) =>
            a.title > b.title ? -1 : b.title > a.title ? 1 : 0
          );
          break;
        case "title-dec":
          updateData.sort((a, b) =>
            a.title > b.title ? 1 : b.title > a.title ? -1 : 0
          );
          break;
        case "type":
          updateData.sort((a, b) =>
            a.type > b.type ? -1 : b.type > a.type ? 1 : 0
          );
          break;
        case "type-dec":
          updateData.sort((a, b) =>
            a.type > b.type ? 1 : b.type > a.type ? -1 : 0
          );
          break;

        case "remDate":
          updateData.sort(
            (a, b) =>
              new Date(b.remDate).valueOf() - new Date(a.remDate).valueOf()
          );
          break;
        case "remDate-dec":
          updateData.sort(
            (a, b) =>
              new Date(a.remDate).valueOf() - new Date(b.remDate).valueOf()
          );
          break;
        case "category":
          updateData.sort((a, b) =>
            a.days > b.days ? -1 : b.days > a.days ? 1 : 0
          );
          break;
        case "category-dec":
          updateData.sort((a, b) =>
            a.days > b.days ? 1 : b.days > a.days ? -1 : 0
          );
          break;
        case "lastUpdate":
          updateData.sort(
            (a, b) =>
              new Date(b.lastUpdate).valueOf() -
              new Date(a.lastUpdate).valueOf()
          );
          break;
        case "lastUpdate-dec":
          updateData.sort(
            (a, b) =>
              new Date(a.lastUpdate).valueOf() -
              new Date(b.lastUpdate).valueOf()
          );
          break;
        default:
          break;
      }
      return [...updateData];
    });
  };

  useEffect(async () => {
    if (triggerEvent) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.id).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Item Using Checkbox");
        setTriggerEvent(false);
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.id)[0]
            : checkedItem.map((cust) => cust.id).join();
        handleDeleteReminder(IDs);
        setTriggerEvent(false);
      }
    }
  }, [triggerEvent]);

  return (
    <div className="list-container-box">
      {currentItems != null && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <table className="list-view-table">
            <thead className="thead-class">
              <tr className="list-view-header-row">
                <th width="3.1%">
                  <input
                    id="all"
                    className="chkbx"
                    name="all"
                    type="checkbox"
                    onChange={handleCheckAll}
                  />
                </th>
                <th
                  width="28.1%"
                  onClick={() =>
                    sort == "title" ? setSort("title-dec") : setSort("title")
                  }
                >
                  Reminder ref & Title{" "}
                  <img
                    title="sort"
                    className={sort == "title" ? "sort sort-flip" : "sort"}
                    src={sort == "title" ? Subject_Sort : Sort}
                  />
                </th>
                <th
                  width="9.4%"
                  onClick={() =>
                    sort == "type" ? setSort("type-dec") : setSort("type")
                  }
                >
                  Type{" "}
                  <img
                    title="sort"
                    className={sort == "type" ? "sort sort-flip" : "sort"}
                    src={sort == "type" ? Subject_Sort : Sort}
                  />
                </th>
                <th
                  width="15.1%"
                  onClick={() =>
                    sort == "remDate"
                      ? setSort("remDate-dec")
                      : setSort("remDate")
                  }
                >
                  Reminder Date{" "}
                  <img
                    title="sort"
                    className={sort == "remDate" ? "sort sort-flip" : "sort"}
                    src={sort == "remDate" ? Subject_Sort : Sort}
                  />
                </th>
                <th
                  width="17.2%"
                  style={{ textAlign: "center" }}
                  onClick={() =>
                    sort == "category"
                      ? setSort("category-dec")
                      : setSort("category")
                  }
                >
                  Status{" "}
                  <img
                    title="sort"
                    className={sort == "category" ? "sort sort-flip" : "sort"}
                    src={sort == "category" ? Subject_Sort : Sort}
                  />
                </th>
                <th width="13.9%">AssignTo</th>
                <th
                  width="10.2%"
                  onClick={() =>
                    sort == "lastUpdate"
                      ? setSort("lastUpdate-dec")
                      : setSort("lastUpdate")
                  }
                >
                  Last Update{" "}
                  <img
                    title="sort"
                    className={sort == "lastUpdate" ? "sort sort-flip" : "sort"}
                    src={sort == "lastUpdate" ? Subject_Sort : Sort}
                  />
                </th>
                <th width="3%"></th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems.map((cust, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container"
                      style={{
                        backgroundColor:
                          cust.id === currentReminder.id ? "#E5F1FA" : "",
                      }}
                      onClick={(e) => handleCustomerClick(e, cust)}
                    >
                      <td width="3.1%" className="chk-box-container-td">
                        <input
                          className="chkbx"
                          name={cust.id}
                          id={cust.id}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td idth="28.1%" className="ref-subject-container">
                        <p>
                          {cust.refText}-{cust.refNum}
                        </p>
                        <p className="list-subject">{cust.title}</p>
                      </td>
                      <td width="9.4%">{cust.type}</td>
                      <td width="15.1%">
                        {cust.remDate
                          ? cust.noTime !== 1
                            ? `${moment(cust.remDate).format(
                                currentUser.dateFormat
                              )} - ${moment(cust.remTime, "HH:mm:ss").format(
                                currentUser.timeFormat === "12 Hrs"
                                  ? "hh:mm A"
                                  : "HH:mm"
                              )}`
                            : `${moment(cust.remDate).format(
                                currentUser.dateFormat
                              )}`
                          : "None"}
                      </td>
                      <td width="17.2%" align="center">
                        <div
                          className="list-category"
                          style={{
                            width: "50%",
                            border: "0.5px solid " + Colors[cust.category],
                            color:
                              cust.category === "Expired"
                                ? "#FFFFFF"
                                : Colors[cust.category],
                            backgroundColor:
                              cust.category === "Expired"
                                ? Colors[cust.category]
                                : "",
                          }}
                        >
                          {cust.days} Days
                        </div>
                        <div
                          style={{
                            color:
                              cust.category === "Expired"
                                ? Colors[cust.category]
                                : "",
                          }}
                        >
                          {cust.category === "Expired" ? "Expired" : "Left"}
                        </div>
                      </td>
                      <td width="13.9%">
                        {cust.userNames
                          ? cust.userNames.split(",").map((d) => (
                              <>
                                <span style={{ marginRight: "0.3vw" }}></span>
                                <Avatar
                                  size="1.75vw"
                                  title={d}
                                  round="50%"
                                  textSizeRatio={3}
                                  textMarginRatio={0.15}
                                  name={d}
                                />
                              </>
                            ))
                          : "None"}
                      </td>
                      <td width="10.2%">
                        {moment(cust.lastUpdate).format(currentUser.dateFormat)}
                      </td>
                      <td width="3%">
                        <OverlayTrigger
                          placement="left"
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
                                    handleDeleteReminder(cust.id);
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
                            className="vertical-dots"
                            src={Dots}
                          />
                        </OverlayTrigger>
                      </td>
                    </tr>
                    <tr className="empty-row-container">
                      <td width="100%" className="border-td" colSpan="8">
                        <div></div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ReminderListItems;
