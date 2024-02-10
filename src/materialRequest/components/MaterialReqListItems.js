import React, { useEffect, useState } from "react";
import Colors from "./MatColors";
import verticaldots from "../../tasks/assets/vertical-dots.png";
import subject_sort from "../../tasks/assets/subject-sort.png";
import sorticon from "../../tasks/assets/sort.png";
import attach from "../../tasks/assets/attach.png";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import axios from "axios";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Style from "../../tasks/css/task.module.css";
import { getConfirmation } from "../../common/DialogBox";
import discussion from "../../inventory/assets/discussion.png";

const MaterialReqListItems = ({
  currentItems,
  setData,
  selectData,
  setSelectData,
  setRightContent,
  deleteTrigger,
  setDeleteTrigger,
  setToken,
  menuButton,
  setRefresh,
  setMenuButton,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let options = [
    "Order Request",
    "Order Placed",
    "Order Declined",
    "Order Received",
  ];
  const [checkedFlag, setCheckedFlag] = useState(false);
  const [sort, setSort] = useState("requestedDate");
  const handleMatDelete = async (id) => {
    await getConfirmation(
      "You want to delete Selected Material Request?",
      () => {
        deleteMaterial(id);
      }
    );
    document.body.click();
  };
  useEffect(async () => {
    if (deleteTrigger) {
      if (menuButton === "all") {
        handleMatDelete(selectData.matID);
        setDeleteTrigger();
      } else {
        let checkedItem = currentItems.filter(
          (item) => document.getElementById(item.matID).checked
        );
        if (checkedItem.length === 0) {
          toast.error("Please Select atleast one Item Using Checkbox");
          setDeleteTrigger();
        } else {
          let IDs =
            checkedItem.length === 1
              ? checkedItem.map((cust) => cust.matID)[0]
              : checkedItem.map((cust) => cust.matID).join();
          await getConfirmation(
            "You want to delete Material Request(s)?",
            () => {
              deleteMaterial(IDs);
            }
          );

          setDeleteTrigger();
        }
      }
    }
  }, [deleteTrigger]);

  const deleteMaterial = async (IDs) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/mtr/delete-mtr",
        { IDs: IDs },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter(
            (cust) => !IDs.toString().split(",").includes(cust.matID.toString())
          );
          return updatedData;
        });
        toast.success("Material Request(s) deleted Successfully");
        document.body.click();
        setRightContent("Create");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Material Requests(s) deletion failed");
      });
  };
  useEffect(() => {
    const prior = { LOW: 0, MEDIUM: 1, HIGH: 2, "Custom Date": 3 };
    const categ = {
      "Order Request": 0,
      "Order Placed": 1,
      "Order Declined": 2,
      "Order Received": 3,
    };
    if (sort === "") return;
    setData((prevState) => {
      let sortedData = [...prevState];
      switch (sort) {
        case "mrref":
          sortedData.sort((a, b) =>
            a.materialName.localeCompare(b.materialName)
          );
          break;
        case "mrref_dec":
          sortedData.sort((a, b) =>
            b.materialName.localeCompare(a.materialName)
          );
          break;
        case "unit":
          sortedData.sort((a, b) =>
            a.unit > b.unit ? -1 : b.unit > a.unit ? 1 : 0
          );
          break;
        case "unit_dec":
          sortedData.sort((a, b) =>
            a.unit > b.unit ? 1 : b.unit > a.unit ? -1 : 0
          );
          break;

        case "qty":
          sortedData.sort((a, b) => a.quantity - b.quantity);
          break;
        case "qty_dec":
          sortedData.sort((a, b) => b.quantity - a.quantity);
          break;
        case "priority":
          sortedData.sort((a, b) => prior[b.priority] - prior[a.priority]);
          break;
        case "priority_dec":
          sortedData.sort((a, b) => prior[a.priority] - prior[b.priority]);
          break;
        case "status":
          sortedData.sort((a, b) => categ[b.status] - categ[a.status]);
          break;
        case "status_dec":
          sortedData.sort((a, b) => categ[a.status] - categ[b.status]);
          break;
        case "requestedDate":
          sortedData.sort(
            (a, b) =>
              new Date(b.requestedDate).valueOf() -
              new Date(a.requestedDate).valueOf()
          );
          break;
        case "requestedDate_dec":
          sortedData.sort(
            (a, b) =>
              new Date(a.requestedDate).valueOf() -
              new Date(b.requestedDate).valueOf()
          );
          break;
        default:
          break;
      }
      return sortedData;
    });
  }, [sort]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.matID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }

    updateCheckedFlag();
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.matID).checked = e.target.checked;
    });
    updateCheckedFlag();
  };

  const updateCheckedFlag = () => {
    let checkedItem = currentItems.filter(
      (item) => document.getElementById(item.matID).checked
    );
    if (checkedItem.length > 0) {
      setCheckedFlag(true);
    } else {
      setCheckedFlag(false);
    }
  };

  useEffect(() => {
    setCheckedFlag(false);
    if (currentItems == null) return;
    if (menuButton === "all") return;
    setToInitial();
  }, [currentItems]);

  const setToInitial = () => {
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.matID).checked = false;
    });
  };

  const handleMove = async (e, status) => {
    let checkedItem = currentItems.filter(
      (item) => document.getElementById(item.matID).checked
    );
    let IDs =
      checkedItem.length === 1
        ? checkedItem.map((cust) => cust.matID)[0]
        : checkedItem.map((cust) => cust.matID).join();
    e.target.style.color = "#C4C4C4";
    e.target.style.pointerEvents = "none";
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/mtr/move-mtr?timeZone=" +
          currentUser.timeZone,
        {
          IDs: IDs,
          status: status,
          user: currentUser.username,
          orgID: currentUser.orgID,
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (status === "Order Request") {
          toast.success(
            "Material Request(s) Re order in Progress.Please wait..."
          );
          setTimeout(() => {
            setRefresh(Math.random());
          }, 2000);
        } else {
          setData((prev) => {
            let updatedData = prev.filter((cust) => {
              if (IDs.toString().split(",").includes(cust.matID.toString())) {
                cust.status = status;
                cust.history.unshift({
                  moduleID: cust.matID,
                  action: "Moved to " + status,
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: currentUser.username,
                });
              }
              return cust;
            });
            return updatedData;
          });
          toast.success("Material Request(s) Moved Successfully");
        }
        setMenuButton(status);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Material Requests(s) movement failed");
        e.target.style.color = "#2687D7";
        e.target.style.pointerEvents = "auto";
      });
  };

  return (
    <div className="list-container-box">
      {menuButton !== "all" && checkedFlag && (
        <span className="material-move-options">
          <span style={{ color: "#C4C4C4" }}>
            Move to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span
            className="mat-move-opt"
            onClick={(e) =>
              handleMove(
                e,
                options.indexOf(menuButton) < options.length - 1
                  ? options[options.indexOf(menuButton) + 1]
                  : options[0]
              )
            }
          >
            {menuButton === "Order Received" && "Re "}
            {options.indexOf(menuButton) < options.length - 1
              ? options[options.indexOf(menuButton) + 1]
              : options[0]}
          </span>
          {menuButton !== "Order Received" && (
            <>
              &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
              <span
                className="mat-move-opt"
                onClick={(e) =>
                  handleMove(
                    e,
                    options.indexOf(menuButton) < options.length - 1
                      ? options[
                          options.indexOf(menuButton) + 2 <= options.length - 1
                            ? options.indexOf(menuButton) + 2
                            : 0
                        ]
                      : options[1]
                  )
                }
              >
                {menuButton === "Order Declined" && "Re "}
                {options.indexOf(menuButton) < options.length - 1
                  ? options[
                      options.indexOf(menuButton) + 2 <= options.length - 1
                        ? options.indexOf(menuButton) + 2
                        : 0
                    ]
                  : options[1]}
              </span>
            </>
          )}
        </span>
      )}
      {currentItems && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <table className="list-view-table">
            <thead className="thead-class">
              <tr className="list-view-header-row">
                {menuButton !== "all" && (
                  <th width="3.6%">
                    <input
                      id="all"
                      className="chkbx"
                      name="all"
                      type="checkbox"
                      onChange={handleCheckAll}
                    />
                  </th>
                )}
                <th
                  width="23.4%"
                  onClick={() =>
                    sort == "mrref" ? setSort("mrref_dec") : setSort("mrref")
                  }
                >
                  Material Ref & Name
                  {(sort == "mrref" || sort == "mrref_dec") && (
                    <img
                      title="sort"
                      className={sort == "mrref" ? "sort sort-flip" : "sort"}
                      src={subject_sort}
                    />
                  )}
                </th>
                <th
                  width="5.9%"
                  onClick={() =>
                    sort == "qty" ? setSort("qty_dec") : setSort("qty")
                  }
                >
                  Qty
                  {(sort == "qty" || sort == "qty_dec") && (
                    <img
                      title="sort"
                      className={sort === "qty" ? "sort sort-flip" : "sort"}
                      src={subject_sort}
                    />
                  )}
                </th>
                <th
                  width="5.9%"
                  onClick={() =>
                    sort === "unit" ? setSort("unit_dec") : setSort("unit")
                  }
                >
                  Unit
                  {(sort == "unit" || sort == "unit_dec") && (
                    <img
                      title="sort"
                      className={sort == "unit" ? "sort sort-flip" : "sort"}
                      src={subject_sort}
                    />
                  )}
                </th>
                <th width="15.8%">Project </th>
                <th
                  width="11.5%"
                  onClick={() =>
                    sort === "priority"
                      ? setSort("priority_dec")
                      : setSort("priority")
                  }
                >
                  Priority
                  {(sort == "priority" || sort == "priority_dec") && (
                    <img
                      title="sort"
                      className={
                        sort === "priority" ? "sort sort-flip" : "sort"
                      }
                      src={subject_sort}
                    />
                  )}
                </th>
                <th
                  width="16.5%"
                  onClick={() =>
                    sort === "status"
                      ? setSort("status_dec")
                      : setSort("status")
                  }
                >
                  Status
                  {(sort == "status" || sort == "status_dec") && (
                    <img
                      title="sort"
                      className={sort === "status" ? "sort sort-flip" : "sort"}
                      src={subject_sort}
                    />
                  )}
                </th>
                <th
                  width="10.2%"
                  onClick={() =>
                    sort == "requestedDate"
                      ? setSort("requestedDate_dec")
                      : setSort("requestedDate")
                  }
                >
                  Requested Date
                  {(sort == "requestedDate" || sort == "requestedDate_dec") && (
                    <img
                      title="sort"
                      className={
                        sort == "requestedDate" ? "sort sort-flip" : "sort"
                      }
                      src={subject_sort}
                    />
                  )}
                </th>
                <th width="7.2%"></th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems.map((mat, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container"
                      onClick={(e) => {
                        let className = e.target.className;
                        if (
                          className === "chk-box-container-td" ||
                          className === "chkbx" ||
                          className === "p-leave"
                        )
                          return;
                        setSelectData(mat);
                        setRightContent("Details");
                      }}
                      style={{
                        backgroundColor:
                          mat.matID === selectData.matID ? "#E5F1FA" : "",
                      }}
                    >
                      {menuButton !== "all" && (
                        <td width="3.6%" className="chk-box-container-td">
                          <input
                            className="chkbx"
                            name={mat.matID}
                            id={mat.matID}
                            type="checkbox"
                            onChange={handleOnchange}
                          />
                        </td>
                      )}

                      <td width="23.4%" className="ref-subject-container">
                        <p>
                          {mat.refText}
                          {mat.refNum}
                        </p>
                        <p className="list-subject">{mat.materialName}</p>
                      </td>
                      <td width="5.9%">{mat.quantity}</td>
                      <td width="5.9%">{mat.unit}</td>
                      <td width="15.8%" className="ref-subject-container">
                        <p>{mat.projectCode}</p>
                        <p>{mat.projectRelated}</p>
                      </td>
                      <td
                        width="11.5%"
                        style={{
                          color: Colors[mat.priority],
                        }}
                      >
                        {mat.priority === "Custom Date"
                          ? moment(
                              mat.priority_date
                                .replace("T", " ")
                                .replace("Z", "")
                            ).format(currentUser.dateFormat)
                          : mat.priority}
                      </td>
                      <td width="16.5%">
                        <div
                          className="list-category"
                          style={{
                            border: "0.5px solid " + Colors[mat.status],
                            color: Colors[mat.status],
                          }}
                        >
                          {mat.status}
                        </div>
                      </td>
                      <td width="10.2%">
                        {moment(
                          mat.requestedDate.replace("T", " ").replace("Z", "")
                        ).format(currentUser.dateFormat)}
                      </td>
                      <td width="7.2%" style={{ textAlign: "center" }}>
                        {/* <OverlayTrigger
													placement="left"
													trigger="click"
													rootClose
													overlay={(
														<Popover>
															<div className={Style.popup}>
																<p className="p-leave" onClick={() => {
																	setRightContent("Edit");
																	setSelectData(mat);
																	document.body.click();
																}}>
																	Edit
																</p>
																<p className={Style.delete} onClick={()=>handleMatDelete(mat.matID)}>
																	Delete
																</p>
															</div>
														</Popover>
													)}>
													<img
														title="Modify"
														variant="success"
														className="vertical-dots"
														src={verticaldots}
													/>
												</OverlayTrigger> */}
                        {mat.notes && mat.notes.length ? (
                          <span>
                            <img
                              className="discussion_image"
                              src={discussion}
                            ></img>
                          </span>
                        ) : (
                          <></>
                        )}
                        {mat.attachmentsCount > 0 ||
                        (mat.attachments && mat.attachments.length) ? (
                          <span>
                            <img
                              className="discussion_image"
                              src={attach}
                            ></img>
                          </span>
                        ) : (
                          <></>
                        )}
                      </td>
                    </tr>
                    <tr className="empty-row-container">
                      <td width="100%" className="border-td" colSpan="10">
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

export default MaterialReqListItems;
