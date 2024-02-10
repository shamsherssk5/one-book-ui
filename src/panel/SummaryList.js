import React from 'react';
import Gr_Sr from "../assets/images/gr_sr.png";
import SummaryFilter from "../assets/images/sumary-filter.png";
import taskCount from '../assets/images/task-count.png'
import notifCount from '../assets/images/notif-count.png'
import scduleCount from '../assets/images/schedules-count.png'
import appCount from '../assets/images/approval-count.png';
import verticaldots from "../tasks/assets/vertical-dots.png";
const SummaryList = ({ data }) => {
    let list = [{
        type: "task"
    }]
    let images = { "task": taskCount, "notification": notifCount, "schedule": scduleCount, "approval": appCount };
    return (
        <div className='summary-list-box'>
            <div style={{ borderBottom: "0.5px solid #239BCF" }}>
                <div className="summarylist-header">
                    <span className='heading'> Summary List </span>
                    <table width="100%">
                        <tbody width="100%">
                            <tr width="100%">
                                <td width="5.5%">
                                    <img
                                        title="Search"
                                        style={{ width: "100%" }}
                                        src={Gr_Sr}
                                    />
                                </td>
                                <td width="88.5%">
                                    <input type="text" placeholder="" className="summaryList-search" autoFocus />
                                </td>
                                <td width="6%">
                                    <img
                                        title="Search"
                                        style={{ width: "100%" }}
                                        src={SummaryFilter}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='summary-list-by-type-container'>
                {list.map(l => <div className='summary-list-task-box'>
                    <div className='summary-list-task-box-img'>
                        <img src={images[l.type]} className="summary-list-task-box-image" />
                    </div>
                    <div className='summary-list-task-box-details'>
                        {l.type==="task" && <><p style={{fontWeight:"bold"}}>
                            Bvlgari Dm Store Design Completion
                        </p>
                        <p>
                            Due : TODAY
                        </p>
                        <p style={{fontStyle:"italic"}}>
                            Created : Gigeesh Satheendran 25 Dec 2021 - 10.00 A.M
                        </p>
                        </>}
                    </div>
                    <div className='summary-list-task-box-action'>
                    <img
													title="Modify"
													variant="success"
													className="summary-vertical-dots"
													src={verticaldots}
												/>
                    </div>
                </div>)}

            </div>


        </div>
    );
};

export default SummaryList;