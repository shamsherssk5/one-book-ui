import { useEffect, useState } from "react";
import Colors from '../helpers/Colors';
import Subject_Sort from "../../assets/subject-sort.png";
import Sort from "../../assets/sort.png";
import Style from '../../css/task.module.css';
import Dots from "../../assets/vertical-dots.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";
import NothingToShowHere from "../../../common/NothingToShowHere";
const TaskListItems = ({ currentItems, currentTask, setData, updateData, sortData, handleEdit, setToken }) => {

    const [sort, setSort] = useState('');
    useEffect(() => {
        if (currentItems == null || currentItems.length===0) return;
        document.getElementById("all").checked = false;
        currentItems.forEach(element => {
            document.getElementById(element.id).checked = false;
        });
    }, [currentItems])

    const handleForward = (task) => {
        document.body.click();
        updateData((prevState) => {
            return { tasks: prevState.tasks, rightContent: "Forward", currentTask: task, category: prevState.category, isScrollButtonVisible: prevState.isScrollButtonVisible }
        })
    }

    useEffect(() => {
        sortData(sort);
    }, [sort])
    const handleTaskDelete = async (id) => {
        document.body.click();
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/tasks/deleteTask', { "id": id }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                updateData((prevState) => {
                    let updatedTask = prevState.tasks.filter(t => t.id != id);
                    return { tasks: updatedTask, rightContent: "Create", currentTask: {}, category: prevState.category, isScrollButtonVisible: prevState.isScrollButtonVisible }
                })
                toast.success('Task deleted successfully');
            }).catch(err => {
                console.log(err)
            })

    }
    const handleOnchange = (e) => {
        let isAllChecked = currentItems.every(d => document.getElementById(d.id).checked);
        if (isAllChecked) {
            document.getElementById("all").checked = true;
        } else {
            document.getElementById("all").checked = false;
        }
    }

    const handleCheckAll = (e) => {
        console.log("called")
        currentItems.forEach(element => {
            document.getElementById(element.id).checked = e.target.checked;
        });
    }
    return (
        <div className="list-container-box">
            {currentItems && currentItems.length>0 ?
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <table className="list-view-table">
                        <thead className="thead-class">
                            <tr className="list-view-header-row users-list-tr">
                                <th width="3.1%"><input id="all" className="chkbx" name="all" type="checkbox" onChange={handleCheckAll} /></th>
                                <th width="34.1%" onClick={() => sort == "id" ? setSort("id-dec") : setSort("id")}>Task ref & Subject <img title="sort" className={sort == "id" ? "sort sort-flip" : "sort"} src={Subject_Sort} /></th>
                                <th width="11.4%" onClick={() => sort == "title" ? setSort("title-dec") : setSort("title")}>Department <img title="sort" className={sort == "title" ? "sort sort-flip" : "sort"} src={Sort} /></th>
                                <th width="15.9%">AssignTo</th>
                                <th width="10.2%" onClick={() => sort == "priority" ? setSort("priority-dec") : setSort("priority")}>priority <img title="sort" className={sort == "priority" ? "sort sort-flip" : "sort"} src={Sort} /></th>
                                <th width="11.2%" onClick={() => sort == "category" ? setSort("category-dec") : setSort("category")}>Status <img title="sort" className={sort == "category" ? "sort sort-flip" : "sort"} src={Sort} /></th>
                                <th width="11.1%" onClick={() => sort == "assignDate" ? setSort("assignDate-dec") : setSort("assignDate")}>Date Assined <img title="sort" className={sort == "assignDate" ? "sort sort-flip" : "sort"} src={Sort} /></th>
                                <th width="3%"></th>
                            </tr>
                        </thead>
                        <tbody className="tbody-class">
                            {currentItems.map((task, index) => {
                                return (<>
                                    <tr key={index} className="task-list-row-container" style={{ backgroundColor: currentTask !== null && currentTask.id === task.id ? '#E5F1FA' : '', visibility: task.id === 'dummy' ? 'hidden' : 'visible' }} onClick={(e) => setData(task, e)}>
                                        <td width="3.1%" ><input className="chkbx" name={task.id} id={task.id} type="checkbox" onChange={handleOnchange} /></td>
                                        <td idth="34.1%" className="ref-subject-container"><p>{task.refText ? task.refText : 'TASK-'}{task.referenceNum ? task.referenceNum : task.id}</p><p className="list-subject">{task.subject}</p></td>
                                        <td width="11.4%">{task.title}</td>
                                        <td width="15.9%">{task.users ? task.users.map((user, index) => <img key={index} className={Style.userAvatar} title={user.userName} src={user.userAvatar} />) : <span></span>}</td>
                                        <td width="10.2%" style={{ color: (task.endDate !== '' && task.endDate !== null) ? '' : Colors[task.priority] }}>{(task.endDate !== '' && task.endDate !== null) ? task.endDate : task.priority}</td>
                                        <td width="11.2%" ><div className="list-category" style={{ border: "0.5px solid " + Colors[task.category], color: Colors[task.category] }}>{task.category}</div></td>
                                        <td width="11.1%" >{task.assignDate}</td>
                                        <td width="3%">
                                            <OverlayTrigger
                                                placement="left"
                                                trigger="click"
                                                rootClose
                                                overlay={(
                                                    <Popover>
                                                        <div className={Style.popup}>
                                                            <p className="p-leave" onClick={() => handleEdit(task)}>
                                                                Edit
                                                            </p>
                                                            <p className={Style.delete} onClick={() => handleTaskDelete(task.id)}>
                                                                Delete
                                                            </p>
                                                            <p className="p-leave" onClick={() => handleForward(task)}>
                                                                Forward
                                                            </p>
                                                        </div>
                                                    </Popover>
                                                )}>
                                                <img title="Modify" variant="success" className="vertical-dots" src={Dots} />
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                    <tr className="empty-row-container" style={{ visibility: task.id === 'dummy' ? 'hidden' : 'visible' }}>
                                        <td width="100%" className="border-td" colSpan="8"><div></div></td>
                                    </tr>
                                </>)
                            })
                            }
                        </tbody>

                    </table>
                </div>
            :<NothingToShowHere/>
            }
        </div>
    );
}

export default TaskListItems;