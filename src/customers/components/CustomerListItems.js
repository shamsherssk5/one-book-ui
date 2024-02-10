import axios from "axios";
import { useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import { Country } from "country-state-city";
import moment from "moment-timezone";
const CustomerListItems = ({
  setToken,
  setRightContent,
  deleteTrigger,
  setDeleteTrigger,
  handleDeleteSelected,
  currentItems,
  addToMenu,
  setAddToMenu,
  setNoteClicked,
  updateData,
  setSelectedSubMenu,
  setHomeView,
  setCurrentCustomer,
  addNote,
}) => {
  const [sort, setSort] = useState("");
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  useEffect(() => {
    if (currentItems == null) return;
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.custID).checked = false;
    });
  }, [currentItems]);

  useEffect(() => {
    if (addNote) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.custID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select Customer Using Checkbox");
      } else if (checkedItem.length > 1) {
        toast.error("Please Select Only one Customer");
      } else {
        setHomeView("customerDetail");
        setRightContent("Company Info");
        setCurrentCustomer(checkedItem[0]);
        setSelectedSubMenu("Notes");
      }
      setNoteClicked();
    }
  }, [addNote]);

  useEffect(async () => {
    if (addToMenu) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.custID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Customer Using Checkbox");
        setAddToMenu();
      } else {
        let data = {
          custIDs:
            checkedItem.length === 1
              ? checkedItem.map((cust) => cust.custID)[0]
              : checkedItem.map((cust) => cust.custID).join(),
          category: addToMenu,
        };
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT +
              "/customers/update-customer-category",
            data,
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
            updateData((prev) => {
              let updatedData = prev.filter((cust) => {
                if (checkedItem.includes(cust)) {
                  cust.category = addToMenu;
                }
                return cust;
              });
              return updatedData;
            });
            setAddToMenu();
            toast.success("Customers Moved Successfully");
          })
          .catch((err) => {
            console.log(err);
            toast.error("Customers movement failed");
            setAddToMenu();
          });
      }
    }
  }, [addToMenu]);

  useEffect(() => {
    if (deleteTrigger) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.custID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Customer Using Checkbox");
        setDeleteTrigger();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.custID)[0]
            : checkedItem.map((cust) => cust.custID).join();
        handleDeleteSelected(IDs);
        setDeleteTrigger();
      }
    }
  }, [deleteTrigger]);

  useEffect(() => {
    //sortData(sort);
  }, [sort]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.custID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.custID).checked = e.target.checked;
    });
  };

  const handleCustomerClick = (e, cust) => {
    let className = e.target.className;
    if (className === "chk-box-container-td" || className === "chkbx") return;
    setHomeView("customerDetail");
    setRightContent("Company Info");
    setCurrentCustomer(cust);
  };

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
                <th width="30.1%">Customer Number & Name</th>
                <th width="11.4%">Business Type </th>
                <th width="15.9%">Email Accounts</th>
                <th width="10.2%">They owe you</th>
                <th width="11.2%">Create Date</th>
                <th width="18.1%">Client Manager</th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems.map((cust, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container"
                      onClick={(e) => handleCustomerClick(e, cust)}
                    >
                      <td width="3.1%" className="chk-box-container-td">
                        <input
                          className="chkbx"
                          name={cust.custID}
                          id={cust.custID}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td idth="30.1%" className="ref-subject-container">
                        <p>
                          {cust.refText}
                          {cust.refNum}
                        </p>
                        <p className="list-subject">{cust.custName}</p>
                        <p>
                          {(Country.getCountryByCode(cust.country) || {}).name}
                        </p>
                      </td>
                      <td width="11.4%">{cust.businessType}</td>
                      <td width="15.9%">{cust.emailAccounts}</td>
                      <td width="10.2%">{cust.amount}</td>
                      <td width="11.2%">
                        {moment(cust.created_date).format(
                          currentUser.dateFormat
                        )}
                      </td>
                      <td width="18.1%">
                        {cust.managers &&
                          cust.managers.length > 0 &&
                          cust.managers.split(",").map((d) => (
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
                          ))}
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

export default CustomerListItems;
