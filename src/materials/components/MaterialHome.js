import React, { useEffect, useState } from "react";
import G_plus from "../../assets/images/g_plus.png";
import Gr_Sr from "../../assets/images/gr_sr.png";
import Filter from "../../tasks/assets/filter.png";
import UnFilter from "../../tasks/assets/unfilter.png";
import "../styles/MaterialHome.css";
import CreateMaterial from "./CreateMaterial";
import MaterialCategory from "./MaterialCategory";
import Back_Button from "../../assets/images/back-button.png";
import MaterialUnit from "./MaterialUnit";
import MaterialPaginatedItems from "./MaterialPaginatedItems";
import { OverlayTrigger, Popover } from "react-bootstrap";
import VendorPaginatedItems from "./VendorPaginatedItems";
import VendorAdd from "./VendorAdd";
import EditMaterial from "./EditMaterial";
import DatePicker from "react-date-picker";
import MaterialDetails from "./MaterialDetails";
import axios from "axios";
import Editvendor from "./Editvendor";
import NoteAdder from "./NoteAdder";
import toast from "react-hot-toast";
import DataImporter from "../../common/DataImporter";
const MaterialHome = ({ setToken, loading }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [rightContent, setRightContent] = useState("Details");
  const [menuButton, setMenuButton] = useState("all");
  const [view, setView] = useState("mat-view");
  let [data, setData] = useState([]);
  let [deleteVendor, setdeleteVendor] = useState(false);
  let [deleteMaterial, setDeleteMaterial] = useState(false);
  let [originalData, setOriginalData] = useState([]);
  let [currentMaterial, setCurrentMaterial] = useState({});
  let [currentVendor, setCurrentVendor] = useState();
  const [refresh, setRefresh] = useState(Math.random());

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

  const handleSearchChange = (e) => {
    if (view === "mat-view") {
      setOriginalData((prev) => {
        let updatedMat = prev.filter(
          (p) =>
            p.itemName.toLowerCase().includes(e.target.value.toLowerCase()) ||
            p.itemDesc.toLowerCase().includes(e.target.value.toLowerCase())
        );
        return updatedMat;
      });
    } else {
      setOriginalData((prev) => {
        let updatedMat = prev.filter((p) => {
          if (p.prodID === currentMaterial.prodID) {
            let updatedVendor = p.vendor.filter((v) =>
              v.vendorName.toLowerCase().includes(e.target.value.toLowerCase())
            );
            p.vendor = updatedVendor;
          }
          return p;
        });
        return updatedMat;
      });
    }
  };
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (view === "mat-view") {
        setOriginalData(actualData);
      } else {
        let updatedActualData = actualData.filter((p) => {
          if (p.prodID === currentMaterial.prodID) {
            p.vendor = actualVendors;
          }
          return p;
        });
        setOriginalData(updatedActualData);
      }
    }
  };

  const handleBack = () => {
    setView("mat-view");
    setRightContent("Details");
  };

  const filterData = () => {
    var department = document.getElementById("department").value;
    var status = document.getElementById("category").value;
    var user = document.getElementById("user").value;
    var assignFrom = document.getElementById("assignFrom").value;
    let updData = data.tasks
      .filter((d) => department === "" || d.title === department)
      .filter((d) => status === "" || d.category === status)
      .filter(
        (d) =>
          user === "" ||
          (d.userNames !== undefined &&
            d.userNames !== null &&
            d.userNames.includes(user))
      )
      .filter((d) => assignFrom === "" || d.assignee === assignFrom)
      .filter(
        (d) =>
          start === undefined ||
          new Date(d.assignDate).valueOf() >= new Date(start).valueOf()
      )
      .filter(
        (d) =>
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

  const [filtered, setFiltered] = useState(false);
  const [actualData, setActualData] = useState([]);
  const [actualVendors, setActualVendors] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  let [filterView, openFilterview] = useState(false);

  useEffect(() => {
    if (originalData && originalData.length > 0)
      setData(
        originalData.filter(
          (d) => d.marginType === menuButton || menuButton === "all"
        )
      );
    else setData([]);
  }, [menuButton, originalData]);

  useEffect(async () => {
    if (!currentMaterial) return;
    if (currentMaterial.vendor && currentMaterial.vendor.length > 0) {
      setCurrentVendor(currentMaterial.vendor[0]);
      return;
    }
    if (view !== "vendor-view") return;
    loading({ visibility: true, message: "Loading Vendors..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/pnm/getVendors?prodID=" +
          currentMaterial.prodID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data.length > 0) setCurrentVendor(res.data[0]);

        setOriginalData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.prodID === currentMaterial.prodID) {
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
  }, [currentMaterial, view]);

  const handleDeleteMaterial = async (IDs) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/pnm/delete-mat",
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
              !IDs.toString().split(",").includes(cust.prodID.toString())
          );
          return updatedData;
        });
        toast.success("Material(s) deleted Successfully");
        document.body.click();
        setRightContent("Create");
        setView("mat-view");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Material(s) deletion failed");
      });
  };

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Products and Materials..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/pnm/getpnm?orgID=" +
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
            m["conversations"] = [];
            m["attachments"] = [];
            m["vendor"] = [];
            return m;
          })
        );
        if (res.data.length > 0) setCurrentMaterial(res.data[0]);
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [refresh]);

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
          <span className="header-title-sub">SALES</span>
          <span className="header-title-main">Products & Materials</span>
          <img
            className="g_plus customers material"
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
                {view === "mat-view" ? (
                  <div className="popup">
                    <p
                      onClick={() => {
                        document.body.click();
                        setRightContent("Create");
                      }}
                    >
                      Add New
                    </p>
                    <NoteAdder
                      type="mat"
                      id={currentMaterial.prodID}
                      setData={setOriginalData}
                      notes={currentMaterial.notes}
                      Trigger_Button={<p>Add Note</p>}
                    />
                    <DataImporter
                      module="pnm"
                      moduleName="Products & Materials"
                      setToken={setToken}
                      Trigger_Button={<p>Import</p>}
                      setRefresh={setRefresh}
                    ></DataImporter>
                    <p> Export</p>
                    <p>Merge Items</p>
                    <p
                      className="popup-danger"
                      onClick={() => setDeleteMaterial(true)}
                    >
                      {" "}
                      Delete
                    </p>
                  </div>
                ) : (
                  <div className="popup" id="popupMat">
                    <p
                      onClick={() => {
                        setRightContent("Edit");
                        document.body.click();
                      }}
                    >
                      Edit Material info
                    </p>
                    <p
                      className="popup-danger"
                      onClick={() => {
                        handleDeleteMaterial(currentMaterial.prodID);
                      }}
                    >
                      Delete Material
                    </p>
                    <p
                      onClick={() => {
                        setRightContent("VendorAdd");
                        document.body.click();
                      }}
                    >
                      Add Vendor
                    </p>
                    <p
                      onClick={() => {
                        setRightContent("VendorEdit");
                        document.body.click();
                      }}
                    >
                      Edit Selected Vendor
                    </p>
                    <NoteAdder
                      type="mat"
                      id={currentMaterial.prodID}
                      setData={setOriginalData}
                      notes={currentMaterial.notes}
                      Trigger_Button={<p>Add Note</p>}
                    />
                    <p>Set Default</p>
                    <p
                      className="popup-danger"
                      onClick={() => setdeleteVendor(true)}
                    >
                      {" "}
                      Delete vendor(s)
                    </p>
                  </div>
                )}
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
              <div className="customers-buttons materialreq-buttons material-buttons">
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
                  onClick={() => setMenuButton("percentage")}
                >
                  <div
                    className={
                      menuButton === "percentage"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">
                      Percentage Type
                    </span>
                  </div>
                  <div
                    className={
                      menuButton === "percentage"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    <span className="cust-span-all but-count">
                      {
                        originalData.filter(
                          (d) => d.marginType === "percentage"
                        ).length
                      }
                    </span>
                  </div>
                </div>
                <div
                  className="cust-blacklisted"
                  onClick={() => setMenuButton("fixed")}
                >
                  <div
                    className={
                      menuButton === "fixed"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">Fixed Type</span>
                  </div>
                  <div
                    className={
                      menuButton === "fixed"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    <span className="cust-span-all but-count">
                      {
                        originalData.filter((d) => d.marginType === "fixed")
                          .length
                      }
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
                      {
                        originalData.filter((d) => d.marginType === "others")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="left-sub-heading">Product & Material info</div>
            )}
          </div>

          <div className="customers-numbers-container">
            {!isSearchOpen && (
              <img
                title="Search Task"
                className="left-gs-img customers search-button"
                src={Gr_Sr}
                onClick={() => {
                  searchOpen(true);
                  setActualData(originalData);
                  setActualVendors(currentMaterial.vendor);
                }}
              />
            )}
            {isSearchOpen && (
              <>
                <input
                  type="text"
                  placeholder={
                    view === "mat-view"
                      ? "Enter Item Name/Description"
                      : "Enter vendor Name"
                  }
                  className="search-button-text matreq-search"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                />
                <small
                  title="close Search"
                  className="calendar-closee template matreq-search"
                  onClick={() => {
                    searchOpen(false);
                    setOriginalData(actualData);
                  }}
                >
                  &#10006;
                </small>
              </>
            )}
            {!filtered && (
              <img
                title="Filter"
                className="left-gs-img customers filter-button"
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
                className="left-gs-img customers filter-button"
                src={Filter}
                onClick={() => {
                  openFilterview(true);
                  setActualData(data.tasks);
                }}
              />
            )}
          </div>
          {view !== "mat-view" && (
            <div className="mat-box-container">
              <div className="vendor-item-desc">
                Item Description : {currentMaterial.itemDesc}
              </div>
              <div className="matbox-holder">
                <div className="mat-box">
                  <table className="mat-table">
                    <tbody>
                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Ref No</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.refText}
                          {currentMaterial.refNum}
                        </td>
                      </tr>

                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Item Name</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.itemName}
                        </td>
                      </tr>

                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Category</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.category}
                        </td>
                      </tr>
                      <tr className="mat-table-row">
                        <td className="mat-table-firstcol">Unit Cost</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.unitPrice}
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
                        <td className="mat-table-2-1">Vendor Name</td>
                        <td className="mat-table-2-2">:</td>
                        <td className="mat-table-2-3">
                          {currentVendor ? currentVendor.vendorName : ""}
                        </td>
                      </tr>

                      <tr>
                        <td className="mat-table-firstcol">Unit Type</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.unitType}
                        </td>
                      </tr>

                      <tr>
                        <td className="mat-table-firstcol">
                          Last Selling Price
                        </td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.sellingPrice}
                        </td>
                      </tr>
                      <tr>
                        <td className="mat-table-firstcol">Percentage</td>
                        <td className="mat-table-secondcol">:</td>
                        <td className="mat-table-thirdcol">
                          {currentMaterial.sellingPercentage}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mat-box">
                  <table className="mat-table">
                    <thead></thead>

                    <tbody>
                      <tr>Notes:</tr>
                      <tr>{currentMaterial.notes}</tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div
            className={
              view === "mat-view" ? "customers-container" : "material-container"
            }
          >
            {view == "mat-view" ? (
              <MaterialPaginatedItems
                itemsPerPage={itemsPerPage}
                items={data}
                setData={setOriginalData}
                setItemsPerPage={setItemsPerPage}
                setView={setView}
                setCurrentMaterial={setCurrentMaterial}
                currentMaterial={currentMaterial}
                setRightContent={setRightContent}
                setToken={setToken}
                deleteMaterial={deleteMaterial}
                setDeleteMaterial={setDeleteMaterial}
                handleDeleteMaterial={handleDeleteMaterial}
              />
            ) : (
              <VendorPaginatedItems
                itemsPerPage={itemsPerPage}
                items={currentMaterial.vendor}
                setData={setOriginalData}
                setItemsPerPage={setItemsPerPage}
                setView={setView}
                setCurrentVendor={setCurrentVendor}
                currentVendor={currentVendor}
                deleteVendor={deleteVendor}
                setdeleteVendor={setdeleteVendor}
                setRightContent={setRightContent}
                setToken={setToken}
              />
            )}
          </div>
        </div>
      </div>
      <div className="main-right-div">
        {rightContent !== "Details" && (
          <>
            {(rightContent === "Create" ||
              rightContent === "Category info" ||
              rightContent === "Unit info") && (
              <>
                <div className="right-div-header">
                  <span className="right-header-title">
                    {rightContent === "Category info" ||
                    rightContent === "Unit info"
                      ? "Product info"
                      : rightContent}
                  </span>
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
                      rightContent === "Category info"
                        ? "right-mat-sub-header-2 clicked"
                        : "right-mat-sub-header-2"
                    }
                    onClick={() => setRightContent("Category info")}
                  >
                    Category
                  </span>
                  <span
                    className={
                      rightContent === "Unit info"
                        ? "right-mat-sub-header-3 clicked"
                        : "right-mat-sub-header-3"
                    }
                    onClick={() => setRightContent("Unit info")}
                  >
                    Unit Type
                  </span>
                </div>
              </>
            )}

            {rightContent === "Edit" && (
              <div className="right-div-header">
                <span className="right-header-title">Edit</span>
                <span className={"right-mat-sub-header-1 clicked"}>
                  Products
                </span>
              </div>
            )}

            {rightContent === "VendorAdd" && (
              <div className="right-div-header">
                <span className="right-header-title">Add Vendor</span>
                <span className={"right-mat-sub-header-1 clicked"}>Vendor</span>
              </div>
            )}

            {rightContent === "VendorEdit" && (
              <div className="right-div-header">
                <span className="right-header-title">Edit Vendor</span>
                <span className={"right-mat-sub-header-1 clicked"}>Vendor</span>
              </div>
            )}

            <div className="right-div-content">
              <CreateMaterial
                rightContent={rightContent}
                setData={setOriginalData}
                catData={catData}
                unitData={unitData}
                setToken={setToken}
                setRightContent={setRightContent}
                setCurrentMaterial={setCurrentMaterial}
              />
              <MaterialCategory
                rightContent={rightContent}
                catData={catData}
                setCatdata={setCatdata}
                setToken={setToken}
              />
              <MaterialUnit
                rightContent={rightContent}
                unitData={unitData}
                setUnitdata={setUnitdata}
                setToken={setToken}
              />

              <EditMaterial
                rightContent={rightContent}
                editdata={currentMaterial}
                setData={setOriginalData}
                catData={catData}
                unitData={unitData}
                setToken={setToken}
                setRightContent={setRightContent}
              />

              <VendorAdd
                rightContent={rightContent}
                setData={setOriginalData}
                setToken={setToken}
                currentMaterial={currentMaterial}
                setRightContent={setRightContent}
              />

              <Editvendor
                rightContent={rightContent}
                setData={setOriginalData}
                setToken={setToken}
                currentVendor={currentVendor}
                setRightContent={setRightContent}
              />
            </div>
          </>
        )}
        {rightContent === "Details" && (
          <MaterialDetails
            currentMaterial={currentMaterial}
            setData={setOriginalData}
            setToken={setToken}
            rightContent={rightContent}
          />
        )}
      </div>
    </div>
  );
};

export default MaterialHome;
