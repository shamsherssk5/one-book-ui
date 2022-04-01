import React, { useEffect, useState } from 'react';
import '../../common/styles/customer-supplier-common.css'
import HistoryImg from "../../tasks/assets/history.png";
import NoteDel from "../../assets/images/Note-Del.png";
import NoteEdit from "../../assets/images/cal-update.png";
import DatePicker from 'react-date-picker';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment-timezone';

const Reminders = ({ slectedSubMenu, data, setData, currentCustomer, setToken, contacts }) => {
    const [hCount, sethCount] = useState(3);
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    const [start, setStart] = useState();
    let emptyReminder = {
        description: "",
        custID: currentCustomer.custID,
        created_by: currentUser.username,
        rem_employee:"",
        created_date:""
    }
    const [reminderData, setReminderData] = useState(emptyReminder);
    const [SubmitButton, setSubmitButton] = useState("ADD");
    const handleCount = () => {
        if (hCount >= data.length) {
            sethCount(3);
        } else {
            sethCount(c => c + 3);
        }
    }

    const handleDelete = async (rem) => {
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/customers/delete-reminder', { 'id': rem.id }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setData(prev => {
                    let updatedData = prev.filter(cust => {
                        if (cust.custID === currentCustomer.custID) {
                            let updatedReminder = cust.reminders.filter((a) => a.id != rem.id);
                            cust.reminders = updatedReminder;
                        }
                        return cust;
                    })
                    return updatedData;
                })
                toast.success('Reminder deleted successfully');

            }).catch((err) => {
                console.log(err);
                toast.error('Reminder Deletion Failed..!');
            })
    }

    const handleEdit = (d) => {
        setSubmitButton("UPDATE");
        setReminderData(d);
        setStart(new Date(d.rem_date));
    }

    const handleSaves = async () => {
        if(reminderData.description.trim().length<=0) {
            toast.error("Please Enter Reminder Description");
            return;
        }else if(reminderData.rem_employee.trim().length<=0){
            toast.error("Please Select Employee");
            return;
        }else if(!start){
            toast.error("Please Select Reminder Date");
            return;
        }
        reminderData["rem_date"]=start.getFullYear().toString() + "-" + (start.getMonth() + 1).toString() + "-" + start.getDate().toString();

        let d=new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone}));
        reminderData.created_date=d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString()+" "+d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString();
        
        if (SubmitButton === "ADD") {
            setSubmitButton("...Saving")
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/customers/create-reminder', reminderData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    reminderData["id"] = res.data.insertId;
                    setSubmitButton("ADD");
                    setData((prev) => {
                        let updatedData = prev.filter(cust => {
                            if (cust.custID === currentCustomer.custID) {
                                cust.reminders.unshift(reminderData);
                            }
                            return cust;
                        })
                        return updatedData;
                    })
                    toast.success("Reminder Added Successfully");
                    setReminderData(emptyReminder);
                    setStart();
                }).catch((err) => {
                    console.log(err);
                    toast.error("Reminder creation failed");
                    setSubmitButton("ADD");
                })

        } else if (SubmitButton === "UPDATE") {
            setSubmitButton("...Saving")
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/customers/update-reminder', reminderData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    setSubmitButton("ADD");
                    toast.success("Reminder Updated successfully");
                    setData((prev) => {
                        let updatedData = prev.filter(cust => {
                            if (cust.custID === currentCustomer.custID) {
                                let updatedReminder = cust.reminders.filter(n => {
                                    if (n.id === reminderData.id) {
                                        n.description = reminderData.description;
                                        n.rem_employee=reminderData.rem_employee;
                                        n.rem_date=reminderData.rem_employee;
                                    }
                                    return n;
                                })
                                cust.reminders = updatedReminder;
                            }
                            return cust;
                        })
                        return updatedData;
                    })
                    setReminderData(emptyReminder);
                    setStart();
                })
                .catch((err) => {
                    console.log(err);
                    toast.error("Reminder updation failed");
                    setSubmitButton("UPDATE");
                })

        }

    }

    useEffect(async () => {
        setReminderData(emptyReminder);
        setSubmitButton("ADD");
        if (!currentCustomer) return;
        if (slectedSubMenu !== "Reminders") return;
        if (currentCustomer && currentCustomer.reminders && currentCustomer.reminders.length > 0) return;
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/customers/cust-reminders?ID=' + currentCustomer.custID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setData((prev) => {
                    let updatedData = prev.filter(cust => {
                        if (cust.custID === currentCustomer.custID) {
                            cust["reminders"] = res.data
                        }
                        return cust;
                    })
                    return updatedData;
                })
            }).catch(err => {
                console.log(err);
            })

    }, [currentCustomer, slectedSubMenu])


    return (
        slectedSubMenu === "Reminders" &&
        <div className='notes-container'>
            <div className='notes-adder-container rem-adder'>
                <span className='notes-adder-header rem-header'>Date to be notified</span>
                <span className='date-user-selctor'>
                    <span>Select Date</span>
                    <span className='rem-date-selector'>
                        <DatePicker
                            dayPlaceholder="DD"
                            monthPlaceholder='MM'
                            yearPlaceholder='YYYY'
                            onChange={setStart}
                            value={start}
                            required={true}
                            calendarIcon={null}
                            clearIcon={null}
                        />
                    </span>
                    <span className='rem-to-sle'>Set Reminder To</span>
                    <span className='create-task-container rem-to-selector'>
                        <select className="title rem-sle-box" name="rem_employee" value={reminderData.rem_employee} onChange={(e)=>setReminderData({...reminderData, rem_employee:e.target.value})} required>
                        <option value="" disabled selected >Select Employee</option>
                        {contacts && contacts.map(
                                    (item, i) => { return <option key={item.id} value={item.name}>{item.name}</option> }
                        )}
                    </select></span>
                </span>
                <span className='description-adder'>
                    <span className='rem-desc'>Description</span>
                    <input type="text" className='notes-add-input rem-adder-input' value={reminderData.description} placeholder='Enter Here...' onChange={(e) => setReminderData({...reminderData, description:e.target.value})} maxLength={75}></input>
                    <button id="next" className='notes-add-button rem-adder-button' onClick={handleSaves}>{SubmitButton}</button>
                </span>
            </div>
            <div className='notes-content-container'>
                <div class="rb-container">
                    <ul class="rb">
                        {data && data.filter((d, i) => i < hCount).map(h => <li class="rb-item cust-sup-notes">
                            <table className='history-table notes-table' index={h.id}>
                                <tbody>
                                    <tr>
                                        <td align='left'>
                                            <p className='notes-data-text'>{h.description}</p>
                                            <p className='notes-data-info'>created by {h.created_by} on {moment(h.created_date.replace('T',' ').replace('Z','')).format(currentUser.dateFormat+ (currentUser.timeFormat==="12 Hrs" ? " hh:mm A":" HH:mm"))}</p>
                                        </td>
                                        <td align='right'>
                                            <img className="notes-edit" src={NoteEdit} onClick={() => handleEdit(h)} />
                                            <img className="notes-delete" src={NoteDel} onClick={() => handleDelete(h)} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>)}
                    </ul>
                    {data && data.length > 0 && <img className={hCount >= data.length ? "history-img rotate" : "history-img"} title={hCount >= data.length ? "See Less" : "See More"} src={HistoryImg} onClick={handleCount} />}
                </div>
            </div>

        </div>
    );
};

export default Reminders;