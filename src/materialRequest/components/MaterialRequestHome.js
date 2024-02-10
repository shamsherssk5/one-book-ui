import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import g_plus from "../../assets/images/g_plus.png";
import search from "../../assets/images/gr_sr.png";
import filter from "../../tasks/assets/filter.png";
import unfilter from "../../tasks/assets/unfilter.png";
import MaterialReqPaginatedItems from "./MaterialReqPaginatedItems";
import CreateMaterialRequest from "./CreateMaterialRequest";
import Departments from "./Departments";
import MaterialDetails from "./MaterialDetails";
import DatePicker from "react-date-picker";
import axios from "axios";
import EditMaterialRequest from "./EditMaterialRequest";
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import MultipleMaterialRequest from "./MultipleMaterialRequest";

const MaterialRequestHome = ({ setToken, loading }) => {
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [rightContent, setRightContent] = useState("Details");
  const [menuButton, setMenuButton] = useState("all");
  const [data, setData] = useState([]);
  const [actualData, setActualData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [isSearchOpen, searchOpen] = useState(false);
  const [filterView, openFilterview] = useState(false);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [selectData, setSelectData] = useState();
  const [deleteTrigger, setDeleteTrigger] = useState();
  const [unitData, setUnitdata] = useState([]);
  const [pnm, setpnm] = useState([]);
  const [refresh, setRefresh] = useState(Math.random());

  const [depData, setDepdata] = useState({
    departments: [],
    addVisible: false,
    newCat: "",
  });
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  const handleSearchChange = (e) => {
    setOriginalData((prev) => {
      let updatedmatreq = prev.filter((m) =>
        m.materialName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      return updatedmatreq;
    });
  };

  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete")
      setOriginalData(actualData);
  };

  const filterData = () => {
    var department = document.getElementById("department").value;
    var status = document.getElementById("status").value;
    var user = document.getElementById("user").value;
    let updData = data
      .filter((d) => department === "" || d.department === department)
      .filter((d) => status === "" || d.status === status)
      .filter((d) => user === "" || d.createdBy === user)
      .filter(
        (d) =>
          start === undefined ||
          new Date(d.requestedDate).valueOf() >= new Date(start).valueOf()
      )
      .filter(
        (d) =>
          end === undefined ||
          new Date(d.requestedDate).valueOf() <= new Date(end).valueOf()
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
        alert("End Date should be less or equal to Start Date");
        return;
      }
      filterData();
    }
  }, [start, end]);

  const clearFilter = () => {
    setStart();
    setEnd();
    setFiltered(false);
    document.getElementById("department").value = "";
    document.getElementById("status").value = "";
    document.getElementById("user").value = "";
  };
  useEffect(() => {
    if (originalData && originalData.length > 0) {
      setData(
        originalData.filter(
          (i) =>
            (menuButton !== "Order Request" && i.status === menuButton) ||
            (menuButton === "Order Request" &&
              ["Order Request", "Re Order Request"].includes(i.status)) ||
            menuButton === "all"
        )
      );
    } else {
      setData([]);
    }
  }, [menuButton, originalData]);

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Material Requests..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/mtr/getMtr?orgID=" +
          currentUser.orgID,
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        } else {
          setOriginalData(
            res.data.map((m) => {
              m["history"] = [];
              m["conversations"] = [];
              m["attachments"] = [];
              return m;
            })
          );
          if (res.data.length > 0) setSelectData(res.data[0]);
        }
        loading({ visibility: false });
      })
      .catch((err) => {
        loading({ visibility: false });
        console.log(err);
      });
  }, [refresh]);

  return (
    <div className="main-left-right-div-container myscrollbar">
      <div className="main-left-div">
        <div className="left-div-header customers">
          <span className="header-title-sub">OTHERS</span>
          <span className="header-title-main">Material Request</span>
          <MultipleMaterialRequest
            Trigger_Button={
              <img
                className="g_plus customers materialreq"
                src={g_plus}
                title="Create Multiple"
              />
            }
            departments={depData.departments || []}
            setToken={setToken}
            pnm={pnm}
            unitData={unitData}
            setRefresh={setRefresh}
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
                      document.body.click();
                      setRightContent("Create");
                    }}
                  >
                    Add New
                  </p>
                  {menuButton !== "Order Received" && (
                    <p
                      onClick={() => {
                        setRightContent("Edit");
                        document.body.click();
                      }}
                    >
                      Edit Selected
                    </p>
                  )}
                  <p>Export</p>
                  <p>Import</p>
                  <p
                    className="popup-danger"
                    onClick={() => {
                      setDeleteTrigger(true);
                    }}
                  >
                    {" "}
                    Delete
                  </p>
                </div>
              </Popover>
            }
          >
            <button variant="success" className="left-options-button">
              Options
            </button>
          </OverlayTrigger>
        </div>

        <div className="left-div-content customers">
          <div className="customers-button-container">
            <div className="customers-buttons materialreq-buttons">
              <div
                className={
                  menuButton === "all" ? "cust-all active" : "cust-all"
                }
                onClick={() => setMenuButton("all")}
              >
                <span className="cust-span-all">All</span>
              </div>
              <div
                className="cust-preferred"
                onClick={() => setMenuButton("Order Request")}
              >
                <div
                  className={
                    menuButton === "Order Request"
                      ? "cust-preffered-text active"
                      : "cust-preffered-text"
                  }
                >
                  <span className="cust-span-all but-text">Order Request</span>
                </div>
                <div
                  className={
                    menuButton === "Order Request"
                      ? "cust-prefer-count active"
                      : "cust-prefer-count"
                  }
                >
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) =>
                        ["Order Request", "Re Order Request"].includes(d.status)
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div
                className="cust-preferred"
                onClick={() => setMenuButton("Order Placed")}
              >
                <div
                  className={
                    menuButton === "Order Placed"
                      ? "cust-preffered-text active"
                      : "cust-preffered-text"
                  }
                >
                  <span className="cust-span-all but-text">Order Placed</span>
                </div>
                <div
                  className={
                    menuButton === "Order Placed"
                      ? "cust-prefer-count active"
                      : "cust-prefer-count"
                  }
                >
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) => d.status === "Order Placed")
                        .length
                    }
                  </span>
                </div>
              </div>

              <div
                className="cust-blacklisted"
                onClick={() => setMenuButton("Order Declined")}
              >
                <div
                  className={
                    menuButton === "Order Declined"
                      ? "cust-preffered-text active"
                      : "cust-preffered-text"
                  }
                >
                  <span className="cust-span-all but-text">Order Declined</span>
                </div>
                <div
                  className={
                    menuButton === "Order Declined"
                      ? "cust-prefer-count active"
                      : "cust-prefer-count"
                  }
                >
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) => d.status === "Order Declined")
                        .length
                    }
                  </span>
                </div>
              </div>
              <div
                className="cust-blacklisted"
                onClick={() => setMenuButton("Order Received")}
              >
                <div
                  className={
                    menuButton === "Order Received"
                      ? "cust-preffered-text active"
                      : "cust-preffered-text"
                  }
                >
                  <span className="cust-span-all but-text">Order Received</span>
                </div>
                <div
                  className={
                    menuButton === "Order Received"
                      ? "cust-prefer-count active"
                      : "cust-prefer-count"
                  }
                >
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) => d.status === "Order Received")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="customers-numbers-container">
            {!isSearchOpen && (
              <img
                title="Search Material"
                className="left-gs-img customers search-button"
                src={search}
                onClick={() => {
                  searchOpen(true);
                  setActualData(originalData);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder="Enter Material Name"
                  className="search-button-text matreq-search"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                  autoFocus
                />
                <img
                  title="Close"
                  className="search-close"
                  src={Filter_Clear}
                  onClick={() => {
                    searchOpen(false);
                    setOriginalData(actualData);
                  }}
                />
              </>
            )}
            {!filtered && (
              <img
                title="Filter"
                className="left-gs-img customers filter-button"
                src={unfilter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data);
                }}
              />
            )}
            {filtered && (
              <img
                title="Filter"
                className="left-gs-img customers filter-button"
                src={filter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data);
                }}
              />
            )}
          </div>

          {filterView && (
            <div className="left-filter-view mtr-filter-view">
              <div className="filter-view-container mtr-filter">
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
                          <td className="filter-td mtr-td">
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
                                    originalData.map((req) => req.department)
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
                          <td className="filter-td mtr-td">
                            <fieldset>
                              <legend>Status</legend>
                              <select
                                className="title"
                                id="status"
                                onChange={filterData}
                                required
                              >
                                <option value="" disabled selected>
                                  Select Status
                                </option>
                                {[
                                  ...new Set(
                                    originalData.map((task) => task.status)
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
                          <td className="filter-td mtr-td">
                            <fieldset>
                              <legend>Created By</legend>
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
                                    originalData.map((req) => req.createdBy)
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

                          <td className="filter-td mtr-td">
                            <fieldset>
                              <legend>Date From</legend>
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
                          <td className="filter-td mtr-td">
                            <fieldset>
                              <legend>Date to</legend>
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
                          <td className="filter-td mtr-td">
                            <table width="100%">
                              <tbody>
                                <tr width="100%">
                                  <td>
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
                                  <td>
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
              filterView ? "customers-container filtrvw" : "customers-container"
            }
          >
            <MaterialReqPaginatedItems
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              items={data}
              setData={setOriginalData}
              selectData={selectData}
              setSelectData={setSelectData}
              setRightContent={setRightContent}
              deleteTrigger={deleteTrigger}
              setDeleteTrigger={setDeleteTrigger}
              setToken={setToken}
              menuButton={menuButton}
              setMenuButton={setMenuButton}
              setRefresh={setRefresh}
            />
          </div>
        </div>
      </div>

      <div className="main-right-div">
        <>
          <div className="right-div-header">
            <span className="right-header-title">
              {rightContent === "Details" ? "Details" : "Create"}
            </span>
            {(rightContent === "Create" || rightContent === "Departments") && (
              <>
                <span
                  className={
                    rightContent === "Create"
                      ? "right-sub-header-1 clicked"
                      : "right-sub-header-1"
                  }
                  onClick={() => setRightContent("Create")}
                >
                  Material Request
                </span>
                <span
                  className={
                    rightContent === "Departments"
                      ? "right-sub-header-2 clicked mrq"
                      : "right-sub-header-2 mrq"
                  }
                  onClick={() => setRightContent("Departments")}
                >
                  Departments
                </span>
              </>
            )}
          </div>
        </>
        <div className="right-div-content">
          <CreateMaterialRequest
            rightContent={rightContent}
            setData={setOriginalData}
            setToken={setToken}
            depData={depData}
            setRightContent={setRightContent}
            setSelectData={setSelectData}
            unitData={unitData}
            setUnitdata={setUnitdata}
            pnm={pnm}
            setpnm={setpnm}
          />

          <Departments
            rightContent={rightContent}
            depData={depData}
            setDepdata={setDepdata}
            setToken={setToken}
          />

          <MaterialDetails
            rightContent={rightContent}
            matData={selectData}
            setData={setOriginalData}
            currentUser={currentUser}
          />
          <EditMaterialRequest
            rightContent={rightContent}
            setData={setOriginalData}
            setToken={setToken}
            depData={depData}
            setRightContent={setRightContent}
            selectData={selectData}
            unitData={unitData}
            pnm={pnm}
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestHome;
