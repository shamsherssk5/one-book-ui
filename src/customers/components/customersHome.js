import React, { useEffect, useState } from "react";
import G_plus from "../../assets/images/g_plus.png";
import Gr_Sr from "../../assets/images/gr_sr.png";
import Filter from "../../tasks/assets/filter.png";
import UnFilter from "../../tasks/assets/unfilter.png";
import "../styles/customerHome.css";
import CustomerPaginatedItems from "./customerPaginatedItems";
import BusinessTypes from "./BusinessTypes";
import CreateCustomer from "./CreateCustomer";
import CreateContact from "./CreateContact";
import Back_Button from "../../assets/images/back-button.png";
import Blocked_Image from "../../assets/images/blocked-image.png";
import CompnayInfo from "../../assets/images/componyInfo.png";
import Notes from "./Notes";
import Reminders from "./Reminders";
import CustomerDetails from "./CustomerDetails";
import axios from "axios";
import { OverlayTrigger, Popover } from "react-bootstrap";
import toast from "react-hot-toast";
import EditCustomer from "./EditCustomer";
const CustomersHome = ({ setToken, loading }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [rightContent, setRightContent] = useState("Business Types");
  const [menuButton, setMenuButton] = useState("all");
  const [slectedSubMenu, setSelectedSubMenu] = useState("Summary");
  const [homeView, setHomeView] = useState("customersList");
  const [currentCustomer, setCurrentCustomer] = useState();
  const [originalData, setOriginalData] = useState();
  const [contacts, setContacts] = useState([]);
  const [addNote, setNoteClicked] = useState();
  const [addToMenu, setAddToMenu] = useState();
  const [industryType, setindustryType] = useState([]);
  const [deleteTrigger, setDeleteTrigger] = useState();
  let [data, setData] = useState([]);
  const handleBack = () => {
    setHomeView("customersList");
    setRightContent("Business Types");
    setCurrentCustomer();
  };

  const handleAddToCudstomer = async () => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/customers/add-to-supplier?timeZone=" +
          currentUser.timeZone,
        {
          orgID: currentUser.orgID,
          custID: currentCustomer.custID,
          assignee: currentUser.username,
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        toast.success("Customer added to Supplier List");
        document.body.click();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Addition to Supplier Failed");
      });
  };

  useEffect(() => {
    if (originalData && originalData.length > 0)
      setData(
        originalData.filter(
          (d) => d.category === menuButton || menuButton === "all"
        )
      );
    else setData([]);
  }, [menuButton, originalData]);

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Customers..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/customers/customers-list?orgID=" +
          currentUser.orgID,
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
  }, []);

  const handleSearchChange = (e) => {
    setOriginalData((prev) => {
      let updatedPhoneBook = prev.filter((p) =>
        p.custName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      return updatedPhoneBook;
    });
  };
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete")
      setOriginalData(actualData);
  };

  const handleAddToMenu = async (menu) => {
    let d = {
      custIDs: currentCustomer.custID,
      category: menu,
    };
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/customers/update-customer-category",
        d,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setOriginalData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.custID === currentCustomer.custID) {
              cust.category = menu;
            }
            return cust;
          });
          return updatedData;
        });
        toast.success("Customer Moved Successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Customer movement failed");
      });
  };

  const handleDeleteSelected = async (IDs) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/customers/delete-customer",
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
              !IDs.toString().split(",").includes(cust.custID.toString())
          );
          return updatedData;
        });
        toast.success("Customers(s) deleted Successfully");
        document.body.click();
        setHomeView("customersList");
        setRightContent("Business Types");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Customer(s) deletion failed");
      });
  };

  const [usersList, setUsersList] = useState([]);
  useEffect(async () => {
    if (usersList.length > 0) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/users-sup-cust?orgID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setUsersList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const [filtered, setFiltered] = useState(false);
  const [actualData, setActualData] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  let [filterView, openFilterview] = useState(false);
  return (
    <div className="main-left-right-div-container">
      <div className="main-left-div">
        <div className="left-div-header customers">
          <img
            className="back-button-pic"
            src={Back_Button}
            onClick={handleBack}
            style={{
              display: homeView === "customerDetail" ? "block" : "none",
            }}
          />
          <span className="header-title-sub">SALES</span>
          <span className="header-title-main">Customers</span>
          <img
            className="g_plus customers"
            src={G_plus}
            onClick={() => setRightContent("Create")}
            style={{ display: homeView === "customersList" ? "block" : "none" }}
          />
          <OverlayTrigger
            placement="bottom-end"
            trigger="click"
            rootClose={true}
            overlay={
              <Popover>
                <div className="popup">
                  {homeView === "customersList" && (
                    <>
                      <p
                        onClick={() => {
                          document.body.click();
                          setRightContent("Create");
                        }}
                      >
                        {" "}
                        Add New
                      </p>
                      <p
                        onClick={() => {
                          document.body.click();
                          setNoteClicked(true);
                        }}
                      >
                        Add Note
                      </p>
                      <p
                        onClick={() => {
                          document.body.click();
                        }}
                      >
                        Merge Customers
                      </p>
                      <p
                        onClick={() => {
                          setAddToMenu(
                            menuButton === "blackListed"
                              ? "preferred"
                              : "blackListed"
                          );
                        }}
                      >
                        Add To{" "}
                        {menuButton === "blackListed"
                          ? "Preferred"
                          : "Black List"}
                      </p>
                      <p onClick={() => document.body.click()}> Import</p>
                      <p onClick={() => document.body.click()}> Exports</p>
                      <p
                        className="popup-danger"
                        onClick={() => {
                          setDeleteTrigger(true);
                        }}
                      >
                        {" "}
                        Delete
                      </p>
                    </>
                  )}
                  {homeView === "customerDetail" && (
                    <>
                      <p
                        onClick={() => {
                          document.body.click();
                          setRightContent("Edit Company Info");
                        }}
                      >
                        Edit Company Info
                      </p>
                      <p
                        onClick={() => {
                          handleAddToCudstomer();
                        }}
                      >
                        Copy to Supplier List
                      </p>
                      <p
                        onClick={() => {
                          handleAddToMenu(
                            currentCustomer.category === "blackListed"
                              ? "preferred"
                              : "blackListed"
                          );
                        }}
                      >
                        Add To{" "}
                        {currentCustomer.category === "blackListed"
                          ? "Preferred"
                          : "Black List"}
                      </p>
                      <p
                        className="popup-danger"
                        onClick={() => {
                          handleDeleteSelected(currentCustomer.custID);
                        }}
                      >
                        {" "}
                        Delete
                      </p>
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
        {homeView === "customersList" && (
          <div className="left-div-content customers">
            <div className="customers-button-container">
              <div className="customers-buttons">
                <div className="cust-head-empty" style={{ width: "6.7%" }} />
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
                  onClick={() => setMenuButton("preferred")}
                >
                  <div
                    className={
                      menuButton === "preferred"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">Preferred</span>
                  </div>
                  <div
                    className={
                      menuButton === "preferred"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    {originalData && (
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter((d) => d.category === "preferred")
                            .length
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="cust-blacklisted"
                  onClick={() => setMenuButton("blackListed")}
                >
                  <div
                    className={
                      menuButton === "blackListed"
                        ? "cust-preffered-text active"
                        : "cust-preffered-text"
                    }
                  >
                    <span className="cust-span-all but-text">Black Listed</span>
                  </div>
                  <div
                    className={
                      menuButton === "blackListed"
                        ? "cust-prefer-count active"
                        : "cust-prefer-count"
                    }
                  >
                    {originalData && (
                      <span className="cust-span-all but-count">
                        {
                          originalData.filter(
                            (d) => d.category === "blackListed"
                          ).length
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="customers-numbers-container">
              <span>
                {data.length} items, Amount owe you AED{" "}
                {data
                  .map((d) => parseInt(d.amount))
                  .reduce((a, b) => a + b, 0) || 0}{" "}
              </span>
              {!isSearchOpen && (
                <img
                  title="Search Contact"
                  className="left-gs-img customers search-button"
                  src={Gr_Sr}
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
                    placeholder="Enter Customer's Company Name"
                    className="search-button-text"
                    onChange={handleSearchChange}
                    onKeyDown={handKeyDown}
                  />
                  <small
                    title="close Search"
                    className="calendar-closee template"
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
            <div className="customers-container">
              <CustomerPaginatedItems
                setToken={setToken}
                deleteTrigger={deleteTrigger}
                setDeleteTrigger={setDeleteTrigger}
                handleDeleteSelected={handleDeleteSelected}
                setRightContent={setRightContent}
                itemsPerPage={itemsPerPage}
                items={data}
                updateData={setOriginalData}
                setItemsPerPage={setItemsPerPage}
                setHomeView={setHomeView}
                setCurrentCustomer={setCurrentCustomer}
                addNote={addNote}
                setNoteClicked={setNoteClicked}
                setSelectedSubMenu={setSelectedSubMenu}
                addToMenu={addToMenu}
                setAddToMenu={setAddToMenu}
              />
            </div>
          </div>
        )}
        {homeView === "customerDetail" && (
          <div className="left-div-content customers">
            <div className="customers-button-container">
              {currentCustomer.category === "blackListed" && (
                <img
                  className="back-button-pic"
                  src={Blocked_Image}
                  style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "1.38vw",
                  }}
                />
              )}
              <span className="customer-name-header">
                {currentCustomer.custName}
              </span>
            </div>
            <div
              className="customers-numbers-summar-container"
              style={{ borderBottom: "0.5px solid #239BCF" }}
            >
              <div className="customer-summary-menu-container">
                {[
                  "Summary",
                  "Estimations",
                  "Quotes",
                  "Projects",
                  "Invoices",
                  "Notes",
                  "Reminders",
                ].map((menu) => (
                  <a
                    class={
                      slectedSubMenu === menu
                        ? "customer-menu-link selected"
                        : "customer-menu-link"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSubMenu(menu);
                    }}
                  >
                    {menu}
                  </a>
                ))}
              </div>
            </div>
            <div className="customer-summary-container">
              <Notes
                setToken={setToken}
                slectedSubMenu={slectedSubMenu}
                data={currentCustomer.notes}
                setData={setOriginalData}
                currentCustomer={currentCustomer}
              />
              <Reminders
                setToken={setToken}
                slectedSubMenu={slectedSubMenu}
                data={currentCustomer.reminders}
                setData={setOriginalData}
                currentCustomer={currentCustomer}
                contacts={usersList}
              />
            </div>
          </div>
        )}
      </div>
      <div className="main-right-div">
        <div className="right-div-header">
          <span className="right-header-title">
            {rightContent === "CreateContact" ? "Create" : rightContent}
          </span>
          {rightContent === "Company Info" && (
            <img className="company-info" src={CompnayInfo} />
          )}
          {(rightContent === "Business Types" ||
            rightContent === "Create" ||
            rightContent === "CreateContact") && (
            <span
              className={
                rightContent === "Create" || rightContent === "Business Types"
                  ? "right-sub-header-1 clicked"
                  : "right-sub-header-1"
              }
              onClick={() => {
                if (rightContent === "Business Types") return;
                setRightContent("Create");
              }}
            >
              {rightContent === "Business Types" ? "Types" : "Company Info"}
            </span>
          )}
          {rightContent !== "Business Types" &&
            (rightContent === "Create" || rightContent === "CreateContact") && (
              <span
                className={
                  rightContent === "CreateContact"
                    ? "right-sub-header-2 clicked"
                    : "right-sub-header-2"
                }
                onClick={() => setRightContent("CreateContact")}
              >
                Contacts
              </span>
            )}
        </div>
        <div className="right-div-content">
          <BusinessTypes rightContent={rightContent} data={data} />
          <CreateCustomer
            setRightContent={setRightContent}
            industryType={industryType}
            setindustryType={setindustryType}
            TypesetToken={setToken}
            rightContent={rightContent}
            contacts={contacts}
            setData={setOriginalData}
            usersList={usersList}
          />
          <CreateContact
            setToken={setToken}
            rightContent={rightContent}
            contacts={contacts}
            setContacts={setContacts}
            currentCustomer={currentCustomer}
          />
          <CustomerDetails
            rightContent={rightContent}
            currentCustomer={currentCustomer}
            setData={setOriginalData}
            contacts={contacts}
            setContacts={setContacts}
          />
          <EditCustomer
            setRightContent={setRightContent}
            industryType={industryType}
            setToken={setToken}
            contacts={contacts}
            rightContent={rightContent}
            currentCustomer={currentCustomer}
            setData={setOriginalData}
            usersList={usersList}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomersHome;
