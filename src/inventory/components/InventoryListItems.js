import axios from "axios";
import { useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import discussion from "../assets/discussion.png";
import discussion0 from "../assets/discussion0.png";
import { getConfirmation } from "../../common/DialogBox";
const InventoryListItems = ({
  setToken,
  setData,
  setRightContent,
  triggerEvent,
  setTriggerEvent,
  currentItems,
  setView,
  setCurrentInventory,
  deleteTriggerInv,
  setDeleteTriggerInv,
  handleDeleteInventory,
}) => {
  const [sort, setSort] = useState("");
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  useEffect(() => {
    if (currentItems == null) return;
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.invID).checked = false;
    });
  }, [currentItems]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.invID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.invID).checked = e.target.checked;
    });
  };

  const handleCustomerClick = (e, cust) => {
    let className = e.target.className;
    if (className === "chk-box-container-td" || className === "chkbx") return;
    if (className === "discussion_image") {
      setRightContent("Discussions");
      setCurrentInventory(cust);
      return;
    }
    setView("vendor-view");
    setCurrentInventory(cust);
    setRightContent("Product Summary");
  };

  useEffect(async () => {
    if (deleteTriggerInv) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.invID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Inventory using Checkbox");
        setDeleteTriggerInv(false);
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.invID)[0]
            : checkedItem.map((cust) => cust.invID).join();
        handleDeleteInventory(IDs);
        setDeleteTriggerInv(false);
      }
    }
  }, [deleteTriggerInv]);

  useEffect(async () => {
    if (triggerEvent && currentItems) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.invID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Inventory using Checkbox");
        setTriggerEvent();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.invID)[0]
            : checkedItem.map((cust) => cust.invID).join();
        if (triggerEvent === "edit") {
          if (checkedItem.length > 1) {
            toast.error("Please Select Only one Item");
            setTriggerEvent();
          } else {
            setCurrentInventory(
              currentItems.filter(
                (item) => document.getElementById(item.invID).checked
              )[0]
            );
            setRightContent("Edit");
          }
          document.body.click();
        } else if (
          triggerEvent === "stock" ||
          triggerEvent === "storage" ||
          triggerEvent === "others"
        ) {
          document.body.click();
          await getConfirmation("You want to Move Inventory(s)?", () => {
            axios
              .post(
                process.env.REACT_APP_API_ENDPOINT + "/inventory/update-menu",
                { IDs: IDs, menu: triggerEvent },
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
                setData((prev) => {
                  let updatedData = prev.filter((cust) => {
                    if (
                      IDs.toString().split(",").includes(cust.invID.toString())
                    ) {
                      cust.menu = triggerEvent;
                    }
                    return cust;
                  });
                  return updatedData;
                });
                toast.success("Inventory(s) Moved Successfully");
              })
              .catch((err) => {
                console.log(err);
                toast.error("Inventory(s) movement failed");
              });
          });
        }
        setTriggerEvent();
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
                <th width="30.1%">Ref & Item Name</th>
                <th width="14.4%">Qty in Stock</th>
                <th width="14.9%">Unit Type</th>
                <th
                  width="14.2%"
                  style={{ textAlign: "right", paddingRight: "2vw" }}
                >
                  Total Value
                </th>
                <th width="13.2%">Last Update</th>
                <th width="10.1%">Created</th>
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
                          name={cust.invID}
                          id={cust.invID}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td idth="30.1%" className="ref-subject-container">
                        <p>
                          {cust.refText}
                          {cust.refNum}
                        </p>
                        <p className="list-subject">{cust.itemName}</p>
                        <p>{cust.custName}</p>
                      </td>
                      <td width="14.4%">{cust.iqty || 0}</td>
                      <td width="14.9%">{cust.unitType}</td>
                      <td
                        width="14.2%"
                        align="right"
                        style={{ paddingRight: "2.2vw" }}
                      >
                        {(cust.itotal || 0).toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td width="13.2%">
                        {moment(cust.ilastUpdated).format(
                          currentUser.dateFormat
                        )}
                      </td>
                      <td width="10.1%">
                        <span style={{ marginRight: "0.3vw" }}></span>
                        <Avatar
                          size="1.75vw"
                          title={cust.updatedBy}
                          round="50%"
                          textSizeRatio={3}
                          textMarginRatio={0.15}
                          name={cust.updatedBy}
                        />
                        {
                          <span>
                            <img
                              className="discussion_image"
                              src={cust.dcount > 0 ? discussion : discussion0}
                            ></img>
                          </span>
                        }
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

export default InventoryListItems;
