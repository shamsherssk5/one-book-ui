import moment from 'moment-timezone';
import React, { useState } from 'react';
import HistoryImg from "../tasks/assets/history.png";

const History = ({ data }) => {
    let currentUser=JSON.parse(window.sessionStorage.getItem("currentUser"));
    const [hCount, sethCount] = useState(3);
    const handleCount = () => {
        if (hCount >= data.length) {
            sethCount(3);
        } else {
            sethCount(c => c + 3);
        }
    }
    const getTimeDifference = t => {
        let diff = new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone})).valueOf() - new Date(t).valueOf();
        let min = diff / 60000;
        if (min <= 60) {
            return Math.round(min) + " Min(s) Ago"
        } else if (min > 60 && min <= 1440) {
            return Math.round(min / 60) + " Hour(s) Ago"
        } else if (min > 1440 && min <= 10080) {
            return Math.round(min / 1440) + " Day(s) Ago"
        } else if (min > 10080 && min <= 40320) {
            return Math.round(min / 10080) + " Week(s) Ago"
        } else if (min > 40320 && min <= 483840) {
            return Math.round(min / 40320) + " Month(s) Ago"
        } else if (min > 483840) {
            return Math.round(min / 483840) + " Year(s) Ago"
        }
    }


    return (
        <>
            <div className="messages task-details-container">
                <div className="message-Heading">
                    History
                </div>
            </div>

            <div className="empty-details-container blue-border"></div>
            <div className='history-container task-details-container'>
                <div class="rb-container">
                    <ul class="rb">
                        {data && data.filter((d, i) => i < hCount).map(h => <li class="rb-item">
                            <table className='history-table' index={h.moduleID}>
                                <tbody>
                                    <tr>
                                        <td className='blue-font-color' align='left'>{getTimeDifference(h.dateAndTime.replace('T',' ').replace('Z',''))}</td>
                                        <td align='right'>{h.name}</td>
                                    </tr>
                                    <tr>
                                        <td align='left' > <span style={{ fontWeight: 'bold' }}>{h.action}</span></td>
                                        <td align='right'>{moment(h.dateAndTime.replace('T',' ').replace('Z','')).format(currentUser.dateFormat+ (currentUser.timeFormat==="12 Hrs" ? " hh:mm A":" HH:mm"))}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>)}
                    </ul>
                    {data && data.length > 0 && <img className={hCount >= data.length ? "history-img rotate" : "history-img"} title={hCount >= data.length ? "See Less" : "See More"} src={HistoryImg} onClick={handleCount} />}
                </div>
            </div>
        </>
    );
};

export default History;