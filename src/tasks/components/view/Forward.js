import axios from "axios";
import Multiselect from "multiselect-react-dropdown";
import { useState } from "react";
import toast from "react-hot-toast";

const Forward = (props) => {
  let { usersList, currentTask, setData, setToken } = props;
  const [error, showError] = useState(false);
  const [assignTo, setAssinTo] = useState([]);
  const handleForward = async () => {
    if (assignTo && assignTo.length == 0) {
      showError(true);
      return;
    }
    showError(false);
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/tasks/forward",
        { users: assignTo, taskID: currentTask.id },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prevState) => {
          let updatedData = prevState.tasks.filter((task) => {
            if (task.id === prevState.currentTask.id) {
              task.userNames = assignTo.map((user) => user.userName).join(",");
            }
            return task;
          });

          return {
            tasks: prevState.tasks,
            rightContent: "Details",
            currentTask: prevState.currentTask,
            category: prevState.category,
            isScrollButtonVisible: prevState.isScrollButtonVisible,
          };
        });
        toast.success("Task forwarded successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Task forward Failed");
      });
  };

  return (
    props.rightContent === "Forward" &&
    currentTask.userNames &&
    usersList && (
      <div className="create-task-container task-details-container">
        {error ? (
          <div>
            <span class="warning-text-error warning-text">
              Please select Employee{" "}
            </span>
          </div>
        ) : (
          ""
        )}
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
            disablePreSelectedValues={true}
            selectedValues={usersList.filter((user) =>
              currentTask.userNames.includes(user.userName)
            )}
          />
        </fieldset>
        <div className="submit-button-container">
          <input
            className="submit-button"
            type="button"
            value="Forward"
            onClick={handleForward}
          />
        </div>
      </div>
    )
  );
};
export default Forward;
