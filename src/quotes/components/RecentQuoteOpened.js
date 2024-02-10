import React, { Component } from "react";

const RecentQuoteOpened = ({ data, handleRecentClick }) => {
  return (
    <>
      <div className="messages task-details-container">
        <div className="message-Heading">Recent Open Files</div>
      </div>

      <div className="empty-details-container blue-border"></div>
      <div className="history-container task-details-container">
        {data.map((d) => (
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
                    <td className="table-heading" align="right">
                      {(d.amount || 0).toLocaleString(navigator.language, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading">{d.customer}</td>
                  </tr>
                </>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecentQuoteOpened;
