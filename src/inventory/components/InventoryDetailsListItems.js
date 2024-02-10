import axios from "axios";
import React, { useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import { Country } from "country-state-city";
import moment from "moment-timezone";
import discussion from "../assets/discussion.png";
import { getConfirmation } from "../../common/DialogBox";

const InventoryDetailsListItems = ({
  setToken,
  setData,
  setRightContent,
  currentItems,
  setView,
  setCurrentVendor,
  editTrigger,
  setEditTrigger,
  deleteTrigger,
  setDeleteTrigger,
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
  };

  useEffect(() => {
    if (editTrigger) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.id).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select Item Using Checkbox");
        setEditTrigger();
        document.body.click();
      } else if (checkedItem.length > 1) {
        toast.error("Please Select Only one item Using Checkbox");
        setEditTrigger();
        document.body.click();
      } else {
        setCurrentVendor(
          currentItems.filter(
            (item) => document.getElementById(item.id).checked
          )[0]
        );
      }
    }
  }, [editTrigger]);

  useEffect(async () => {
    if (deleteTrigger) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.id).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Item Using Checkbox");
        setDeleteTrigger();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.id)[0]
            : checkedItem.map((cust) => cust.id).join();
        document.body.click();
        await getConfirmation("You want to delete Item(s)?", () => {
          axios
            .post(
              process.env.REACT_APP_API_ENDPOINT +
                "/inventory/delete-inv-movement",
              {
                IDs: IDs,
                username: currentUser.username,
                timeZone: currentUser.timeZone,
                invID: checkedItem[0].invID,
              },
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
                  if (cust.invID === checkedItem[0].invID) {
                    let updVendors = cust.vendor.filter(
                      (v) =>
                        !IDs.toString().split(",").includes(v.id.toString())
                    );
                    cust.vendor = updVendors;
                    cust.iqty = updVendors
                      .map((v) =>
                        v.moveType === "Received"
                          ? parseInt(v.qty)
                          : -parseInt(v.qty)
                      )
                      .reduce((a, b) => a + b, 0);
                    cust.itotal = updVendors
                      .map((v) =>
                        v.moveType === "Received"
                          ? parseInt(v.total)
                          : -parseInt(v.total)
                      )
                      .reduce((a, b) => a + b, 0);
                    cust.ilastUpdated = new Date(
                      new Date().toLocaleString("en-US", {
                        timeZone: currentUser.timeZone,
                      })
                    ).toLocaleString();
                    cust.history.unshift({
                      moduleID: checkedItem[0].invID,
                      action: "Deleted Item(s)",
                      description: "#" + IDs,
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
              toast.success("Item(s) deleted Successfully");
            })
            .catch((err) => {
              console.log(err);
              toast.error("Item(s) deletion failed");
            });
        });
        setDeleteTrigger(false);
      }
    }
  }, [deleteTrigger]);

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
                <th width="10.1%">Move Type</th>
                <th width="14.5%">From</th>
                <th width="15.4%">Location(To)</th>
                <th width="16.5%">Reference</th>
                <th width="10.1%">
                  Qty <span style={{ color: "#44B764" }}> IN</span> &{" "}
                  <span style={{ color: "#F94444" }}>OUT</span>
                </th>
                <th width="10.1%">Cost</th>
                <th width="10.1%">Date Created</th>
                <th width="10.1%">created By</th>
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
                          name={cust.id}
                          id={cust.id}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td idth="10.1%" className="ref-subject-container">
                        <p>{cust.moveType}</p>
                        <p className="list-subject">{cust.moveFromTo}</p>
                      </td>
                      <td width="14.5%">{cust.vendorName}</td>
                      <td
                        width="15.4%"
                        style={
                          cust.location.startsWith("<span")
                            ? { color: "#2687D7" }
                            : {}
                        }
                        dangerouslySetInnerHTML={{
                          __html: `${cust.location} ${
                            cust.rackNo && `/ ${cust.rackNo}`
                          }`,
                        }}
                      ></td>
                      <td width="16.5%">{cust.notes}</td>
                      <td
                        width="10.1%"
                        style={{
                          color:
                            cust.moveType === "Received"
                              ? "#44B764"
                              : "#F94444",
                        }}
                      >
                        {cust.qty}
                      </td>
                      <td
                        width="10.1%"
                        style={{
                          color:
                            cust.moveType === "Received"
                              ? "#44B764"
                              : "#F94444",
                        }}
                      >
                        {cust.moveType === "Received"
                          ? (cust.total || 0).toLocaleString(
                              navigator.language,
                              { minimumFractionDigits: 2 }
                            )
                          : `-${(cust.total || 0).toLocaleString(
                              navigator.language,
                              { minimumFractionDigits: 2 }
                            )}`}
                      </td>
                      <td width="10.1%">
                        {moment(cust.lastUpdate).format(currentUser.dateFormat)}
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
export default InventoryDetailsListItems;
