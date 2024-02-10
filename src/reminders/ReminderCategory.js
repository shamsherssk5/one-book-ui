import React, { useState } from 'react';
import Style from '../tasks/css/taskCategory.module.css'
import Colors from './Colors';
import Right_White_Arrow from "../tasks/assets/right-white-arrow.png";
import Down_White_Arrow from "../tasks/assets/down-white-arrow.png";
import Reminder from './Reminder';

const ReminderCategory = ({headerTitle, data,onDrop,currentReminder,setCurrentReminder,setRightContent,handleDeleteReminder}) => {
    let headerColor = Colors[headerTitle]
    const onDragOver = (e) => {
        e.preventDefault();
    }

    const [uiConsts, setUiConsts] = useState({ collapse: false });
    const handleCollapse = (value) => {
        setUiConsts({ collapse: value });
    }

    if (!uiConsts.collapse) {
        return (
            <div
                onDragOver={(e) => onDragOver(e)}
                onDrop={(e) => { onDrop(e, headerTitle) }}
                className={Style.Category} style={{ border: "0.5px solid " + headerColor }}
            >
                <div className={Style.categoryHeading} style={{ borderBottom: "0.5px solid " + headerColor }}>
                    <div className={Style.headingButton} style={{ background: headerColor }}>
                        <img src={Right_White_Arrow} className={Style.arrowbutton} onClick={() => handleCollapse(true)} alt=""/>
                    </div>
                    <div className={Style.headerTitleContainer} style={{ color: headerColor }} >
                        <span className={Style.headerTitle} > {headerTitle} ({data.length > 0 ? data.length : 0})</span>
                    </div>
                </div>
                <div className={Style.taskscategoryBox}>
                    <div className={Style.taskscategorywiseContainer}>
                        {
                            data.map((rem) => <Reminder  key={rem.id} reminder={rem} currentReminder={currentReminder} setCurrentReminder={setCurrentReminder} setRightContent={setRightContent} handleDeleteReminder={handleDeleteReminder}/>)
                        }
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div
                style={{ border: "0.5px solid " + headerColor }}
                className={Style.collapseCategory}>
                <div className={Style.CollapsecategoryHeading} style={{ background: headerColor }}>
                    <img src={Down_White_Arrow} className={Style.downArrowbutton} onClick={() => handleCollapse(false)} alt=""/>
                </div>
                <div className={Style.collapseDetails} style={{ color: headerColor }} >
                    <span className={Style.collapseHeaderTitle} >{headerTitle}  ({data.length > 0 ? data.length : 0}) </span>
                </div>
            </div>


        )
    }
};

export default ReminderCategory;