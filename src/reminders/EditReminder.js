import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-date-picker";
import DateTimePicker from "react-datetime-picker";
import Gap from "../common/Gap";
import AuthorizedContact from "./AuthorizedContact";
import Dep_plus from "../tasks/assets/dep-plus.png";
import Open from "../assets/images/next.png";
import Multiselect from "multiselect-react-dropdown";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import Select from "react-select";

const EditReminder = ({
  rightContent,
  currentReminder,
  typeData,
  usersList,
  setToken,
  setData,
  setRightContent,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [formData, setFormdata] = useState({});
  let emptyContact = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "971",
  };
  const ref = useRef(null);
  const [value, onChange] = useState();
  const [NoTime, setNoTime] = useState(false);
  const [contact1, setContact1] = useState(emptyContact);
  const [contact2, setContact2] = useState(emptyContact);
  const [openAuthorizedContact, setOpenAuthorizedContact] = useState(false);
  const [openSecondContact, setOpenSecondContact] = useState(false);
  const [assignTo, setAssinTo] = useState([]);
  const [disable, submitDisable] = useState(false);
  const handleFormChange = (e) => {
    setFormdata({
      ...formData,
      [e.target.name]: e.target.value,
      canShowErrors: false,
    });
  };

  const handleContact1Chnage = (e) => {
    setContact1({ ...contact1, [e.target.name]: e.target.value });
  };

  const handleContact2Chnage = (e) => {
    setContact2({ ...contact2, [e.target.name]: e.target.value });
  };

  const formValidation = () => {
    var keys = ["title", "type", "inter_val", "be_fore", "beforeType"];
    return keys.some((key) => {
      return formData[key].toString().trim().length === 0;
    });
  };

  useEffect(async () => {
    if (rightContent != "Edit" || currentReminder == undefined) return;
    setOpenAuthorizedContact(false);
    setAssinTo(
      usersList.filter(
        (user) =>
          currentReminder.userNames &&
          currentReminder.userNames.includes(user.userName)
      )
    );
    setFormdata(currentReminder);
    if (currentReminder.noTime === 1) {
      setNoTime(true);
    } else {
      setNoTime(false);
    }
    onChange(
      moment(
        currentReminder.remDate + " " + currentReminder.remTime,
        "YYYY-MM-DD HH:mm:ss"
      ).toDate()
    );
    if (currentReminder.contacts && currentReminder.contacts.length > 0) {
      setContact1(currentReminder.contacts[0]);
      if (currentReminder.contacts.length > 1) {
        setContact2(currentReminder.contacts[1]);
        setOpenSecondContact(true);
      } else {
        setContact2(emptyContact);
        setOpenSecondContact(false);
      }
      return;
    }
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/contacts?ID=" +
          currentReminder.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data && res.data.length > 0) {
          setContact1(res.data[0]);
          if (res.data.length > 1) {
            setContact2(res.data[1]);
            setOpenSecondContact(true);
          } else {
            setContact2(emptyContact);
            setOpenSecondContact(false);
          }
        } else {
          setContact1(emptyContact);
          setOpenAuthorizedContact(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [rightContent, currentReminder]);

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
        timeZone: currentUser.timeZone,
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
    formData.contacts = [];
    if (JSON.stringify(contact1) !== JSON.stringify(emptyContact)) {
      formData.contacts.push(contact1);
    }
    if (JSON.stringify(contact2) !== JSON.stringify(emptyContact)) {
      formData.contacts.push(contact2);
    }
    formData.assignTo = assignTo;
    formData.contacts = [...new Set(formData.contacts)];
    axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/rem/updateReminder?" +
          currentUser.timeZone,
        formData,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        formData["userNames"] = assignTo.map((user) => user.userName).join(",");
        formData.history.unshift({
          moduleID: formData.id,
          action: "Edited",
          dateAndTime: new Date(
            new Date().toLocaleString("en-US", {
              timeZone: currentUser.timeZone,
            })
          ).toLocaleString(),
          name: formData.assignee,
        });
        setData((prev) => {
          let updateData = prev.filter((cust) => {
            if (cust.id === currentReminder.id) {
              Object.keys(formData).forEach((key) => {
                cust[key] = formData[key];
              });
            }
            return cust;
          });
          return updateData;
        });

        setRightContent("Details");
        toast.success("Reminder Updated successfully");
        submitDisable(false);
        setOpenAuthorizedContact(false);
        setOpenSecondContact(false);
        setAssinTo([]);
        onChange();
        setNoTime(false);
        setFormdata({});
      })
      .catch((err) => {
        console.log(err);
        submitDisable(false);
        toast.error("Reminder Updation failed");
      });
  };

  return (
    rightContent === "Edit" && (
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
                  isLoading={typeData.departments.length <= 0}
                  isSearchable={true}
                  defaultValue={{
                    value: currentReminder.type,
                    label: currentReminder.type,
                  }}
                  placeholder={"Select Reminder Type"}
                  name="type"
                  onChange={(selected) =>
                    setFormdata({
                      ...formData,
                      type: selected.value,
                      canShowErrors: false,
                    })
                  }
                  options={typeData.departments.map((p) => {
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
                  selectedValues={usersList.filter((user) =>
                    currentReminder.userNames.includes(user.userName)
                  )}
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
                  defaultValue={{
                    value: currentReminder.inter_val,
                    label:
                      currentReminder.inter_val.charAt(0).toUpperCase() +
                      currentReminder.inter_val.slice(1),
                  }}
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
      </div>
    )
  );
};

export default EditReminder;
