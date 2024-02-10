import axios from "axios";
import Multiselect from "multiselect-react-dropdown";
import { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import toast from "react-hot-toast";

const Edit = (props) => {
  let {
    task,
    setData,
    projects,
    usersList,
    departments,
    currentUser,
    setToken,
  } = props;
  const [assignTo, setAssinTo] = useState([]);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [submitValue, setSubmitValue] = useState("Save");
  const [value, onChange] = useState(new Date());
  const handleFormChange = (e) => {
    if (e.target.name === "priority" && e.target.value === "Custom Date") {
      setIsCustomDate(true);
      setFormdata({ ...formData, priority: "Custom Date" });
      return;
    }
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };
  const [formData, setFormdata] = useState({
    title: "",
    subject: "",
    project: "",
    assignTo: [],
    priority: "",
    notes: "",
    endDate: "",
    canShowErrors: false,
    id: "",
    assignee: "",
  });

  const formValidation = () => {
    var keys = ["title", "subject", "priority"];
    return keys.some((key) => {
      console.log(formData[key]);
      return formData[key].toString().trim().length == 0;
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (submitValue !== "Save") return;
    if (formValidation() || assignTo.length <= 0) {
      setFormdata({ ...formData, canShowErrors: true });
      return;
    } else {
      setFormdata({ ...formData, canShowErrors: false });
    }

    if (formData.priority === "Custom Date") {
      formData["endDate"] =
        value.getFullYear().toString() +
        "-" +
        (value.getMonth() + 1).toString() +
        "-" +
        value.getDate().toString();
    } else {
      formData["endDate"] = null;
    }

    let d = new Date(
      new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
    );
    formData["assignDate"] =
      d.getFullYear().toString() +
      "-" +
      (d.getMonth() + 1).toString() +
      "-" +
      d.getDate().toString();
    formData["assignTime"] =
      d.getHours().toString() +
      ":" +
      d.getMinutes().toString() +
      ":" +
      d.getSeconds().toString();
    formData.assignTo = assignTo;
    setSubmitValue("...Saving");
    axios
      .post(process.env.REACT_APP_API_ENDPOINT + "/tasks/editTask", formData, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prevState) => {
          let updatedTask = task;
          updatedTask.title = formData.title;
          updatedTask.subject = formData.subject;
          updatedTask.project = formData.project;
          updatedTask.userNames = assignTo
            .map((user) => user.userName)
            .join(",");
          updatedTask.priority = formData.priority;
          updatedTask.endDate = formData.endDate;
          updatedTask.notes = formData.notes;
          updatedTask.assignDate = formData.assignDate;
          updatedTask.assignTime = formData.assignTime;
          let updatedData = prevState.tasks.filter((t) => {
            if (t.id === task.id) {
              t = updatedTask;
              t.history.unshift({
                moduleID: formData.id,
                action: "Edited",
                dateAndTime: d.toLocaleString(),
                name: formData.assignee,
              });
            }
            return t;
          });
          return {
            tasks: updatedData,
            rightContent: "Details",
            currentTask: updatedTask,
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
        toast.success("Task Updated successfully");
        setSubmitValue("Save");
      })
      .catch((err) => {
        console.log(err);
        setSubmitValue("Save");
        toast.error("Task Updation Failed");
      });
  };

  useEffect(() => {
    if (props.rightContent !== "Edit") return;
    setAssinTo(
      usersList.filter(
        (user) => task.userNames && task.userNames.includes(user.userName)
      )
    );
    if (task.priority === "Custom Date") {
      setIsCustomDate(true);
      onChange(new Date(task.endDate));
    } else {
      setIsCustomDate(false);
      onChange();
    }
    setFormdata({
      title: task.title,
      subject: task.subject,
      project: task.project,
      assignTo: [],
      priority: task.priority,
      notes: task.notes,
      canShowErrors: false,
      endDate: task.endDate,
      id: task.id,
      assignee: currentUser.username,
    });
  }, [task, props.rightContent]);

  return (
    props.rightContent === "Edit" && (
      <div className="task-details-box">
        <div className="create-task-container task-details-container">
          <form name="taskForm" autoComplete="off">
            <div className="form-container">
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
                <legend>Department/Section</legend>
                <select
                  className="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled selected>
                    Select /Add Department
                  </option>
                  {props.departments
                    ? props.departments.departments.map((d) => (
                        <option value={d.name}>{d.name}</option>
                      ))
                    : ""}
                </select>
              </fieldset>
              <fieldset>
                <legend>Subject</legend>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Enter Subject MAX 75 characters"
                  maxLength="75"
                />
              </fieldset>
              <fieldset>
                <legend>Project Related</legend>
                <select
                  className="title"
                  name="project"
                  value={formData.project}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled selected>
                    Select Project (Optional)
                  </option>
                  <option value="">--Optional--</option>
                  {projects && projects.length > 0
                    ? projects.map((p) => (
                        <option value={p.name}>{p.name}</option>
                      ))
                    : ""}
                </select>
              </fieldset>
              <fieldset>
                <legend>AssignTo</legend>
                <Multiselect
                  showCheckbox={true}
                  id="userID"
                  options={usersList}
                  displayValue="userName"
                  placeholder="Select Employee"
                  selectionLimit={4}
                  emptyRecordMsg={"No user Available"}
                  avoidHighlightFirstOption={true}
                  onSelect={(users) => setAssinTo(users)}
                  onRemove={(users) => setAssinTo(users)}
                  selectedValues={usersList.filter((user) =>
                    task.userNames.includes(user.userName)
                  )}
                />
              </fieldset>
              {!isCustomDate && (
                <fieldset>
                  <legend>Priority</legend>
                  <select
                    className="title"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" disabled selected>
                      HIGH/MEDIUM/LOW & Pick a Date
                    </option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="Custom Date">CUSTOM DATE</option>
                  </select>
                </fieldset>
              )}
              {isCustomDate && (
                <fieldset>
                  <legend>Custom Date</legend>
                  <DatePicker
                    onChange={onChange}
                    value={value}
                    required={true}
                    calendarIcon={null}
                    clearIcon={null}
                    openCalendarOnFocus={true}
                    autoFocus={true}
                  />
                  <span
                    title="close calendar"
                    className="calendar-closee"
                    onClick={() => {
                      setIsCustomDate(false);
                      setFormdata({ ...formData, priority: "" });
                    }}
                  >
                    &#10006;
                  </span>
                </fieldset>
              )}
              <fieldset>
                <legend>Notes/Remarks</legend>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Enter Notes (Optional). Maximum 150 Characters"
                  maxLength="150"
                />
              </fieldset>
              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={submitValue}
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

export default Edit;
