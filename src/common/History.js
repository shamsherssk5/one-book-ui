import moment from "moment-timezone";
import React, { useState } from "react";
import HistoryImg from "../tasks/assets/history.png";
import { getTimeDifference } from "./commonOperation";

const History = ({ data, headerNotRequired }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [hCount, sethCount] = useState(3);
  const handleCount = () => {
    if (hCount >= data.length) {
      sethCount(3);
    } else {
      sethCount((c) => c + 3);
    }
  };

  return (
    <>
      {!headerNotRequired && (
        <>
          <div className="messages task-details-container">
            <div className="message-Heading">History</div>
          </div>
          <div className="empty-details-container blue-border"></div>
        </>
      )}
      <div className="history-container task-details-container">
        <div class="rb-container">
          <ul class="rb">
            {data &&
              data
                .filter((d, i) => i < hCount)
                .map((h) => (
                  <li class="rb-item">
                    <table className="history-table" index={h.moduleID}>
                      <tbody>
                        <tr>
                          <td
                            width={"55%"}
                            className="blue-font-color"
                            align="left"
                          >
                            {getTimeDifference(
                              h.dateAndTime.replace("T", " ").replace("Z", "")
                            )}
                          </td>
                          <td width={"45%"} align="right">
                            {h.name}
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="left"
                            style={{
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {" "}
                            <span
                              title={h.action}
                              style={{ fontWeight: "bold" }}
                            >
                              {h.action}
                            </span>
                            <span
                              title={h.description}
                              style={{ color: "#2687d7" }}
                            >
                              {" "}
                              {h.description}
                            </span>
                          </td>
                          <td align="right">
                            {moment(
                              h.dateAndTime.replace("T", " ").replace("Z", "")
                            ).format(
                              currentUser.dateFormat +
                                (currentUser.timeFormat === "12 Hrs"
                                  ? " hh:mm A"
                                  : " HH:mm")
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </li>
                ))}
          </ul>
          {data && data.length > 0 && (
            <img
              className={
                hCount >= data.length ? "history-img rotate" : "history-img"
              }
              title={hCount >= data.length ? "See Less" : "See More"}
              src={HistoryImg}
              onClick={handleCount}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default History;
