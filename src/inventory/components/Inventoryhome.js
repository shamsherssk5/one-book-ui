import React, { useEffect, useState } from "react";
import G_plus from "../../assets/images/g_plus.png";
import search from "../../assets/images/gr_sr.png";
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import Filter from "../../tasks/assets/filter.png";
import UnFilter from "../../tasks/assets/unfilter.png";
import Back_Button from "../../assets/images/back-button.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import "../styles/inventory.css";
import moment from "moment-timezone";
import InventoryPaginatedItems from "./InventoryPaginatedItems";
import Summary from "./Summary";
import CreateInventory from "./CreateInventory";
import InventoryCategory from "./InventoryCategory";
import InventoryStores from "./InventoryStores";
import InventoryDetailsPaginatedItems from "./InventoryDetailsPaginatedItems";
import ProductSummary from "./ProductSummary";
import axios from "axios";
import Inventoryholder from "./Inventoryholder";
import ItemMovement from "./ItemMovement";
import toast from "react-hot-toast";
import { getConfirmation } from "../../common/DialogBox";
import EditInventory from "./EditInventory";
import ExpiryDate from "./Expirydate";
import DatePicker from "react-date-picker";

const Inventoryhome = ({ setToken, loading }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [rightContent, setRightContent] = useState("Product Alerts");
  const [menuButton, setMenuButton] = useState("all");
  const [view, setView] = useState("mat-view");
  const [currentVendor, setCurrentVendor] = useState();
  let [data, setData] = useState([]);
  let [originalData, setOriginalData] = useState([]);
  const [deleteTrigger, setDeleteTrigger] = useState();
  const [deleteTriggerInv, setDeleteTriggerInv] = useState();
  const [editTrigger, setEditTrigger] = useState();
  const [triggerEvent, setTriggerEvent] = useState();
  const [stores, setstores] = useState([]);
  const [currentInventory, setCurrentInventory] = useState({});
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [filtered, setFiltered] = useState(false);
  const [actualData, setActualData] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  let [filterView, openFilterview] = useState(false);
  const [catData, setCatdata] = useState({
    categories: [],
    addVisible: false,
    newCat: "",
  });
  const [unitData, setUnitdata] = useState({
    unittypes: [],
    addVisible: false,
    newUnit: "",
  });

  useEffect(() => {
    if (originalData && originalData.length > 0)
      setData(
        originalData.filter(
          (d) => d.menu === menuButton || menuButton === "all"
        )
      );
    else setData([]);
  }, [menuButton, originalData]);

  const handleBack = () => {
    setView("mat-view");
    setRightContent("Product Alerts");
    searchOpen(false);
  };

  const handleSearchChange = (e) => {
    if (view === "mat-view") {
      setOriginalData((prev) => {
        let updated = prev.filter((p) =>
          p.itemName.toLowerCase().includes(e.target.value.toLowerCase())
        );
        return updated;
      });
    } else {
      setOriginalData((prev) => {
        let updatedMat = prev.filter((p) => {
          if (p.invID === currentInventory.invID) {
            let updatedVendor = p.vendor.filter(
              (v) =>
                v.vendorName
                  .toLowerCase()
                  .includes(e.target.value.toLowerCase()) ||
                v.location
                  .toLowerCase()
                  .includes(e.target.value.toLowerCase()) ||
                v.notes.toLowerCase().includes(e.target.value.toLowerCase())
            );
            p.vendor = updatedVendor;
          }
          return p;
        });
        return updatedMat;
      });
    }
  };
  const [actualVendors, setActualVendors] = useState([]);
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (view === "mat-view") {
        setOriginalData(actualData);
      } else {
        let updatedActualData = actualData.filter((p) => {
          if (p.invID === currentInventory.invID) {
            p.vendor = actualVendors;
          }
          return p;
        });
        setOriginalData(updatedActualData);
      }
    }
  };

  const filterData = () => {
    let updData = [];
    if (view === "mat-view") {
      let unit = document.getElementById("unit").value;
      let item = document.getElementById("item").value;
      updData = data
        .filter((d) => item === "" || d.itemName === item)
        .filter((d) => unit === "" || d.unitType === unit)
        .filter((d) => {
          if (start) {
            var started = new Date(d.ilastUpdated);
            started.setHours(0, 0, 0, 0);
          }

          return (
            start === undefined ||
            started.valueOf() >= new Date(start).valueOf()
          );
        })
        .filter((d) => {
          if (end) {
            var ended = new Date(d.ilastUpdated);
            ended.setHours(0, 0, 0, 0);
          }
          return (
            end === undefined || ended.valueOf() <= new Date(end).valueOf()
          );
        });
    } else {
      let move = document.getElementById("move").value;
      let inout = document.getElementById("inout").value;
      let store = document.getElementById("store").value;
      updData = data.filter((p) => {
        if (p.invID === currentInventory.invID) {
          let updatedVendor = p.vendor
            .filter((d) => {
              if (move) {
                if (
                  (move === "Added" || move === "Received") &&
                  d.moveType === "Received"
                ) {
                  return true;
                } else if (
                  move === "Transferred" &&
                  d.moveType === "Transferred" &&
                  d.moveFromTo !== "Disposal"
                ) {
                  return true;
                } else if (
                  move === "Delivered" &&
                  d.moveType === "Delivered" &&
                  d.moveFromTo !== "Disposal"
                ) {
                  return true;
                } else if (move === "Disposed" && d.moveFromTo === "Disposal") {
                  return true;
                } else {
                  return false;
                }
              } else {
                return true;
              }
            })
            .filter((d) => {
              if (inout) {
                if (inout === "IN" && d.moveType === "Received") {
                  return true;
                } else if (inout === "OUT" && d.moveType !== "Received") {
                  return true;
                } else {
                  return false;
                }
              } else {
                return true;
              }
            })
            .filter(
              (d) =>
                store === "" ||
                d.location === store ||
                d.vendorName.includes(store)
            )
            .filter((d) => {
              if (start) {
                var started = new Date(d.lastUpdate);
                started.setHours(0, 0, 0, 0);
              }

              return (
                start === undefined ||
                started.valueOf() >= new Date(start).valueOf()
              );
            })
            .filter((d) => {
              if (end) {
                var ended = new Date(d.lastUpdate);
                ended.setHours(0, 0, 0, 0);
              }
              return (
                end === undefined || ended.valueOf() <= new Date(end).valueOf()
              );
            });
          p.vendor = updatedVendor;
        }
        return p;
      });
    }
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
    if (filterView) {
      if (view === "mat-view") {
        document.getElementById("unit").value = "";
        document.getElementById("item").value = "";
        setData(actualData);
      } else {
        document.getElementById("move").value = "";
        document.getElementById("inout").value = "";
        document.getElementById("store").value = "";
        let updatedActualData = actualData.filter((p) => {
          if (p.invID === currentInventory.invID) {
            p.vendor = actualVendors;
          }
          return p;
        });
        setData(updatedActualData);
      }
    }
  };

  const handleDeleteInventory = async (IDs) => {
    document.body.click();
    await getConfirmation("You want to delete Inventory(s)?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/inventory/delete-inv",
          { IDs: IDs },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setOriginalData((prev) => {
            let updatedData = prev.filter(
              (cust) =>
                !IDs.toString().split(",").includes(cust.invID.toString())
            );
            return updatedData;
          });
          toast.success("Inventory(s) deleted Successfully");
          setRightContent("Create");
          setView("mat-view");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Inventory(s) deletion failed");
        });
    });
  };

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Inventory..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/inventory/getinventory?orgID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setOriginalData(
          res.data.map((m) => {
            m["history"] = [];
            m["attachments"] = [];
            m["vendor"] = [];
            m["discussions"] = [];
            return m;
          })
        );
        if (res.data.length > 0) setCurrentInventory(res.data[0]);
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, []);

  useEffect(async () => {
    searchOpen(false);
    clearFilter();
    openFilterview(false);

    if (!currentInventory) return;
    if (currentInventory.vendor && currentInventory.vendor.length > 0) {
      setCurrentVendor(currentInventory.vendor[0]);
      return;
    }
    if (view !== "vendor-view") return;
    loading({ visibility: true, message: "Loading Inventory Details..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/inventory/getVendors?invID=" +
          currentInventory.invID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data.length > 0) setCurrentVendor(res.data[0]);

        setOriginalData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.invID === currentInventory.invID) {
              cust["vendor"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [currentInventory, view]);

  const removeExpiryDate = async () => {
    document.body.click();
    await getConfirmation("You want to Remove Expiry Date?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/inventory/update-expiry",
          { expDate: null, invID: currentInventory.invID },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setData((prev) => {
            let updatedData = prev.filter((i) => {
              if (i.invID === currentInventory.invID) {
                i.expiryDate = undefined;
              }
              return i;
            });
            return updatedData;
          });

          toast.success("Expiry Date Removed Successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Expiry Date Removal failed");
        });
    });
  };

  return (
    <div className="main-left-right-div-container myscrollbar">
      <div className="main-left-div">
        <div className="left-div-header customers">
          <img
            className="back-button-pic"
            src={Back_Button}
            onClick={handleBack}
            style={{ display: view === "vendor-view" ? "block" : "none" }}
          />
          <span className="header-title-sub">OTHERS</span>
          <span
            className="header-title-main"
            onClick={() =>
              setData(
                originalData.filter(
                  (d) => d.menu === menuButton || menuButton === "all"
                )
              )
            }
          >
            Inventory
          </span>
          <img
            className="g_plus inventory"
            src={G_plus}
            onClick={() => setRightContent("Create")}
            style={{ display: view === "mat-view" ? "block" : "none" }}
          />
          <OverlayTrigger
            placement="bottom-end"
            trigger="click"
            rootClose={true}
            overlay={
              <Popover>
                <div className="popup">
                  {view === "mat-view" && (
                    <>
                      <p
                        onClick={() => {
                          setRightContent("Create");
                          document.body.click();
                        }}
                      >
                        Add New
                      </p>
                      <OverlayTrigger
                        placement="right-end"
                        trigger="click"
                        rootClose={true}
                        overlay={
                          <Popover>
                            <div className="popup">
                              {menuButton !== "stock" && (
                                <p onClick={() => setTriggerEvent("stock")}>
                                  Stock
                                </p>
                              )}
                              {menuButton !== "storage" && (
                                <p onClick={() => setTriggerEvent("storage")}>
                                  Storage
                                </p>
                              )}
                              {menuButton !== "others" && (
                                <p onClick={() => setTriggerEvent("others")}>
                                  Others
                                </p>
                              )}
                            </div>
                          </Popover>
                        }
                      >
                        <p>Move To</p>
                      </OverlayTrigger>
                      <p onClick={() => setTriggerEvent("edit")}>Edit</p>
                      <p onClick={() => document.body.click()}> Merge Items</p>
                      <p onClick={() => document.body.click()}> Import</p>
                      <p onClick={() => document.body.click()}> Export</p>
                      <p
                        className="popup-danger"
                        onClick={() => {
                          setDeleteTriggerInv(true);
                        }}
                      >
                        Delete
                      </p>
                    </>
                  )}
                  {view === "vendor-view" && (
                    <>
                      <ItemMovement
                        heading="Receive Item"
                        type="receive"
                        isAdd="true"
                        setData={setOriginalData}
                        currentInventory={currentInventory}
                        setToken={setToken}
                        stores={stores}
                        Trigger_Button={<p>Add Item</p>}
                      />
                      {currentVendor && (
                        <ItemMovement
                          heading={
                            currentVendor &&
                            currentVendor.moveType === "Received"
                              ? "Receive Item"
                              : currentVendor.moveType === "Delivered"
                              ? "Deliver Item"
                              : "Transfer Item"
                          }
                          type={
                            {
                              Delivered: "delivery",
                              Received: "receive",
                              Transferred:
                                currentVendor.moveFromTo === "Disposal"
                                  ? "disposal"
                                  : currentVendor.location.startsWith("<span")
                                  ? "project"
                                  : "receive",
                            }[currentVendor.moveType]
                          }
                          isEdit="true"
                          currentVendor={currentVendor}
                          setEditTrigger={setEditTrigger}
                          setData={setOriginalData}
                          currentInventory={currentInventory}
                          setToken={setToken}
                          stores={stores}
                          available={currentInventory.vendor
                            .map((v) =>
                              v.moveType === "Received"
                                ? parseInt(v.qty)
                                : -parseInt(v.qty)
                            )
                            .reduce((a, b) => a + b, 0)}
                          Trigger_Button={<p>Edit Item</p>}
                        />
                      )}
                      <ItemMovement
                        heading="Receive Item"
                        type="receive"
                        setData={setOriginalData}
                        currentInventory={currentInventory}
                        setToken={setToken}
                        stores={stores}
                        Trigger_Button={<p>Receive Item</p>}
                      />
                      <OverlayTrigger
                        placement="right-end"
                        trigger="click"
                        rootClose={true}
                        overlay={
                          <Popover>
                            <div className="popup">
                              <ItemMovement
                                type="project"
                                heading="Transfer Item"
                                setData={setOriginalData}
                                currentInventory={currentInventory}
                                setToken={setToken}
                                stores={stores}
                                available={currentInventory.vendor
                                  .map((v) =>
                                    v.moveType === "Received"
                                      ? parseInt(v.qty)
                                      : -parseInt(v.qty)
                                  )
                                  .reduce((a, b) => a + b, 0)}
                                Trigger_Button={<p>To Projects</p>}
                              />
                              <ItemMovement
                                type="disposal"
                                heading="Transfer Item"
                                setData={setOriginalData}
                                currentInventory={currentInventory}
                                setToken={setToken}
                                stores={stores}
                                available={currentInventory.vendor
                                  .map((v) =>
                                    v.moveType === "Received"
                                      ? parseInt(v.qty)
                                      : -parseInt(v.qty)
                                  )
                                  .reduce((a, b) => a + b, 0)}
                                Trigger_Button={<p>To Disposal</p>}
                              />
                              <ItemMovement
                                type="delivery"
                                heading="Deliver Item"
                                setData={setOriginalData}
                                currentInventory={currentInventory}
                                setToken={setToken}
                                stores={stores}
                                available={currentInventory.vendor
                                  .map((v) =>
                                    v.moveType === "Received"
                                      ? parseInt(v.qty)
                                      : -parseInt(v.qty)
                                  )
                                  .reduce((a, b) => a + b, 0)}
                                Trigger_Button={<p>To Delivery</p>}
                              />
                              <ItemMovement
                                type="receive"
                                heading="Transfer Item"
                                setData={setOriginalData}
                                currentInventory={currentInventory}
                                setToken={setToken}
                                stores={stores}
                                available={currentInventory.vendor
                                  .map((v) =>
                                    v.moveType === "Received"
                                      ? parseInt(v.qty)
                                      : -parseInt(v.qty)
                                  )
                                  .reduce((a, b) => a + b, 0)}
                                Trigger_Button={<p>To WareHouse</p>}
                              />
                            </div>
                          </Popover>
                        }
                      >
                        <p>Transfer Item</p>
                      </OverlayTrigger>
                      <p
                        className="popup-danger"
                        onClick={() => setDeleteTrigger(true)}
                      >
                        Delete Item(s)
                      </p>
                      <p
                        onClick={() => {
                          setRightContent("Edit");
                          document.body.click();
                        }}
                      >
                        Edit Inventory
                      </p>

                      <ExpiryDate
                        invID={currentInventory.invID}
                        setToken={setToken}
                        expiryDate={currentInventory.expiryDate}
                        setData={setOriginalData}
                        Trigger_Button={
                          <p className="popup-danger">Set a Expiry</p>
                        }
                      />
                      {currentInventory.expiryDate !== null &&
                        currentInventory.expiryDate && (
                          <p onClick={removeExpiryDate}>Remove Expiry Date</p>
                        )}
                      {/* <p className="popup-danger" onClick={() => handleDeleteInventory(currentInventory.invID)}>Delete Inventory</p> */}
                      <p>Export</p>
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
        </div>
        <div className="left-div-content customers">
          <div className="customers-button-container">
            {view === "mat-view" ? (
              <div className="customers-buttons materialreq-buttons inventory-button">
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
                  onClick={() => setMenuButton("stock")}
                >
                  <div
                    className={
                      menuButton === "stock"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">
                      Materials In Stock
                    </span>
                  </div>
                  <div
                    className={
                      menuButton === "stock"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    <span className="cust-span-all but-count">
                      {originalData.filter((d) => d.menu === "stock").length}
                    </span>
                  </div>
                </div>
                <div
                  className="cust-blacklisted"
                  onClick={() => setMenuButton("storage")}
                >
                  <div
                    className={
                      menuButton === "storage"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">
                      Storage (Rental)
                    </span>
                  </div>
                  <div
                    className={
                      menuButton === "storage"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    <span className="cust-span-all but-count">
                      {originalData.filter((d) => d.menu === "storage").length}
                    </span>
                  </div>
                </div>
                <div
                  className="cust-blacklisted"
                  onClick={() => setMenuButton("others")}
                >
                  <div
                    className={
                      menuButton === "others"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">Others</span>
                  </div>
                  <div
                    className={
                      menuButton === "others"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    <span className="cust-span-all but-count">
                      {originalData.filter((d) => d.menu === "others").length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // <div className="left-sub-heading">Product & Material info</div>
              ""
            )}
          </div>

          <div className="customers-numbers-container">
            {view === "mat-view" && (
              <span>
                {data.length} items, Amount AED{" "}
                {data
                  .map((d) => parseInt(d.itotal || 0))
                  .reduce((a, b) => a + b, 0)}{" "}
              </span>
            )}
            {!isSearchOpen && (
              <img
                title="Search Material"
                className="left-gs-img customers search-button"
                src={search}
                onClick={() => {
                  searchOpen(true);
                  setActualData(originalData);
                  setActualVendors(currentInventory.vendor);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder={
                    view === "mat-view"
                      ? "Enter Item Name"
                      : "Enter vendor Name/Location/Reference"
                  }
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
                src={UnFilter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(originalData);
                  if (currentInventory && currentInventory.vendor.length > 0) {
                    setActualVendors(currentInventory.vendor);
                  }
                }}
              />
            )}
            {filtered && (
              <img
                title="Filter"
                className="left-gs-img customers filter-button"
                src={Filter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(originalData);
                  if (currentInventory && currentInventory.vendor.length > 0) {
                    setActualVendors(currentInventory.vendor);
                  }
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
                          {view === "mat-view" ? (
                            <>
                              <td className="filter-td mtr-td" colSpan={2}>
                                <fieldset>
                                  <legend>Item</legend>
                                  <select
                                    className="title"
                                    id="item"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select Item
                                    </option>

                                    {[
                                      ...new Set(
                                        originalData.map((req) => req.itemName)
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
                                  <legend>Unit Type</legend>
                                  <select
                                    className="title"
                                    id="unit"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select Unit
                                    </option>
                                    {[
                                      ...new Set(
                                        originalData.map(
                                          (task) => task.unitType
                                        )
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
                            </>
                          ) : (
                            <>
                              <td className="filter-td mtr-td">
                                <fieldset>
                                  <legend>Move Type</legend>
                                  <select
                                    className="title"
                                    id="move"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select Move Type
                                    </option>
                                    <option value="Added" className="inv-in">
                                      Added
                                    </option>
                                    <option value="Received" className="inv-in">
                                      Received
                                    </option>
                                    <option
                                      value="Transferred"
                                      className="inv-out"
                                    >
                                      Transferred
                                    </option>
                                    <option
                                      value="Delivered"
                                      className="inv-out"
                                    >
                                      Delivered
                                    </option>
                                    <option
                                      value="Disposed"
                                      className="inv-out"
                                    >
                                      Disposed
                                    </option>
                                  </select>
                                </fieldset>
                              </td>
                              <td className="filter-td mtr-td">
                                <fieldset>
                                  <legend>In / Out</legend>
                                  <select
                                    className="title"
                                    id="inout"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select
                                    </option>
                                    {["IN", "OUT"]
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
                                  <legend>Store Area</legend>
                                  <select
                                    className="title"
                                    id="store"
                                    onChange={filterData}
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Select Store Area
                                    </option>
                                    {[
                                      ...new Set(
                                        currentInventory.vendor.map(
                                          (task) => task.location
                                        )
                                      ),
                                    ]
                                      .filter(
                                        (field) =>
                                          field != undefined && field.length > 0
                                      )
                                      .map((field, index) => (
                                        <option key={index} value={field}>
                                          {field}
                                        </option>
                                      ))}
                                  </select>
                                </fieldset>
                              </td>
                            </>
                          )}

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
          {view !== "mat-view" && (
            <div className="mat-box-container inv-box-container">
              <div className="vendor-item-desc">
                {currentInventory.itemName}
              </div>
              <div className="matbox-holder">
                <div className="mat-box">
                  <table className="mat-table">
                    <tbody>
                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Ref No</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.refText}
                          {currentInventory.refNum}
                        </td>
                      </tr>
                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Available Stock</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.vendor
                            .map((v) =>
                              v.moveType === "Received"
                                ? parseInt(v.qty)
                                : -parseInt(v.qty)
                            )
                            .reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>

                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Unit Type</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.unitType}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mat-box">
                  <table className="mat-table">
                    <thead></thead>

                    <tbody>
                      <tr className="mat-table-row">
                        <td className="mat-table-2-1">Value</td>
                        <td className="mat-table-2-2">:</td>
                        <td className="mat-table-2-3">
                          {currentInventory.itotal || 0}
                        </td>
                      </tr>

                      <tr>
                        <td className="mat-table-firstcol">Category</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.category}
                        </td>
                      </tr>

                      <tr>
                        <td className="mat-table-firstcol">Notes</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.notes}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mat-box">
                  <table className="mat-table" style={{ color: "#F94444" }}>
                    <thead></thead>

                    <tbody>
                      <tr>
                        <td className="mat-table-firstcol">Expiry</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentInventory.expiryDate !== null &&
                            currentInventory.expiryDate &&
                            moment(currentInventory.expiryDate).format(
                              currentUser.dateFormat
                            )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div
            className={
              view === "mat-view"
                ? filterView
                  ? "customers-container filtrvw"
                  : "customers-container"
                : filterView
                ? "material-container inventory-container filtrvw"
                : "material-container inventory-container"
            }
          >
            {view === "mat-view" ? (
              <InventoryPaginatedItems
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                items={data}
                setRightContent={setRightContent}
                setToken={setToken}
                menuButton={menuButton}
                setView={setView}
                setCurrentInventory={setCurrentInventory}
                deleteTriggerInv={deleteTriggerInv}
                setDeleteTriggerInv={setDeleteTriggerInv}
                handleDeleteInventory={handleDeleteInventory}
                triggerEvent={triggerEvent}
                setTriggerEvent={setTriggerEvent}
                setData={setOriginalData}
              />
            ) : (
              <InventoryDetailsPaginatedItems
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                items={currentInventory.vendor}
                setData={setOriginalData}
                setRightContent={setRightContent}
                deleteTrigger={deleteTrigger}
                setDeleteTrigger={setDeleteTrigger}
                editTrigger={editTrigger}
                setEditTrigger={setEditTrigger}
                setToken={setToken}
                menuButton={menuButton}
                setView={setView}
                setCurrentVendor={setCurrentVendor}
              />
            )}
          </div>
        </div>
      </div>
      <div className="main-right-div">
        {rightContent === "Create" ||
        rightContent === "Cat&Unit" ||
        rightContent === "Stores" ? (
          <>
            <div className="right-div-header">
              <span className="right-header-title">Create</span>
              <span
                className={
                  rightContent === "Create"
                    ? "right-mat-sub-header-1 clicked"
                    : "right-mat-sub-header-1"
                }
                onClick={() => setRightContent("Create")}
              >
                Products
              </span>
              <span
                className={
                  rightContent === "Cat&Unit"
                    ? "right-mat-sub-header-2 clicked"
                    : "right-mat-sub-header-2"
                }
                onClick={() => setRightContent("Cat&Unit")}
              >
                Cat & Unit
              </span>
              <span
                className={
                  rightContent === "Stores"
                    ? "right-mat-sub-header-3 clicked"
                    : "right-mat-sub-header-3"
                }
                onClick={() => setRightContent("Stores")}
              >
                Stores
              </span>
            </div>
          </>
        ) : (
          <div className="right-div-header">
            <span className="right-header-title">{rightContent}</span>
          </div>
        )}

        <div className="right-div-content">
          <Summary
            rightContent={rightContent}
            data={originalData}
            setData={setData}
            menuButton={menuButton}
          />
          <Inventoryholder
            rightContent={rightContent}
            currentInventory={currentInventory}
            setToken={setToken}
            setData={setOriginalData}
          />
          <CreateInventory
            rightContent={rightContent}
            menuButton={menuButton}
            setToken={setToken}
            catData={catData}
            unitData={unitData}
            stores={stores}
            setCurrentInventory={setCurrentInventory}
            setData={setOriginalData}
            setRightContent={setRightContent}
          />
          <InventoryCategory
            rightContent={rightContent}
            catData={catData}
            setCatdata={setCatdata}
            setToken={setToken}
            unitData={unitData}
            setUnitdata={setUnitdata}
          />
          <EditInventory
            rightContent={rightContent}
            currentInventory={currentInventory}
            setToken={setToken}
            setData={setOriginalData}
            catData={catData}
            unitData={unitData}
            setRightContent={setRightContent}
          />
          <ProductSummary
            rightContent={rightContent}
            currentInventory={currentInventory}
            setToken={setToken}
            setData={setOriginalData}
          />
          <InventoryStores
            setToken={setToken}
            rightContent={rightContent}
            stores={stores}
            setstores={setstores}
          />
        </div>
      </div>
    </div>
  );
};

export default Inventoryhome;
