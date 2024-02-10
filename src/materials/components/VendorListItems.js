import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import notesicon from "../../materials/images/material_notes.png";
import notesdsp from "../../materials/images/display_notes.png";
import Avatar from "react-avatar";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import axios from "axios";
import NoteAdder from "./NoteAdder";

const VendorListItems = ({
  currentItems,
  setData,
  deleteVendor,
  setdeleteVendor,
  setCurrentVendor,
  currentVendor,
  setRightContent,
  setToken,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
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
    console.log("called");
    currentItems.forEach((element) => {
      document.getElementById(element.id).checked = e.target.checked;
    });
  };

  useEffect(async () => {
    if (deleteVendor) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.id).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Vendor Using Checkbox");
        setdeleteVendor(false);
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.id)[0]
            : checkedItem.map((cust) => cust.id).join();
        let vendors =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.vendorName)[0]
            : checkedItem.map((cust) => cust.vendorName).join();
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/pnm/delete-vendors",
            {
              IDs: IDs,
              vendors: vendors,
              username: currentUser.username,
              timeZone: currentUser.timeZone,
              prodID: currentVendor.prodID,
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
                if (cust.prodID === currentVendor.prodID) {
                  let updVendors = cust.vendor.filter(
                    (v) => !IDs.toString().split(",").includes(v.id.toString())
                  );
                  cust.vendor = updVendors;
                  cust.history.unshift({
                    moduleID: currentVendor.prodID,
                    action: "Deleted Vendor(s)",
                    description: vendors,
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
            toast.success("Vendor(s) deleted Successfully");
            document.body.click();
          })
          .catch((err) => {
            console.log(err);
            toast.error("Vendor(s) deletion failed");
          });

        setdeleteVendor(false);
      }
    }
  }, [deleteVendor]);

  return (
    <div className="list-container-box">
      {currentItems != null && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <table className="list-view-table">
            <thead className="thead-class">
              <tr className="list-view-header-row" align="center">
                <th width="3.2%">
                  <input
                    id="all"
                    className="chkbx"
                    name="all"
                    type="checkbox"
                    onChange={handleCheckAll}
                  />
                </th>
                <th width="25.8%">Vendor Name</th>
                <th width="25.8%">Vendor Product Ref Code</th>
                <th width="14%">Vendor Price</th>
                <th width="14%">Last Update</th>
                <th width="14%">Updated By</th>
                <th width="3.2%"></th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems
                .filter((p) => p.vendorCode && p.vendorName)
                .map((prod, index) => {
                  return (
                    <>
                      <tr
                        key={index}
                        className="task-list-row-container"
                        onClick={(e) => {
                          let className = e.target.className;
                          if (
                            className === "chk-box-container-td" ||
                            className === "chkbx"
                          )
                            return;
                          setCurrentVendor(prod);
                          setRightContent("Details");
                        }}
                        align="center"
                        style={{
                          backgroundColor:
                            prod.id === currentVendor.id ? "#E5F1FA" : "",
                        }}
                      >
                        <td width="3.2%" className="chk-box-container-td">
                          <input
                            className="chkbx"
                            name={prod.id}
                            id={prod.id}
                            type="checkbox"
                            onChange={handleOnchange}
                          />
                        </td>
                        <td width="25.8%">{prod.vendorName}</td>
                        <td width="25.8%"> {prod.vendorCode}</td>
                        <td width="14%">{prod.vendorPrice}</td>
                        <td width="14%">
                          {moment(prod.lastUpdate).format(
                            currentUser.dateFormat
                          )}
                        </td>
                        <td width="14%">
                          <Avatar
                            size="1.75vw"
                            title={prod.updatedBy}
                            round="50%"
                            textSizeRatio={3}
                            textMarginRatio={0.15}
                            name={prod.updatedBy}
                            color="#C4C4C4"
                          />
                        </td>
                        <td width="3.2%">
                          {!prod.notes ? (
                            <NoteAdder
                              type="vendor"
                              id={prod.id}
                              setData={setData}
                              prodID={prod.prodID}
                              notes={prod.notes}
                              Trigger_Button={
                                <img
                                  src={notesicon}
                                  className="mat-notes-img-display"
                                />
                              }
                            />
                          ) : (
                            <OverlayTrigger
                              placement="left"
                              trigger="click"
                              rootClose={true}
                              overlay={
                                <Popover className="Popup-vendornotes">
                                  <Popover.Body>
                                    <div className="Popup-data">
                                      {prod.notes}
                                    </div>
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <img
                                src={notesdsp}
                                className="mat-notes-img-display"
                                style={{
                                  backgroundColor:
                                    prod.id === currentVendor.id
                                      ? "#E5F1FA"
                                      : "",
                                }}
                                variant="success"
                              ></img>
                            </OverlayTrigger>
                          )}
                        </td>
                      </tr>
                      <tr className="empty-row-container">
                        <td width="100%" className="border-td" colSpan="7">
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

export default VendorListItems;
