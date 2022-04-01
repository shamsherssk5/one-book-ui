import React from 'react';
import G_plus from "./assets/images/g_plus.png";
const Structure2 = () => {
    return (
        <div className="main-left-right-div-container temp2Setting">
            <div className="left-div-header setting-header">
                <span className="header-title-sub setting-left">SUB TITLE</span>
                <span className="header-title-main setting-left" >Settings</span>
                <img className="g_plus setting_g_plus" src={G_plus} />
            </div>
            <div className="empty-div"></div>
            <div className="settings-content-box">
                    <div className="setting-content-left-box">

                    </div>
                    <div className="setting-content-right-box">
                        
                    </div>
            </div>
        </div>
    );
};

export default Structure2;