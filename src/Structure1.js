import React, { useState } from 'react';
import G_plus from "./assets/images/g_plus.png";
import Gr_Sr from "./assets/images/gr_sr.png";

const Structure1 = () => {
    const [properties, setProperties]=useState({
        selectedSub:1
    });
    return (
        <div className="main-left-right-div-container">
            <div className="main-left-div">
                <div className="left-div-header">
                        <span className="header-title-sub">SUB TITLE</span>
                        <span className="header-title-main" >TITLE</span>
                        <img className="g_plus" src={G_plus} />
                        <button className='left-options-button'>Options</button>
                        <img className="left-gs-img" src={Gr_Sr} />
                </div>
                <div className="left-div-content"></div>

            </div>
            <div className="main-right-div">
                <div className="right-div-header">
                    <span className="right-header-title">View text Head</span>
                    <span className={properties.selectedSub===1?"right-sub-header-1 clicked":"right-sub-header-1"} onClick={()=>setProperties({selectedSub:1})}>sub text 1</span>
                    <span className={properties.selectedSub===2?"right-sub-header-2 clicked":"right-sub-header-2"} onClick={()=>setProperties({selectedSub:2})}>sub text 2</span>
                </div>
                <div className="right-div-content">

                </div>
            </div>
        </div>
    );
};

export default Structure1;