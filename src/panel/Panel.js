import React, { useEffect, useRef, useState } from "react";
import "./panel.css";
import sunny from "../assets/images/sunny.png";
import cal from "../assets/images/cal.png";
import "./clock.css";
import Clock from "./Clock";
import taskCount from "../assets/images/task-count.png";
import notifCount from "../assets/images/notif-count.png";
import scduleCount from "../assets/images/schedules-count.png";
import appCount from "../assets/images/approval-count.png";
import Estimations from "../assets/images/estimations.png";
import Quotes from "../assets/images/quotes.png";
import Projects from "../assets/images/projects.png";
import Purchase from "../assets/images/purchase.png";
import History from "../common/History";
import axios from "axios";
import SummaryList from "./SummaryList";
import Left_Arrow from "../tasks/assets/left-arrow.png";
import Right_Arrow from "../tasks/assets/right-arrow.png";
import BarChart from "./BarChart";

const Panel = ({ setToken }) => {
  const data = [
    { col: "Overdue", value: 75860 },
    { col: "older", value: 77080 },
    { col: "cs1", value: 75170 },
    { col: "cs2", value: 68730 },
    { col: "cs3", value: 30810 },
    { col: "cs4", value: 90810 },
  ];
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let date = new Date(
    new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
  );
  let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [day, setDay] = useState(days[date.getDay()]);
  const [todayDate, setTodayDate] = useState(date.getDate());
  const [month, setMonth] = useState(monthNames[date.getMonth()]);
  const [year, setYear] = useState(date.getFullYear());
  const getGreet = (today) => {
    var curHr = today.getHours();
    if (curHr < 12) {
      return "Good Morning";
    } else if (curHr < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };
  const [greet, setGreet] = useState(getGreet(date));
  const [history, setHistory] = useState([]);

  useEffect(async () => {
    if (history && history.length > 0) return;
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/common/history?ID=pnm" + 10, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setHistory(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let date1 = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      setDay(days[date.getDay()]);
      setTodayDate(date.getDate());
      setMonth(monthNames[date.getMonth()]);
      setYear(date.getFullYear());
      setGreet(getGreet(date1));
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  const ref = useRef(null);
  const handleScroll = (scrollOffset) => {
    ref.current.scrollLeft += scrollOffset;
  };

  const handleCreateInvoice = async () => {};

  return (
    <div className="panel-container">
      <div className="panel-left-div">
        <div className="panel-left-inner-div">
          <div className="panel-left-upper-box">
            <div className="panel-name-container">
              <table>
                <tbody>
                  <tr>
                    <td className="panel-sun-td">
                      <img src={sunny} style={{ width: "5.5vw" }} />
                    </td>
                    <td className="panel-name-td">
                      <p className="greet">{greet}</p>
                      <p className="panelname">{currentUser.username}</p>
                      <p className="greet">Have a nice day</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ paddingTop: "5vh", paddingLeft: "8vw" }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <div
                          style={{
                            width: "5vw",
                            height: "5.5vw",
                            position: "relative",
                          }}
                        >
                          <img
                            src={cal}
                            style={{ width: "100%", height: "100%" }}
                          />
                          <span class="panel-day">{day}</span>
                          <span class="panel-date">{todayDate}</span>
                        </div>
                      </td>
                      <td style={{ verticalAlign: "bottom" }}>
                        <span className="panel-month-year">
                          <span>{month}</span>
                          <span
                            style={{ display: "block", paddingLeft: "0.5vw" }}
                          >
                            {year}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            position: "relative",
                            height: "100%",
                            width: "100%",
                            paddingLeft: "3.5vw",
                          }}
                        >
                          <Clock />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-summar-container">
              <div className="panel-summary-inner">
                <div className="summary-heading">SUMMARY</div>
                <div className="summary-by-type">
                  <div className="summary-image">
                    <img class="summar-img" src={taskCount}></img>
                  </div>
                  <div className="summary-details">
                    <table>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <span className="summar-det-header">Tasks</span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p>TO DO</p>
                            <p className="summar-det-count">24</p>
                          </td>
                          <td>
                            <p>NEW</p>
                            <p className="summar-det-count">3</p>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="summary-by-type">
                  <div className="summary-image">
                    <img class="summar-img" src={notifCount}></img>
                  </div>
                  <div className="summary-details">
                    <table>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <span className="summar-det-header">
                              Notifications
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p>TODAY</p>
                            <p className="summar-det-count">24</p>
                          </td>
                          <td>
                            <p>THIS WEEK</p>
                            <p className="summar-det-count">3</p>
                          </td>
                          <td>
                            <p>THIS MONTH</p>
                            <p className="summar-det-count">4</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="summary-by-type">
                  <div className="summary-image">
                    <img class="summar-img" src={scduleCount}></img>
                  </div>
                  <div className="summary-details">
                    <table>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <span className="summar-det-header">Schedules</span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p>TODAY</p>
                            <p className="summar-det-count">24</p>
                          </td>
                          <td>
                            <p>TOMORROW</p>
                            <p className="summar-det-count">3</p>
                          </td>
                          <td>
                            <p>THIS WEEK</p>
                            <p className="summar-det-count">4</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="summary-by-type">
                  <div className="summary-image">
                    <img class="summar-img" src={appCount}></img>
                  </div>
                  <div className="summary-details">
                    <table>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <span className="summar-det-header">Approvals</span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p>PENDING</p>
                            <p className="summar-det-count">24</p>
                          </td>
                          <td>
                            <p>AWAITING</p>
                            <p className="summar-det-count">3</p>
                          </td>
                          <td>
                            <p>HOLD</p>
                            <p className="summar-det-count">4</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-lower-part">
            <div className="next-prev-button-container">
              <img
                src={Left_Arrow}
                onClick={() => handleScroll(-window.innerWidth * 0.21)}
              />
            </div>
            <div className="bottom-details-container" ref={ref}>
              <div className="panel-bottom-details-box">
                <div className="bottom-box-heading-container">
                  <div className="heading-bottom">Estimation</div>
                </div>
                <div className="bottom-img-cont">
                  <img className="bottom-image-box" src={Estimations} />
                </div>
                <div className="bottom-sub-heading">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="left">Request</td>
                        <td align="right">4</td>
                      </tr>
                      <tr>
                        <td align="left">Drafts</td>
                        <td align="right">25</td>
                      </tr>
                      <tr>
                        <td align="left">Pending Approval</td>
                        <td align="right">34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-bottom-details-box">
                <div className="bottom-box-heading-container">
                  <div className="heading-bottom">Quotes</div>
                </div>
                <div className="bottom-img-cont">
                  <img className="bottom-image-box" src={Quotes} />
                </div>
                <div className="bottom-sub-heading">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="left">Drafts</td>
                        <td align="right">4</td>
                      </tr>
                      <tr>
                        <td align="left">Sent</td>
                        <td align="right">25</td>
                      </tr>
                      <tr>
                        <td align="left">Pending Approval</td>
                        <td align="right">34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-bottom-details-box">
                <div className="bottom-box-heading-container">
                  <div className="heading-bottom">Projects</div>
                </div>
                <div className="bottom-img-cont">
                  <img className="bottom-image-box" src={Projects} />
                </div>
                <div className="bottom-sub-heading">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="left">Not Started</td>
                        <td align="right">4</td>
                      </tr>
                      <tr>
                        <td align="left">On Going</td>
                        <td align="right">25</td>
                      </tr>
                      <tr>
                        <td align="left">Hold</td>
                        <td align="right">34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-bottom-details-box">
                <div className="bottom-box-heading-container">
                  <div className="heading-bottom">Purchase order</div>
                </div>
                <div className="bottom-img-cont">
                  <img className="bottom-image-box" src={Purchase} />
                </div>
                <div className="bottom-sub-heading">
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="left">Drafts</td>
                        <td align="right">4</td>
                      </tr>
                      <tr>
                        <td align="left">Awaiting Approval</td>
                        <td align="right">25</td>
                      </tr>
                      <tr>
                        <td align="left">Sent</td>
                        <td align="right">34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="next-prev-button-container">
              <img
                src={Right_Arrow}
                onClick={() => handleScroll(window.innerWidth * 0.21)}
              />
            </div>
          </div>
          <div className="bar-graph-container">
            <div className="bar-graph-box">
              <div className="bar-graph-header">Invoices owed to you</div>
              <div className="bar-graph-button" onClick={handleCreateInvoice}>
                Create Invoice
              </div>
              <div className="bar-graph-details">
                <table width="100%">
                  <tbody>
                    <tr>
                      <td align="left">3 Draft Invoices</td>
                      <td align="right">1000000</td>
                    </tr>
                    <tr>
                      <td align="left">114 Awaiting Payment</td>
                      <td align="right">2250000000</td>
                    </tr>
                    <tr style={{ color: "#F94444" }}>
                      <td align="left">53 Overdue</td>
                      <td align="right">2000000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ paddingTop: "3.54vh" }}>
                <BarChart data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-right-div">
        <div className="summary-list-container">
          <SummaryList />
        </div>
        <div className="panel-history-container">
          {history && <History data={history} />}
        </div>
      </div>
    </div>
  );
};

export default Panel;
