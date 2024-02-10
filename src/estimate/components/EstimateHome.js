import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import g_plus from "../../assets/images/g_plus.png";
import search from "../../assets/images/gr_sr.png";
import filter from "../../tasks/assets/filter.png";
import unfilter from "../../tasks/assets/unfilter.png";
import DatePicker from "react-date-picker";
import axios from "axios";
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import "../styles/estimate.css";
import EstimationPaginatedItems from "./EstimationPaginatedItems";
import RecentEstimateDetails from "./RecentEstimateDestails";
import Back_Button from "../../assets/images/back-button.png";
import EstimateDetails from "./EstimateDetails";
import EstimateCreate from "./EstimateCreate";
import EstimateInformation from "./EstimateInformation";
import EstimationCreateInfo from "./EstimationCreateInfo";
import toast from "react-hot-toast";
import { getConfirmation, getProceed } from "../../common/DialogBox";
import Colors from "./EstimateColors";
import EstimateEdit from "./EstimateEdit";
import { useLocation, useNavigate } from "react-router-dom";

const EstimateHome = ({ setToken, loading, logo }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let navigate = useNavigate();
  useEffect(async () => {
    await getFinancialDetails();
    await getModuleRestricted();
    await getOrganization();
  }, []);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [organization, setOrganization] = useState({});
  const [isModuleRestricted, setModuleRestricted] = useState(false);
  const [rightContent, setRightContent] = useState("Recent Estimation Status");
  const [menuButton, setMenuButton] = useState("all");
  const [data, setData] = useState([]);
  const [actualData, setActualData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [isSearchOpen, searchOpen] = useState(false);
  const [filterView, openFilterview] = useState(false);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [currentEstimate, setCurrentEstimate] = useState();
  const [view, setView] = useState("est-list-view");
  const [customers, setCustomers] = useState([]);
  const [refresh, setRefresh] = useState();
  const [triggerEvent, setTriggerEvent] = useState();
  const [estList, setEstList] = useState([]);
  const [dragAndDrop, setDragAndDrop] = useState(false);
  const [downLoadBOM, setDownLoadBOM] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    discount: 0,
    netTotal: 0,
    totalTax: 0,
    grandTotal: 0,
    isCreate: false,
    estTotal: 0,
    estProfit: 0,
    estTax: 0,
    estSellingPrice: 0,
    categories: [],
  });
  const [files, setFiles] = useState([]);
  const [cat, updateCat] = useState({});
  const [financialDetails, setFinancialDetails] = useState({});
  const [sideMenu, setSideMenu] = useState("view");

  const handleSearchChange = (e) => {
    setOriginalData((prev) => {
      let updatedEstimation = prev.filter(
        (m) =>
          m.projName.toLowerCase().includes(e.target.value.toLowerCase()) ||
          m.customer.toLowerCase().includes(e.target.value.toLowerCase()) ||
          m.reference.toLowerCase().includes(e.target.value.toLowerCase())
      );
      return updatedEstimation;
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
      .filter((d) => department === "" || d.customer === department)
      .filter((d) => status === "" || d.status === status)
      .filter((d) => user === "" || d.createdBy === user)
      .filter(
        (d) =>
          start === undefined ||
          new Date(d.created).valueOf() >= new Date(start).valueOf()
      )
      .filter(
        (d) =>
          end === undefined ||
          new Date(d.created).valueOf() <= new Date(end).valueOf()
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
            (menuButton !== "Approvals" && i.status === menuButton) ||
            (menuButton === "Approvals" &&
              ["Awaiting Approval", "Approved"].includes(i.status)) ||
            menuButton === "all"
        )
      );
    } else {
      setData([]);
    }
  }, [menuButton, originalData]);

  const getOrganization = async () => {
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/settings/getOrganization?ID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        if (res.data.length > 0) {
          setOrganization(res.data[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getModuleRestricted = async () => {
    if (currentUser.role === "Admin") return;
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/settings/moduleRestricted",
        {
          orgID: currentUser.orgID,
          role: currentUser.role,
          module: "estimation",
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data.length > 0 && res.data[0].a_restricted === 1) {
          setModuleRestricted(true);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Some thing went Wrong!");
        navigate("/");
      });
  };

  const getFinancialDetails = async () => {
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/settings/getFinancial?ID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data.length > 0) {
          let FD = res.data[0];
          if (!FD.currType || !FD.saleTax || !FD.saleTaxPer || !FD.taxLabal) {
            getProceed(
              "Currency type, Sales Tax type and Percentage, Tax Label required in Financial Settings. Do want to Update?",
              () => {
                navigate("/settings", { state: { component: "Financial" } });
              },
              () => {
                navigate("/");
              }
            );
          } else {
            const taxTpyes = {
              "Tax Exclusive": "exclusive",
              "Tax inclusive": "inclusive",
              "NO TAX": "no",
            };
            FD.saleTax = taxTpyes[FD.saleTax];
            setFinancialDetails(FD);
          }
        } else {
          getProceed(
            "Finacial Settings not yet updated. Do want to proceed to Settings?",
            () => {
              navigate("/settings", { state: { component: "Financial" } });
            },
            () => {
              navigate("/");
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Some thing went Wrong!");
        navigate("/");
      });
  };

  useEffect(async () => {
    setView("est-list-view");
    setRightContent("Recent Estimation Status");
    loading({ visibility: true, message: "Loading Estimates..." });
    setFiles([]);
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/estimations-list?orgID=" +
          currentUser.orgID +
          "&username=" +
          currentUser.username,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setOriginalData(res.data);
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [refresh]);
  const [materials, setMaterials] = useState([]);
  useEffect(async () => {
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/est-getpnm?orgID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setMaterials(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(async () => {
    loading({ visibility: true, message: "Loading Customers..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/customers-list?orgID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data && res.data.length > 0) {
          setCustomers(res.data);
        }
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, []);

  const handleBack = () => {
    setView("est-list-view");
    setRightContent("Recent Estimation Status");
    setRefresh(Math.random());
  };

  const handleCreate = () => {
    setView("est-create");
    setRightContent("Cost & Profit");
    document.body.click();
  };

  const handleOptionEvent = (e) => {
    document.body.click();
    let event = e.target.getAttribute("name");
    setTriggerEvent(event);
  };

  const [editOrRevise, setEditOrRevise] = useState("");
  const handleRevise = () => {
    if (estList && estList.length > 0) {
      const result = estList.some(
        (est) => est.isMatList === 1 && est.matList.length === 0
      );
      if (result) {
        toast.error("Please Wait...Estimate is Still Loading");
        return;
      }
    }
    document.body.click();
    setEditOrRevise("Revise");
    setView("est-edit");
    setRightContent("Cost & Profit");
  };

  const handleDuplicate = (e) => {
    document.body.click();
    handleEvent(currentEstimate.estID, "duplicate");
  };
  const handleEstDelete = async () => {
    document.body.click();
    await getConfirmation("You want to delete Estimation?", () => {
      handleEvent(currentEstimate.estID, "delete");
    });
  };
  const handleEvent = async (IDs, event) => {
    document.body.click();
    let orgID = currentUser.orgID;
    let username = currentUser.username;
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/event-update?timeZone=" +
          currentUser.timeZone,
        { IDs, event, orgID, username },
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setTriggerEvent();
        if (["duplicate", "delete"].includes(event)) {
          setRefresh(Math.random());
        } else {
          let avail = false;
          setOriginalData((prev) => {
            let updated = [...prev].filter((est) => {
              if (IDs.toString().split(",").includes(est.estID.toString())) {
                avail = true;
                est.status = event;
              }
              return est;
            });
            return updated;
          });
          if (
            !avail &&
            view === "est-details" &&
            currentEstimate &&
            Object.keys(currentEstimate).length
          ) {
            setCurrentEstimate({
              ...currentEstimate,
              status: event,
            });
          }
        }
      })
      .catch((err) => {
        toast.error("Estimation(s) Updation failed");
      });
  };

  const handleRecentClick = (id) => {
    let estimate = originalData.find((e) => e.estID === id);
    setCurrentEstimate(estimate);
    setView("est-details");
    setRightContent("Information");
  };

  const handleNavigation = async (estID) => {
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/getEst?estID=" +
          estID,
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data.length) {
          setOriginalData([...originalData, res.data[0]]);
          setCurrentEstimate(res.data[0]);
          setView("est-details");
          setRightContent("Information");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="main-left-right-div-container myscrollbar">
      <div className="main-left-div">
        <div className="left-div-header customers">
          {view !== "est-list-view" && view !== "est-edit" && (
            <img
              className="back-button-pic"
              src={Back_Button}
              onClick={handleBack}
            />
          )}
          <span className="header-title-sub">SALES</span>
          <span className="header-title-main">Estimation</span>
          {view === "est-list-view" && (
            <img
              className="g_plus customers est"
              src={g_plus}
              onClick={handleCreate}
            />
          )}
          {view === "est-create" && (
            <span
              className="est-details-status-container"
              style={{
                border: "0.5px solid " + Colors["Draft"],
                color: Colors["Draft"],
              }}
            >
              Draft
            </span>
          )}
          {view === "est-edit" && (
            <span
              className="est-details-status-container"
              style={{
                border: "0.5px solid " + Colors[currentEstimate.status],
                color: Colors[currentEstimate.status],
              }}
            >
              {currentEstimate.status}
            </span>
          )}
          {view !== "est-create" && view !== "est-edit" && (
            <OverlayTrigger
              placement="bottom-end"
              trigger="click"
              rootClose={true}
              overlay={
                <Popover>
                  <div className="popup">
                    {view === "est-list-view" && (
                      <>
                        <p onClick={handleCreate}>Create New</p>
                        <p
                          className="popup-danger"
                          name="delete"
                          onClick={handleOptionEvent}
                        >
                          Delete
                        </p>
                        <p name="Awaiting Approval" onClick={handleOptionEvent}>
                          Send for Approval
                        </p>
                        <p name="Draft" onClick={handleOptionEvent}>
                          Mark as Draft
                        </p>
                        <p name="Approved" onClick={handleOptionEvent}>
                          Mark as Approved
                        </p>
                        <p name="Declined" onClick={handleOptionEvent}>
                          Mark as Declined
                        </p>
                        <p name="Sent" onClick={handleOptionEvent}>
                          Mark as Sent
                        </p>
                      </>
                    )}
                    {view === "est-details" && (
                      <>
                        <p onClick={handleRevise}>Revise</p>
                        <p onClick={handleDuplicate}>Duplicate</p>
                        <p className="popup-danger" onClick={handleEstDelete}>
                          Delete
                        </p>
                        {currentEstimate.status !== "Awaiting Approval" && (
                          <p
                            onClick={() =>
                              handleEvent(
                                currentEstimate.estID,
                                "Awaiting Approval"
                              )
                            }
                          >
                            Send for Approval
                          </p>
                        )}
                        {currentEstimate.status !== "Draft" && (
                          <p
                            onClick={() =>
                              handleEvent(currentEstimate.estID, "Draft")
                            }
                          >
                            Mark as Draft
                          </p>
                        )}
                        {currentEstimate.status !== "Approved" && (
                          <p
                            onClick={() =>
                              handleEvent(currentEstimate.estID, "Approved")
                            }
                          >
                            Mark as Approved
                          </p>
                        )}
                        {currentEstimate.status !== "Declined" && (
                          <p
                            onClick={() =>
                              handleEvent(currentEstimate.estID, "Declined")
                            }
                          >
                            Mark as Declined
                          </p>
                        )}
                        {currentEstimate.status !== "Sent" && (
                          <p
                            onClick={() =>
                              handleEvent(currentEstimate.estID, "Sent")
                            }
                          >
                            Mark as Sent
                          </p>
                        )}
                        {
                          <p
                            onClick={() => {
                              setDragAndDrop(!dragAndDrop);
                              document.body.click();
                            }}
                          >
                            {dragAndDrop
                              ? "Exit Drag and Drop"
                              : "Drag and Drop"}
                          </p>
                        }
                        {
                          <p
                            onClick={() => {
                              setDownLoadBOM(true);
                              document.body.click();
                            }}
                          >
                            Download BOM
                          </p>
                        }
                      </>
                    )}
                  </div>
                </Popover>
              }
            >
              <button variant="success" className="left-options-button">
                Options
              </button>
            </OverlayTrigger>
          )}
        </div>

        <div className="left-div-content customers">
          {view === "est-list-view" && (
            <>
              <div className="customers-button-container">
                <div className="customers-buttons materialreq-buttons estimation-buttons">
                  <div
                    className={
                      menuButton === "all" ? "cust-all active" : "cust-all"
                    }
                    onClick={() => setMenuButton("all")}
                  >
                    <span className="cust-span-all">All</span>
                  </div>
                  <div
                    className="cust-preferred quote-request"
                    onClick={() => setMenuButton("Request")}
                  >
                    <div
                      className={
                        menuButton === "Request"
                          ? "cust-preffered-text active"
                          : "cust-preffered-text"
                      }
                    >
                      <span className="cust-span-all but-text">
                        Quote Request
                      </span>
                    </div>
                    <div
                      className={
                        menuButton === "Request"
                          ? "cust-prefer-count active"
                          : "cust-prefer-count"
                      }
                    >
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter((d) => d.status === "Request")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                  <div
                    className="cust-preferred"
                    onClick={() => setMenuButton("Draft")}
                  >
                    <div
                      className={
                        menuButton === "Draft"
                          ? "cust-preffered-text active"
                          : "cust-preffered-text"
                      }
                    >
                      <span className="cust-span-all but-text">Draft</span>
                    </div>
                    <div
                      className={
                        menuButton === "Draft"
                          ? "cust-prefer-count active"
                          : "cust-prefer-count"
                      }
                    >
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter((d) => d.status === "Draft")
                            .length
                        }
                      </span>
                    </div>
                  </div>

                  <div
                    className="cust-blacklisted awaiting-approval"
                    onClick={() => setMenuButton("Approvals")}
                  >
                    <div
                      className={
                        menuButton === "Approvals"
                          ? "cust-preffered-text active"
                          : "cust-preffered-text"
                      }
                    >
                      <span className="cust-span-all but-text">Approvals</span>
                    </div>
                    <div
                      className={
                        menuButton === "Approvals"
                          ? "cust-prefer-count active"
                          : "cust-prefer-count"
                      }
                    >
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter(
                            (d) =>
                              d.status === "Awaiting Approval" ||
                              d.status === "Approved"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  <div
                    className="cust-blacklisted"
                    onClick={() => setMenuButton("Sent")}
                  >
                    <div
                      className={
                        menuButton === "Sent"
                          ? "cust-preffered-text active"
                          : "cust-preffered-text"
                      }
                    >
                      <span className="cust-span-all but-text">Sent</span>
                    </div>
                    <div
                      className={
                        menuButton === "Sent"
                          ? "cust-prefer-count active"
                          : "cust-prefer-count"
                      }
                    >
                      <span className="cust-span-all but-count">
                        {originalData.filter((d) => d.status === "Sent").length}
                      </span>
                    </div>
                  </div>
                  <div
                    className="cust-blacklisted"
                    onClick={() => setMenuButton("Declined")}
                  >
                    <div
                      className={
                        menuButton === "Declined"
                          ? "cust-preffered-text active"
                          : "cust-preffered-text"
                      }
                    >
                      <span className="cust-span-all but-text">Declined</span>
                    </div>
                    <div
                      className={
                        menuButton === "Declined"
                          ? "cust-prefer-count active"
                          : "cust-prefer-count"
                      }
                    >
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter((d) => d.status === "Declined")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="customers-numbers-container">
                <span>
                  {data.length} items, amount {financialDetails.currType} &nbsp;
                  {(
                    data
                      .map((d) => parseInt(d.amount))
                      .reduce((a, b) => a + b, 0) || 0
                  ).toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                  })}
                </span>
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
                      placeholder="Enter Customer/Project"
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
                                  <legend>Customer</legend>
                                  <select
                                    className="title"
                                    id="department"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select Customer
                                    </option>

                                    {[
                                      ...new Set(
                                        originalData.map((req) => req.customer)
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
                  filterView
                    ? "customers-container filtrvw"
                    : "customers-container"
                }
              >
                <EstimationPaginatedItems
                  setToken={setToken}
                  setRightContent={setRightContent}
                  itemsPerPage={itemsPerPage}
                  items={data}
                  updateData={setOriginalData}
                  setItemsPerPage={setItemsPerPage}
                  setCurrentEstimate={setCurrentEstimate}
                  setView={setView}
                  triggerEvent={triggerEvent}
                  setTriggerEvent={setTriggerEvent}
                  handleEvent={handleEvent}
                />
              </div>
            </>
          )}
          {view === "est-details" && (
            <>
              <EstimateDetails
                currentEstimate={currentEstimate}
                setData={setOriginalData}
                customer={
                  customers.find((c) => c.custID === currentEstimate.custID) ||
                  {}
                }
                loading={loading}
                setToken={setToken}
                stats={stats}
                setStats={setStats}
                setEstList={setEstList}
                view={view}
                sideMenu={sideMenu}
                setSideMenu={setSideMenu}
                dragAndDrop={dragAndDrop}
                downLoadBOM={downLoadBOM}
                setDownLoadBOM={setDownLoadBOM}
                logo={logo}
                isModuleRestricted={isModuleRestricted}
                organization={organization}
                financialDetails={financialDetails}
              />
            </>
          )}
          {view === "est-create" && (
            <>
              <EstimateCreate
                originalData={originalData}
                customers={customers}
                setToken={setToken}
                currentUser={currentUser}
                materials={materials}
                setStats={setStats}
                attachments={files}
                handleBack={handleBack}
                setCustomers={setCustomers}
                handleNavigation={handleNavigation}
                view={view}
                loading={loading}
                cat={cat}
                financialDetails={financialDetails}
                isModuleRestricted={isModuleRestricted}
              />
            </>
          )}
          {view === "est-edit" && (
            <>
              <EstimateEdit
                originalData={originalData}
                customers={customers}
                setCustomers={setCustomers}
                setToken={setToken}
                currentUser={currentUser}
                materials={materials}
                setStats={setStats}
                attachments={files}
                handleBack={handleBack}
                handleNavigation={handleNavigation}
                currentEstimate={currentEstimate}
                estList={estList}
                setEstList={setEstList}
                editOrRevise={editOrRevise}
                cat={cat}
                financialDetails={financialDetails}
                isModuleRestricted={isModuleRestricted}
              />
            </>
          )}
        </div>
      </div>

      <div className="main-right-div">
        <>
          <div
            className="right-div-header"
            style={
              rightContent === "Recent Estimation Status"
                ? { border: "none" }
                : {}
            }
          >
            <span className="right-header-title">
              {rightContent === "Information" && sideMenu !== "view"
                ? sideMenu === "discussions"
                  ? "Discussions"
                  : "History"
                : rightContent === "Cost & Profit" && isModuleRestricted
                ? "Create"
                : rightContent}
            </span>
            {rightContent === "Cost & Profit" && !isModuleRestricted && (
              <span className="est-currency-text-span est-currency-text-span-home">
                Currency ({financialDetails.currType})
              </span>
            )}
          </div>
        </>
        <div className="right-div-content">
          <RecentEstimateDetails
            rightContent={rightContent}
            data={data}
            handleRecentClick={handleRecentClick}
          />
          <EstimateInformation
            rightContent={rightContent}
            stats={stats}
            currentEstimate={currentEstimate}
            setToken={setToken}
            sideMenu={sideMenu}
            isModuleRestricted={isModuleRestricted}
          />
          <EstimationCreateInfo
            rightContent={rightContent}
            stats={stats}
            setToken={setToken}
            files={files}
            setFiles={setFiles}
            editOrRevise={editOrRevise}
            updateCat={updateCat}
            materials={materials}
            setMaterials={setMaterials}
            isModuleRestricted={isModuleRestricted}
          />
        </div>
      </div>
    </div>
  );
};

export default EstimateHome;
