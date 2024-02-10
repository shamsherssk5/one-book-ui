import { useContext, useEffect, useState } from "react";
import Colors from "../../tasks/components/helpers/Colors";
import Subject_Sort from "../../tasks/assets/subject-sort.png";
import Sort from "../../tasks/assets/sort.png";
import Style from "../../tasks/css/task.module.css";
import Dots from "../../tasks/assets/vertical-dots.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";
import notesicon from "../../materials/images/material_notes.png";
import notesdsp from "../../materials/images/display_notes.png";
import Avatar from "react-avatar";
import moment from "moment-timezone";
import NoteAdder from "./NoteAdder";
const MaterialListItems = ({
  currentItems,
  setData,
  setView,
  setCurrentMaterial,
  currentMaterial,
  setRightContent,
  deleteMaterial,
  setDeleteMaterial,
  handleDeleteMaterial,
}) => {
  const [sort, setSort] = useState("");
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  const handleForward = (task) => {
    document.body.click();
  };

  useEffect(() => {}, [sort]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.prodID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.prodID).checked = e.target.checked;
    });
  };

  useEffect(async () => {
    if (deleteMaterial) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.prodID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Material using Checkbox");
        setDeleteMaterial(false);
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.prodID)[0]
            : checkedItem.map((cust) => cust.prodID).join();
        handleDeleteMaterial(IDs);
        setDeleteMaterial(false);
      }
    }
  }, [deleteMaterial]);

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
                <th width="6.05%">Short Key</th>
                <th width="26.05%">PM#, Item Name, ShotKey</th>
                <th width="10.3%">Cost</th>
                <th width="8.4%">Unit Type</th>
                <th width="10.4%">Margin % /Fixed </th>
                <th width="14.1%">Selling Price</th>
                <th width="10.6%">Last Update</th>
                <th width="7%">Updated By</th>
                <th width="4%"></th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems.map((prod, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container"
                      onClick={(e) => {
                        let className = e.target.className;
                        if (
                          className === "chk-box-container-td" ||
                          className === "chkbx" ||
                          className === "mat-notes-img-display"
                        )
                          return;
                        setView("vendor-view");
                        setCurrentMaterial(prod);
                        setRightContent("Details");
                      }}
                      style={{
                        backgroundColor:
                          prod.prodID === currentMaterial.prodID
                            ? "#E5F1FA"
                            : "",
                      }}
                    >
                      <td width="3.1%">
                        <input
                          className="chkbx"
                          name={prod.prodID}
                          id={prod.prodID}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td width="6.05%">{prod.shotKey}</td>
                      <td width="26.05%" className="ref-subject-container">
                        <p>
                          {prod.refText}
                          {prod.refNum}
                        </p>
                        <p className="list-subject">{prod.itemName}</p>
                        <p className="list-subject">{prod.itemDesc}</p>
                      </td>
                      <td width="10.3%">{prod.unitPrice}</td>
                      <td width="8.4%">{prod.unitType}</td>

                      {prod.marginType === "percentage" && (
                        <td width="10.4%">
                          {prod.sellingPercentage.toString().concat("%")}
                        </td>
                      )}
                      {(prod.marginType === "fixed" ||
                        prod.marginType === "others") && (
                        <td width="10.4%">{prod.marginType}</td>
                      )}
                      <td width="14.1%">
                        {prod.marginType === "percentage"
                          ? (prod.unitPrice * (100 + prod.sellingPercentage)) /
                            100
                          : prod.marginType === "fixed"
                          ? prod.fixedSellingPrice
                          : ""}
                      </td>
                      <td width="10.6%">
                        {moment(prod.lastUpdate).format(currentUser.dateFormat)}
                      </td>
                      <td width="7%" align="center">
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
                      <td width="4%">
                        {!prod.notes ? (
                          <NoteAdder
                            type="mat"
                            id={prod.prodID}
                            setData={setData}
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
                                  <div className="Popup-data">{prod.notes}</div>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <img
                              src={notesdsp}
                              className="mat-notes-img-display"
                              style={{
                                backgroundColor:
                                  prod.prodID === currentMaterial.prodID
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
                      <td width="100%" className="border-td" colSpan="10">
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

export default MaterialListItems;
