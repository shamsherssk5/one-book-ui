import React, { useEffect, useState } from "react";
// import Data from "../phonedata.json";
import G_plus from "../../assets/images/g_plus.png";
import Gr_Sr from "../../assets/images/gr_sr.png";
import PhonebookPaginatedItems from "./PhonebookPaginatedItems";
import "../styles/phonebookHome.css";
import CreateContact from "./CreateContact";
import PhoneBookDetails from "./PhonebookDetails";
import { OverlayTrigger, Popover } from "react-bootstrap";
import EditContact from "./EditContact";
import axios from "axios";

const PhonebookHome = ({ setToken, loading }) => {
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [rightContent, setRightContent] = useState("Details");
  const [menuButton, setMenuButton] = useState("all");
  const [originalData, setOriginalData] = useState([]);
  const handleSearchChange = (e) => {
    setOriginalData((prev) => {
      let updatedPhoneBook = prev.filter(
        (p) =>
          p.contactPerson
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          p.companyName.toLowerCase().includes(e.target.value.toLowerCase()) ||
          p.keyWords.toLowerCase().includes(e.target.value.toLowerCase())
      );
      return updatedPhoneBook;
    });
  };
  const handKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete")
      setOriginalData(actualData);
  };
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [selectData, setSelectData] = useState();
  const [actualData, setActualData] = useState([]);
  const [isSearchOpen, searchOpen] = useState(false);
  const [moveToPreferred, setMoveToPreferred] = useState();
  const [addToSupplier, setAddToSupplier] = useState();
  const [deleteTrigger, setDeleteTrigger] = useState();
  let [data, setData] = useState([]);
  useEffect(() => {
    if (originalData && originalData.length > 0) {
      setData(
        originalData.filter(
          (i) => i.category === menuButton || menuButton === "all"
        )
      );
    } else {
      setData([]);
    }
  }, [menuButton, originalData]);

  useEffect(async () => {
    if (originalData.length > 0) return;
    loading({ visibility: true, message: "Loading Contacts..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/phoneBook/getContacts?orgID=" +
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
  }, []);

  return (
    <div className="main-left-right-div-container myscrollbar">
      <div className="main-left-div">
        <div className="left-div-header customers">
          <span className="header-title-sub">OTHERS</span>
          <span className="header-title-main">Phone Book</span>
          <img
            className="g_plus customers"
            src={G_plus}
            onClick={() => setRightContent("Create")}
          />
          <OverlayTrigger
            placement="bottom-end"
            trigger="click"
            rootClose={true}
            overlay={
              <Popover>
                <div className="popup">
                  <p onClick={() => setRightContent("Create")}>
                    Create Contact
                  </p>
                  <p
                    onClick={() => {
                      setRightContent("Edit");
                      document.body.click();
                    }}
                  >
                    Edit Selected
                  </p>
                  <p onClick={() => setAddToSupplier(true)}>
                    Add to Supplier List
                  </p>
                  <p
                    onClick={() =>
                      setMoveToPreferred(
                        menuButton == "preferred"
                          ? "Non preferred"
                          : "preferred"
                      )
                    }
                  >
                    {menuButton == "preferred"
                      ? "Move to Non Preferred"
                      : "Move to Preferred"}
                  </p>
                  <p> Export</p>
                  <p> Import</p>
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
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) => d.category === "preferred")
                        .length
                    }
                  </span>
                </div>
              </div>
              <div
                className="cust-blacklisted"
                onClick={() => setMenuButton("Non preferred")}
              >
                <div
                  className={
                    menuButton === "Non preferred"
                      ? "cust-preffered-text active"
                      : "cust-preffered-text"
                  }
                >
                  <span className="cust-span-all but-text">Non Preferred</span>
                </div>
                <div
                  className={
                    menuButton === "Non preferred"
                      ? "cust-prefer-count active"
                      : "cust-prefer-count"
                  }
                >
                  <span className="cust-span-all but-count">
                    {
                      originalData.filter((d) => d.category === "Non preferred")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="customers-numbers-container">
            <span> {data.length} Contacts </span>
            {!isSearchOpen && (
              <img
                title="Search Contact"
                className="left-gs-img customers search-button phonebook-search"
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
                  placeholder="Enter Company/Person/Keywords"
                  className="search-button-text phonebook-search"
                  onChange={handleSearchChange}
                  onKeyDown={handKeyDown}
                />
                <small
                  title="close Search"
                  className="calendar-closee template phonebook-search"
                  onClick={() => {
                    searchOpen(false);
                    setOriginalData(actualData);
                  }}
                >
                  &#10006;
                </small>
              </>
            )}
          </div>
          <div className="customers-container">
            <PhonebookPaginatedItems
              itemsPerPage={itemsPerPage}
              items={data}
              setData={setOriginalData}
              setItemsPerPage={setItemsPerPage}
              setSelectData={setSelectData}
              selectData={selectData}
              setRightContent={setRightContent}
              moveToPreferred={moveToPreferred}
              setMoveToPreferred={setMoveToPreferred}
              addToSupplier={addToSupplier}
              setAddToSupplier={setAddToSupplier}
              setToken={setToken}
              deleteTrigger={deleteTrigger}
              setDeleteTrigger={setDeleteTrigger}
            />
          </div>
        </div>
      </div>

      {/* Original right side panel */}
      <div className="main-right-div">
        <div className="right-div-header">
          <span className="right-header-title">{rightContent}</span>
          {rightContent === "Create" && (
            <span className={"right-sub-header-1 clicked"}>Contacts</span>
          )}
        </div>
        <div className="right-div-content">
          <CreateContact
            setToken={setToken}
            rightContent={rightContent}
            setData={setOriginalData}
            setRightContent={setRightContent}
            setSelectData={setSelectData}
          />
          <PhoneBookDetails
            rightContent={rightContent}
            selectData={selectData}
            setData={setOriginalData}
            setToken={setToken}
          />
          <EditContact
            rightContent={rightContent}
            selectData={selectData}
            setData={setOriginalData}
            setRightContent={setRightContent}
            setToken={setToken}
          />
        </div>
      </div>
    </div>
  );
};

export default PhonebookHome;
