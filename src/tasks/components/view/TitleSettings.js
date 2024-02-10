import { useEffect, useRef, useState } from "react";
import "../../css/department.css";
import Dep_plus from "../../assets/dep-plus.png";
import Edit_Button from "../../assets/edit-but.png";
import Delete_Button from "../../assets/delete-but.png";
import "react-color-palette/lib/css/styles.css";
import { ColorPicker, useColor } from "react-color-palette";
import toast from "react-hot-toast";
import axios from "axios";
import Colors from "../helpers/Colors";
import { getConfirmation } from "../../../common/DialogBox";

const TitleSettings = (props) => {
  let { taskContainer, settaskContainer, loading, setToken } = props;
  const [edit, changeEdit] = useState({ id: "", isEditable: false });
  const [color, setColor] = useColor("hex", "#121212");
  const handleSave = async () => {
    if (
      taskContainer.newContainer == undefined ||
      taskContainer.newContainer.trim().length <= 0
    ) {
      alert("Please Enter Title");
      return;
    }
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/tasks/postTitle",
        {
          isEditable: edit.isEditable,
          id: edit.id,
          name: taskContainer.newContainer,
          color: color.hex,
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        Colors[taskContainer.newContainer] = color.hex;
        if (edit.isEditable) {
          settaskContainer((prevState) => {
            let updatedContainer = prevState.containers.filter((d) => {
              if (d.titleID === edit.id) {
                d.name = prevState.newContainer;
                d.colour = color.hex;
              }
              return d;
            });
            return {
              containers: updatedContainer,
              addVisible: false,
              newContainer: "",
            };
          });
          toast.success("Title updated successfully");
        } else {
          settaskContainer((prevState) => {
            return {
              containers: [
                ...prevState.containers,
                {
                  titleID: res.data.insertId,
                  name: prevState.newContainer,
                  colour: color.hex,
                  isEditable: 1,
                  isDeleteable: 1,
                },
              ],
              addVisible: false,
              newContainer: "",
            };
          });
          toast.success("Title saved successfully");
        }
        changeEdit({ id: "", isEditable: false });
      })
      .catch((err) => {
        console.log(err);
        changeEdit({ id: "", isEditable: false });
      });
  };

  const handleDelete = async (con) => {
    await getConfirmation("You want to delete?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/tasks/deleteTitle",
          { id: con.titleID },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          let updatedData = taskContainer.containers.filter(
            (d) => d.titleID != con.titleID
          );
          settaskContainer({ containers: updatedData, addVisible: false });
          toast.success("Title " + con.name + " deleted successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  const handleEdit = (d) => {
    setColor({ ...color, hex: d.colour });
    changeEdit({ id: d.titleID, isEditable: true });
    settaskContainer((prevState) => {
      return {
        containers: prevState.containers,
        addVisible: true,
        newContainer: d.name,
      };
    });
  };
  useEffect(async () => {
    loading({ visibility: true, message: "Loading Categories..." });
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/tasks/titles", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        res.data.forEach((element) => {
          Colors[element.name] = element.colour;
        });
        settaskContainer({ containers: res.data, addVisible: false });
        loading({ visibility: false, message: "" });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false, message: "" });
      });
  }, []);
  return (
    props.rightContent === "Title Settings" && (
      <div className="task-details-box">
        <div className="task-details-container">
          <div className="department-heading">
            <span>Add Titles</span>
            <img
              title="Add Title"
              className="dep-plus"
              src={Dep_plus}
              onClick={() =>
                settaskContainer({ ...taskContainer, addVisible: true })
              }
            />
          </div>
          {taskContainer && taskContainer.addVisible && (
            <>
              <div className="dep-adder">
                <div className="dep-input">
                  <input
                    name="newDep"
                    type="text"
                    placeholder="Enter Title"
                    value={taskContainer.newContainer}
                    onChange={(e) =>
                      settaskContainer({
                        ...taskContainer,
                        newContainer: e.target.value,
                      })
                    }
                  ></input>
                </div>
                <div className="dep-color">
                  <span
                    style={{ backgroundColor: color.hex }}
                    className="color-backg dep-backg"
                  ></span>
                </div>

                <div className="dep-add-button">
                  <button className="save-button" onClick={handleSave}>
                    Save
                  </button>
                  <span
                    title="Close"
                    className="calendar-closee in-dep"
                    onClick={() =>
                      settaskContainer({ ...taskContainer, addVisible: false })
                    }
                  >
                    &#10006;
                  </span>
                </div>
              </div>
              <div className="dep-adder">
                <ColorPicker
                  width={250}
                  height={100}
                  color={color}
                  onChange={setColor}
                  hideHSV
                  dark
                />
              </div>
            </>
          )}
          <div className="dep-table">
            <table
              className="equalDivide"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              border="0"
            >
              {console.log(taskContainer)}
              <tbody>
                {taskContainer
                  ? taskContainer.containers.map((d, index) => (
                      <tr className="dep-tr" key={index}>
                        <td className="name-container">{d.name}</td>
                        <td className="dep-small-td">
                          <span
                            style={{ backgroundColor: d.colour }}
                            className="color-backg"
                          ></span>
                        </td>
                        <td
                          style={{
                            display: d.isEditable === 1 ? "table-cell" : "none",
                          }}
                          className="dep-small-td"
                        >
                          <img
                            title="Edit"
                            className="dep-img"
                            onClick={() => handleEdit(d)}
                            src={Edit_Button}
                          />
                        </td>
                        <td
                          style={{
                            display:
                              d.isDeleteable === 1 ? "table-cell" : "none",
                          }}
                          className="dep-small-td"
                        >
                          <img
                            title="Delete"
                            className="dep-img"
                            src={Delete_Button}
                            onClick={() => handleDelete(d)}
                          />
                        </td>
                      </tr>
                    ))
                  : ""}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  );
};
export default TitleSettings;
