import React, { useState } from 'react';
import Task from './Task';
import Style from '../../css/taskCategory.module.css'
import Colors from '../helpers/Colors';
import Right_White_Arrow from "../../assets/right-white-arrow.png";
import Down_White_Arrow from "../../assets/down-white-arrow.png";

const TaskCategory = (props) => {
    let { tasks, headerTitle,handleEdit } = props;
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
                onDrop={(e) => { props.onDrop(e, tasks[0].category) }}
                className={Style.Category} style={{ border: "0.5px solid " + headerColor }}
            >
                <div className={Style.categoryHeading} style={{ borderBottom: "0.5px solid " + headerColor }}>
                    <div className={Style.headingButton} style={{ background: headerColor }}>
                        <img src={Right_White_Arrow} className={Style.arrowbutton} onClick={() => handleCollapse(true)} />
                    </div>
                    <div className={Style.headerTitleContainer} style={{ color: headerColor }} >
                        <span className={Style.headerTitle} > {headerTitle} ({tasks.length > 0 ? tasks.length - 1 : 0})</span>
                    </div>
                </div>
                <div className={Style.taskscategoryBox}>
                    <div className={Style.taskscategorywiseContainer}>
                        {
                            tasks.map((task) => <Task setData={props.setData} taskClick={props.handleTaskClick} key={task.id} task={task} currentTaskID={props.currentTaskID} handleEdit={handleEdit}/>)
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
                    <img src={Down_White_Arrow} className={Style.downArrowbutton} onClick={() => handleCollapse(false)} />
                </div>
                <div className={Style.collapseDetails} style={{ color: headerColor }} >
                    <span className={Style.collapseHeaderTitle} >{headerTitle}  ({tasks.length > 0 ? tasks.length - 1 : 0}) </span>
                </div>
            </div>


        )
    }
};

export default TaskCategory;