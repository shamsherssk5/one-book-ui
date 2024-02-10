import axios from "axios";
import { useEffect, useState } from "react";
import Avatar from "react-avatar";
import Colors from "./EstimateColors";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import { getConfirmation } from "../../common/DialogBox";
import Subject_Sort from "../../tasks/assets/subject-sort.png";
import { parseFloatEst } from "../parseFloatEst";
const EstimationListItems = ({
  setToken,
  setRightContent,
  currentItems,
  updateData,
  setCurrentEstimate,
  setView,
  triggerEvent,
  setTriggerEvent,
  handleEvent,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  useEffect(() => {
    if (currentItems == null) return;
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.estID).checked = false;
    });
  }, [currentItems]);

  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.estID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.estID).checked = e.target.checked;
    });
  };

  const handleCustomerClick = (e, est) => {
    let className = e.target.className;
    if (className === "chk-box-container-td" || className === "chkbx") return;
    setView("est-details");
    setRightContent("Information");
    setCurrentEstimate(est);
    updateData((prev) => {
      let updateData = prev.filter((es) => {
        if (es.estID === est.estID) {
          es.opened =
            moment(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
        }
        return es;
      });
      return updateData;
    });
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/set-opened?timeZone=" +
          currentUser.timeZone,
        { id: est.estID },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        console.log("Set Opened Setting Success");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Estimation Recent Open failed");
      });
  };

  useEffect(async () => {
    if (triggerEvent && currentItems) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.estID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Estimation using Checkbox");
        setTriggerEvent();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.estID)[0]
            : checkedItem.map((cust) => cust.estID).join();
        if (triggerEvent === "delete") {
          await getConfirmation("You want to delete Estimation(s)?", () => {
            handleEvent(IDs, triggerEvent);
          });
        } else {
          handleEvent(IDs, triggerEvent);
        }
      }
    }
  }, [triggerEvent]);

  const [sort, setSort] = useState("created-desc");

  useEffect(() => {
    if (!sort) return;
    let statuses = [
      "Request",
      "Draft",
      "Awaiting Approval",
      "Approved",
      "Declined",
      "Sent",
    ];
    updateData((prev) => {
      let data = [...prev];

      switch (sort) {
        case "created-desc":
          data.sort(
            (a, b) =>
              new Date(b.created).valueOf() - new Date(a.created).valueOf()
          );
          break;
        case "created":
          data.sort(
            (a, b) =>
              new Date(a.created).valueOf() - new Date(b.created).valueOf()
          );
          break;
        case "status":
          data.sort(
            (a, b) => statuses.indexOf(b.status) - statuses.indexOf(a.status)
          );
          break;
        case "status-desc":
          data.sort(
            (a, b) => statuses.indexOf(a.status) - statuses.indexOf(b.status)
          );
          break;
        case "amount":
          data.sort(
            (a, b) => parseFloatEst(a.amount) - parseFloatEst(b.amount)
          );
          break;
        case "amount-desc":
          data.sort(
            (a, b) => parseFloatEst(b.amount) - parseFloatEst(a.amount)
          );
          break;
        case "ref":
          data.sort((a, b) => parseInt(a.refNum) - parseInt(b.refNum));
          break;
        case "ref-desc":
          data.sort((a, b) => parseInt(b.refNum) - parseInt(a.refNum));
          break;
        case "reference":
          data.sort((a, b) =>
            (a.reference || "a")
              .toLowerCase()
              .localeCompare((b.reference || "z").toLowerCase())
          );
          break;
        case "reference-desc":
          data.sort((a, b) =>
            (b.reference || "z")
              .toLowerCase()
              .localeCompare((a.reference || "a").toLowerCase())
          );
          break;

        default:
      }

      return data;
    });
  }, [sort]);

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
                <th
                  width="32.5%"
                  onClick={() =>
                    sort == "ref" ? setSort("ref-desc") : setSort("ref")
                  }
                >
                  Ref# , Project Name, Customer
                  {(sort == "ref" || sort == "ref-desc") && (
                    <img
                      title="sort"
                      className={sort == "ref" ? "sort sort-flip" : "sort"}
                      src={Subject_Sort}
                    />
                  )}
                </th>
                <th
                  width="17%"
                  onClick={() =>
                    sort == "reference"
                      ? setSort("reference-desc")
                      : setSort("reference")
                  }
                >
                  Reference
                  {(sort == "reference" || sort == "reference-desc") && (
                    <img
                      title="sort"
                      className={
                        sort == "reference" ? "sort sort-flip" : "sort"
                      }
                      src={Subject_Sort}
                    />
                  )}
                </th>
                <th
                  width="13.9%"
                  style={{ textAlign: "right", paddingRight: "3vw" }}
                  onClick={() =>
                    sort == "amount"
                      ? setSort("amount-desc")
                      : setSort("amount")
                  }
                >
                  Amount
                  {(sort == "amount" || sort == "amount-desc") && (
                    <img
                      title="sort"
                      className={sort == "amount" ? "sort sort-flip" : "sort"}
                      src={Subject_Sort}
                    />
                  )}
                </th>
                <th
                  width="15.2%"
                  onClick={() =>
                    sort == "status"
                      ? setSort("status-desc")
                      : setSort("status")
                  }
                >
                  Status
                  {(sort == "status" || sort == "status-desc") && (
                    <img
                      title="sort"
                      className={sort == "status" ? "sort sort-flip" : "sort"}
                      src={Subject_Sort}
                    />
                  )}
                </th>
                <th
                  width="9.2%"
                  onClick={() =>
                    sort == "created"
                      ? setSort("created-desc")
                      : setSort("created")
                  }
                >
                  Create Date
                  {(sort == "created" || sort == "created-desc") && (
                    <img
                      title="sort"
                      className={sort == "created" ? "sort sort-flip" : "sort"}
                      src={Subject_Sort}
                    />
                  )}
                </th>
                <th width="9.1%" style={{ textAlign: "center" }}>
                  Created By
                </th>
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
                      style={
                        !(cust.customer || "").trim().length ||
                        !((cust.amount || 0) > 0)
                          ? {
                              background: "rgba(215, 49, 38, 0.12)",
                            }
                          : {}
                      }
                    >
                      <td width="3.1%" className="chk-box-container-td">
                        <input
                          className="chkbx"
                          name={cust.estID}
                          id={cust.estID}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td width="32.5%" className="ref-subject-container">
                        <p>
                          {cust.refText}
                          {cust.refNum}
                        </p>
                        <p className="list-subject" title={cust.projName}>
                          <span
                            style={
                              cust.projName &&
                              cust.projName.includes("duplicated")
                                ? {
                                    color: "#f94444",
                                  }
                                : {}
                            }
                          >
                            {cust.projName}
                          </span>
                        </p>
                        <p title={cust.custome}>{cust.customer}</p>
                      </td>
                      <td width="17%" title={cust.reference}>
                        {cust.reference}
                      </td>
                      <td
                        width="13.9%"
                        style={{ textAlign: "right", paddingRight: "3vw" }}
                      >
                        {(cust.amount || 0).toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td width="15.2%">
                        <div
                          className="list-category est-category-status"
                          style={{
                            border: "0.5px solid " + Colors[cust.status],
                            color: Colors[cust.status],
                          }}
                        >
                          {cust.status}
                        </div>
                      </td>
                      <td width="9.2%">
                        {moment(cust.created).format(currentUser.dateFormat)}
                      </td>
                      <td width="9.1%" align="center">
                        {
                          <>
                            <span style={{ marginRight: "0.3vw" }}></span>
                            <Avatar
                              size="1.75vw"
                              title={cust.createdBy}
                              round="50%"
                              textSizeRatio={3}
                              textMarginRatio={0.15}
                              name={cust.createdBy}
                            />
                          </>
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

export default EstimationListItems;
