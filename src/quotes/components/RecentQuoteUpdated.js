import React, { Component } from "react";
import Colors from "../../estimate/components/EstimateColors";
import moment from "moment-timezone";

const RecentQuoteUpdated = ({ data, handleRecentClick }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  return Object.keys(data).map((key) => (
    <>
      <div className="recent-estimate-day-details-container">
        <span>{key}</span>
      </div>
      <div className="recent-estimate-updated-container">
        {data[key].map((d) => (
          <div className="recent-opened-table-container">
            <table
              className="equalDivide"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              border="0"
            >
              <tbody>
                <>
                  <tr>
                    <td
                      className="blue-heading recent-proj-name"
                      onClick={() => handleRecentClick(d.quoteID)}
                    >
                      {d.projName}
                    </td>
                    <td
                      className="table-heading"
                      align="right"
                      style={{
                        color: Colors[d.status],
                      }}
                    >
                      {d.status}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading">{d.customer}</td>
                    <td className="table-heading" align="right">
                      {moment(
                        d.updated.replace("T", " ").replace("Z", "")
                      ).format(
                        currentUser.dateFormat +
                          (currentUser.timeFormat === "12 Hrs"
                            ? " hh:mm A"
                            : " HH:mm")
                      )}
                    </td>
                  </tr>
                </>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  ));
};

export default RecentQuoteUpdated;
