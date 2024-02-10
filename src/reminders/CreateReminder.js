import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import FileUploaderListViewer from "../common/FileUploaderListViewer";
import Multiselect from "multiselect-react-dropdown";
import DateTimePicker from "react-datetime-picker";
import DatePicker from "react-date-picker";
import Open from "../assets/images/next.png";
import AuthorizedContact from "./AuthorizedContact";
import Dep_plus from "../tasks/assets/dep-plus.png";
import Gap from "../common/Gap";
import Select from "react-select";

const CreateReminder = (props) => {
  let {
    usersList,
    setUsersList,
    setToken,
    setData,
    setCurrentReminder,
    setRightContent,
  } = props;
  const [files, setFiles] = useState([]);
  const [assignTo, setAssinTo] = useState([]);
  const [openAuthorizedContact, setOpenAuthorizedContact] = useState(false);
  const [openSecondContact, setOpenSecondContact] = useState(false);
  let emptyContact = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "971",
  };
  const [contact1, setContact1] = useState(emptyContact);
  const [contact2, setContact2] = useState(emptyContact);

  const handleContact1Chnage = (e) => {
    setContact1({ ...contact1, [e.target.name]: e.target.value });
  };

  const handleContact2Chnage = (e) => {
    setContact2({ ...contact2, [e.target.name]: e.target.value });
  };

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  };
  const ref = useRef(null);
  const handleDelete = (id) => {
    setFiles((prev) => {
      let f = prev.filter((file) => file.fileID !== id);
      return f;
    });
  };
  const [disable, submitDisable] = useState(false);
  let emptyForm = {
    type: "",
    title: "",
    assignTo: [],
    be_fore: "10",
    beforeType: "mints",
    inter_val: "",
    notes: "",
    contacts: [],
    assignee: props.currentUser.username,
    history: [],
    canShowErrors: false,
  };
  const [formData, setFormdata] = useState(emptyForm);
  const handleFormChange = (e) => {
    setFormdata({
      ...formData,
      [e.target.name]: e.target.value,
      canShowErrors: false,
    });
  };
  const formValidation = () => {
    var keys = ["title", "type", "inter_val", "be_fore", "beforeType"];
    return keys.some((key) => {
      return formData[key].toString().trim().length === 0;
    });
  };
  const handleFormSubmit = (e) => {
    submitDisable(true);
    e.preventDefault();
    if (formValidation() || value === undefined) {
      setFormdata({ ...formData, canShowErrors: true });
      submitDisable(false);
      ref.current.scrollTop = 0;
      return;
    } else {
      setFormdata({ ...formData, canShowErrors: false });
    }

    let d = new Date(
      new Date(value).toLocaleString("en-US", {
        timeZone: props.currentUser.timeZone,
      })
    );
    formData["remDate"] =
      d.getFullYear().toString() +
      "-" +
      (d.getMonth() + 1).toString() +
      "-" +
      d.getDate().toString();
    if (NoTime) {
      formData["remTime"] = "00:00:00";
      formData["noTime"] = 1;
    } else {
      formData["remTime"] =
        d.getHours().toString() +
        ":" +
        d.getMinutes().toString() +
        ":" +
        d.getSeconds().toString();
      formData["noTime"] = 0;
    }

    if (JSON.stringify(contact1) !== JSON.stringify(emptyContact)) {
      formData.contacts.push(contact1);
    }
    if (JSON.stringify(contact2) !== JSON.stringify(emptyContact)) {
      formData.contacts.push(contact2);
    }
    formData["messages"] = 0;
    formData["attachments"] = files;
    formData["attachmentsCount"] = files.length;
    formData["conversations"] = [];
    formData["orgID"] = props.currentUser.orgID;
    formData.assignTo = assignTo;
    formData.contacts = [...new Set(formData.contacts)];
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/createReminder?" +
          props.currentUser.timeZone,
        formData,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        formData["id"] = res.data.insertId;
        formData["userNames"] = assignTo.map((user) => user.userName).join(",");
        formData.history.unshift({
          moduleID: formData.id,
          action: "Added",
          dateAndTime: new Date(
            new Date().toLocaleString("en-US", {
              timeZone: props.currentUser.timeZone,
            })
          ).toLocaleString(),
          name: formData.assignee,
        });
        setCurrentReminder(formData);
        setData((prev) => [formData, ...prev]);
        setRightContent("Details");
        toast.success("Reminder created successfully");
        submitDisable(false);
        setFormdata(emptyForm);
        setContact1(emptyContact);
        setContact2(emptyContact);
        setFiles([]);
        setOpenAuthorizedContact(false);
        setOpenSecondContact(false);
        setAssinTo([]);
        onChange();
        setNoTime(false);
      })
      .catch((err) => {
        console.log(err);
        submitDisable(false);
        toast.error("Reminder creation failed");
      });
  };

  useEffect(async () => {
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/tasks/usersList?orgID=" +
          props.currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setUsersList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const [value, onChange] = useState();
  const [NoTime, setNoTime] = useState(false);
  return (
    props.rightContent === "Create" && (
      <div className="task-details-box" ref={ref}>
        <div className="create-task-container task-details-container">
          <form name="taskForm" autoComplete="off">
            <div className="task-form-container">
              {formData.canShowErrors ? (
                <div>
                  <span class="warning-text-error warning-text">
                    Please fill out all the fileds{" "}
                  </span>
                </div>
              ) : (
                ""
              )}
              <fieldset>
                <legend>Type</legend>
                <Select
                  isLoading={props.typeData.departments.length <= 0}
                  isSearchable={true}
                  placeholder={"Select Reminder Type"}
                  name="type"
                  onChange={(selected) =>
                    setFormdata({
                      ...formData,
                      type: selected.value,
                      canShowErrors: false,
                    })
                  }
                  options={props.typeData.departments.map((p) => {
                    return { value: p.name, label: p.name };
                  })}
                />
              </fieldset>
              <fieldset>
                <legend>Title Name</legend>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter Title MAX 75 characters"
                  maxLength="50"
                />
              </fieldset>

              <fieldset>
                <legend>AssignTo</legend>
                <Multiselect
                  showCheckbox={true}
                  id="userID"
                  options={usersList}
                  displayValue="userName"
                  placeholder="Assign someone to get the Reminder (optional)"
                  selectionLimit={4}
                  emptyRecordMsg={"No user Available"}
                  avoidHighlightFirstOption={true}
                  onSelect={(users) => setAssinTo(users)}
                  onRemove={(users) => setAssinTo(users)}
                />
              </fieldset>
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "72%" }}>
                  <fieldset className="rem-date-time">
                    <legend>Reminder Date {!NoTime && "& Time"}</legend>
                    {NoTime ? (
                      <DatePicker
                        dayPlaceholder="DD"
                        monthPlaceholder="MM"
                        yearPlaceholder="YYYY"
                        onChange={onChange}
                        value={value}
                        required={true}
                        calendarIcon={null}
                        clearIcon={null}
                      />
                    ) : (
                      <DateTimePicker
                        dayPlaceholder="DD"
                        monthPlaceholder="MM"
                        yearPlaceholder="YYYY"
                        hourPlaceholder="hh"
                        minutePlaceholder="mm"
                        secondPlaceholder="ss"
                        onChange={onChange}
                        value={value}
                        required={true}
                        calendarIcon={null}
                        clearIcon={null}
                        openCalendarOnFocus={false}
                        // disableClock={false} //true if u want to show clock
                      />
                    )}
                  </fieldset>
                </div>
                <div style={{ width: "28%", position: "relative" }}>
                  <span className="time-req-span">
                    <label className="rem-label">No Time</label>{" "}
                    <input
                      className="input-checkkbox-permissions rem-chk-box"
                      type="checkbox"
                      onChange={(e) => {
                        setNoTime(e.target.checked);
                      }}
                      checked={NoTime}
                    />
                  </span>
                </div>
              </div>
              <fieldset style={{ display: "flex", width: "72%" }}>
                <legend>Remind Before</legend>
                <input
                  type="number"
                  name="be_fore"
                  step={1}
                  value={formData.be_fore}
                  onChange={handleFormChange}
                  placeholder="Enter "
                  maxLength="50"
                  style={{ width: "70%" }}
                />
                <select
                  className="title"
                  name="beforeType"
                  value={formData.beforeType}
                  onChange={handleFormChange}
                  required
                  style={{ width: "30%" }}
                >
                  <option value="mints">Mints</option>
                  <option value="hrs">Hrs</option>
                  <option value="days">Days</option>
                </select>
              </fieldset>
              <fieldset>
                <legend>Repeat Interval</legend>
                <Select
                  isSearchable={true}
                  placeholder={"None / Daily / Monthly / Quarterly / Yearly"}
                  name="inter_val"
                  onChange={(selected) =>
                    setFormdata({
                      ...formData,
                      inter_val: selected.value,
                      canShowErrors: false,
                    })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "daily", label: "Daily" },
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                />
              </fieldset>
              <fieldset>
                <legend>Notes</legend>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Enter Notes (Optional). Maximum 150 Characters"
                  maxLength="150"
                />
              </fieldset>
              <div className="financial-details-Box">
                <div
                  className="financial-box-header"
                  onClick={() => {
                    setOpenAuthorizedContact(!openAuthorizedContact);
                  }}
                >
                  Authorized Contact
                </div>
                <div className="finacial-box-image-container">
                  <img
                    style={
                      openAuthorizedContact
                        ? { transform: "rotate(90deg)" }
                        : {}
                    }
                    src={Open}
                    onClick={() => {
                      setOpenAuthorizedContact(!openAuthorizedContact);
                    }}
                    alt=""
                  />
                </div>
              </div>

              {openAuthorizedContact ? (
                openSecondContact ? (
                  <>
                    <AuthorizedContact
                      contact={contact1}
                      handleContactChnage={handleContact1Chnage}
                      setContact={setContact1}
                    />
                    <Gap />
                    <AuthorizedContact
                      contact={contact2}
                      handleContactChnage={handleContact2Chnage}
                      setContact={setContact2}
                    />
                  </>
                ) : (
                  <>
                    <AuthorizedContact
                      contact={contact1}
                      handleContactChnage={handleContact1Chnage}
                      setContact={setContact1}
                    />
                    <div style={{ paddingBottom: "1.3vh" }}>
                      <img
                        title="Add One More Contact"
                        style={{ width: "1.25vw" }}
                        src={Dep_plus}
                        onClick={() => setOpenSecondContact(true)}
                        alt=""
                      />
                    </div>
                  </>
                )
              ) : (
                ""
              )}
              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={disable ? "...Saving" : "Save"}
                  disabled={disable}
                  onClick={handleFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="empty-details-container"></div>
        <FileUploaderListViewer
          isView={false}
          setToken={setToken}
          data={files}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="rem"
          id={undefined}
        />
      </div>
    )
  );
};

export default CreateReminder;
