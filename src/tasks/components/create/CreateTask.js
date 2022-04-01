import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../css/createTask-form.css'
import '../../css/datepicker.css'
import toast from 'react-hot-toast';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css';
import FileUploaderListViewer from '../../../common/FileUploaderListViewer';
import Multiselect from 'multiselect-react-dropdown';

const CreateTask = (props) => {
    let { projects, setProjects, usersList, serUsersList, setToken } = props;
    const [files, setFiles] = useState([]);
    const [assignTo, setAssinTo]=useState([]);
    const handleUpload = (file) => {
        setFiles((prev) => {
            return [...prev, file];
        });
    }

    const ref = useRef(null);

    const handleDelete = (id) => {
        setFiles(prev => {
            let f = prev.filter(file => file.fileID !== id)
            return f;
            ;
        })
    }

    const [disable, submitDisable] = useState(false);
    let emptyForm = {
        title: '',
        subject: '',
        project: '',
        assignTo: [],
        priority: '',
        notes: '',
        category: 'To do',
        assignDate: '',
        assignTime: '',
        assignee: props.currentUser.username,
        history: [],
        canShowErrors: false
    }
    const [formData, setFormdata] = useState(emptyForm);
    const handleFormChange = (e) => {
        if (e.target.name === 'priority' && e.target.value === "Custom Date") {
            setIsCustomDate(true);
            setFormdata({ ...formData, priority: "Custom Date",canShowErrors: false });
            return;
        }
        setFormdata({ ...formData, [e.target.name]: e.target.value, canShowErrors: false });
    }
    const formValidation = () => {
        var keys = ['title', 'subject', 'priority'];
        return keys.some((key) => { return formData[key].toString().trim().length == 0 });
    }
    const handleFormSubmit = (e) => {
        submitDisable(true);
        e.preventDefault();
        if (formValidation() || assignTo.length<=0) {
            setFormdata({ ...formData, canShowErrors: true });
            submitDisable(false);
            ref.current.scrollTop=0;
            return;
        } else {
            setFormdata({ ...formData, canShowErrors: false });
        };

        if (formData.priority === 'Custom Date') {
            formData['endDate'] = value.getFullYear().toString() + "-" + (value.getMonth() + 1).toString() + "-" + value.getDate().toString();
        } else {
            formData['endDate'] = null;
        }
        let d =new Date(new Date().toLocaleString("en-US", {timeZone: props.currentUser.timeZone}));
        formData['assignDate'] = d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString();
        formData['assignTime'] = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString();
        formData['messages'] = 0;
        formData['attachments'] = files;
        formData['attachmentsCount'] = files.length;
        formData['conversations'] = [];
        formData['orgID'] = props.currentUser.orgID;
        formData.assignTo=assignTo;
        formData.history.unshift({ "moduleID": formData.id, "action": "Added", "dateAndTime": d.toLocaleString(), "name": formData.assignee })
        axios.post(process.env.REACT_APP_API_ENDPOINT + '/tasks/createTask', formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                formData['id'] = res.data.insertId;
                formData['userNames']=assignTo.map(user=>user.userName).join(',');
                props.updateData((prevState) => {
                    return {
                        tasks: [formData, ...prevState.tasks],
                        rightContent: 'Details',
                        currentTask: formData,
                        category: formData.category,
                        isScrollButtonVisible: prevState.isScrollButtonVisible
                    }
                });
                toast.success("Task created successfully");
                submitDisable(false);
                setFormdata(emptyForm);
                setFiles([]);
            }).catch((err) => {
                console.log(err);
                submitDisable(false);
                toast.error("Task creation failed");
            })
    }

    useEffect(async () => {
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/tasks/usersList?orgID='+props.currentUser.orgID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                serUsersList(res.data);
            }).catch((err) => {
                console.log(err);
            })

    }, [])

    useEffect(async () => {
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/tasks/projects', { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setProjects(res.data);
            }).catch((err) => {
                console.log(err);
            })

    }, [])

    const [value, onChange] = useState(new Date());
    const [isCustomDate, setIsCustomDate] = useState(false);
    return (

        (props.rightContent === 'Create' &&
            <div className="task-details-box" ref={ref} >
                <div className="create-task-container task-details-container">
                    <form name="taskForm" autoComplete="off">
                        <div className="task-form-container">
                            {formData.canShowErrors ? <div>
                                <span class="warning-text-error warning-text" >Please fill out all the fileds </span>
                            </div> : ''}
                            <fieldset>
                                <legend>
                                    Department/Section
                                </legend>
                                <select className="title" name="title" value={formData.title} onChange={handleFormChange} required>
                                    <option value="" disabled selected >Select /Add Department</option>
                                    {props.departments ? props.departments.departments.map(d => <option value={d.name}>{d.name}</option>) : ""}
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>
                                    Subject
                                </legend>
                                <input type="text" name="subject" value={formData.subject} onChange={handleFormChange} placeholder="Enter Subject MAX 75 characters" maxLength="75" />
                            </fieldset>
                            <fieldset>
                                <legend>
                                    Project Related
                                </legend>
                                <select className="title" name="project" value={formData.project} onChange={handleFormChange} required>
                                    <option value="" disabled selected >Select Project (Optional)</option>
                                    <option value="">--Optional--</option>
                                    {(projects && projects.length > 0) ? projects.map(p => <option value={p.name}>{p.name}</option>) : ""}
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>
                                    AssignTo
                                </legend>
                                <Multiselect
                                    showCheckbox={true}
                                    id='userID'
                                    options={usersList}
                                    displayValue="userName"
                                    placeholder='Select Employee'
                                    selectionLimit={4}
                                    emptyRecordMsg={'No user Available'}
                                    avoidHighlightFirstOption={true}
                                    onSelect={(users)=>setAssinTo(users)}
                                    onRemove={(users)=>setAssinTo(users)}
                                />
                            </fieldset>
                            {!isCustomDate &&
                                <fieldset>
                                    <legend>
                                        Priority
                                    </legend>
                                    <select className="title" name="priority" value={formData.priority} onChange={handleFormChange} required>
                                        <option value="" disabled selected >HIGH/MEDIUM/LOW & Pick a Date</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="LOW">LOW</option>
                                        <option value="Custom Date">CUSTOM DATE</option>
                                    </select>
                                </fieldset>
                            }
                            {isCustomDate &&
                                <fieldset>
                                    <legend>
                                        Custom Date
                                    </legend>
                                    <DatePicker
                                        onChange={onChange}
                                        value={value}
                                        required={true}
                                        calendarIcon={null}
                                        clearIcon={null}
                                        openCalendarOnFocus={true}
                                        autoFocus={true}
                                    />
                                    <span title="close calendar" className="calendar-closee" onClick={() => { setIsCustomDate(false); setFormdata({ ...formData, priority: "" }); }}>
                                        &#10006;
                                    </span>
                                </fieldset>}
                            <fieldset>
                                <legend>
                                    Notes/Remarks
                                </legend>
                                <textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Enter Notes (Optional). Maximum 150 Characters" maxLength="150" />
                            </fieldset>
                            <div className="submit-button-container">
                                <input className="submit-button" type="button" value={disable ? "...Saving" : "Save"} disabled={disable} onClick={handleFormSubmit} />
                            </div>
                        </div>

                    </form>

                </div>
                <div className="empty-details-container"></div>
                <FileUploaderListViewer isView={false} setToken={setToken} data={files} handleUpload={handleUpload} handleDelete={handleDelete} module="task" id={undefined} />
            </div>
        )
    );
};

export default CreateTask;