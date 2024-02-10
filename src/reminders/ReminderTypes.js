import { useEffect, useRef, useState } from "react";
import Dep_plus from "../tasks/assets/dep-plus.png";
import Edit_Button from "../tasks/assets/edit-but.png";
import Delete_Button from "../tasks/assets/delete-but.png";
import { ColorPicker, useColor } from "react-color-palette";
import toast from "react-hot-toast";
import axios from "axios";
import Colors from "./Colors";
import { getConfirmation } from "../common/DialogBox";

const ReminderTypes = (props) => {
  let { depData, setDepdata, setToken } = props;
  const [edit, changeEdit] = useState({ id: "", isEditable: false });
  const [color, setColor] = useColor("hex", "#121212");
  const handleSave = async () => {
    if (depData.newDep === undefined || depData.newDep.trim().length <= 0) {
      alert("Please Enter Reminder Type");
      return;
    }
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/rem/postReminderType",
        {
          isEditable: edit.isEditable,
          id: edit.id,
          name: depData.newDep,
          color: color.hex,
        },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        Colors[depData.newDep] = color.hex;
        if (edit.isEditable) {
          setDepdata((prevState) => {
            let updatedDep = prevState.departments.filter((d) => {
              if (d.depID === edit.id) {
                d.name = prevState.newDep;
                d.colour = color.hex;
              }
              return d;
            });
            console.log(updatedDep);
            return {
              departments: updatedDep,
              addVisible: false,
              newDep: "",
            };
          });
          toast.success("Reminder Type updated successfully");
        } else {
          setDepdata((prevState) => {
            return {
              departments: [
                ...prevState.departments,
                {
                  depID: res.data.insertId,
                  name: prevState.newDep,
                  colour: color.hex,
                  isEditable: 1,
                  isDeleteable: 1,
                },
              ],
              addVisible: false,
              newDep: "",
            };
          });
          toast.success("Reminder Type saved successfully");
        }
        changeEdit({ id: "", isEditable: false });
      })
      .catch((err) => {
        console.log(err);
        changeEdit({ id: "", isEditable: false });
      });
  };

  const handleDelete = async (dep) => {
    await getConfirmation("You want to delete Reminder Type?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/rem/deleteType",
          { id: dep.depID },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          let updatedData = depData.departments.filter(
            (d) => d.depID != dep.depID
          );
          setDepdata({ departments: updatedData, addVisible: false });
          toast.success("Reminder Type " + dep.name + " deleted successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  const handleEdit = (d) => {
    setColor({ ...color, hex: d.colour });
    changeEdit({ id: d.depID, isEditable: true });
    setDepdata((prevState) => {
      return {
        departments: prevState.departments,
        addVisible: true,
        newDep: d.name,
      };
    });
  };
  useEffect(async () => {
    if (depData && depData.departments && depData.departments.length > 0)
      return;
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/rem/remTypes", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        res.data.forEach((element) => {
          Colors[element.name] = element.colour;
        });
        setDepdata({ departments: res.data, addVisible: false });
        console.log(Colors);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.rightContent]);
  return (
    props.rightContent === "Type" && (
      <div className="task-details-box">
        <div className="task-details-container">
          <div className="department-heading">
            <span>Add Type</span>
            <img
              title="Add Reminder Type"
              className="dep-plus"
              src={Dep_plus}
              onClick={() => setDepdata({ ...depData, addVisible: true })}
              alt=""
            />
          </div>
          {depData && depData.addVisible && (
            <>
              <div className="dep-adder">
                <div className="dep-input">
                  <input
                    name="newDep"
                    type="text"
                    placeholder="Enter Reminder Type"
                    value={depData.newDep}
                    onChange={(e) =>
                      setDepdata({ ...depData, newDep: e.target.value })
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
                      setDepdata({ ...depData, addVisible: false })
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
              <tbody>
                {depData
                  ? depData.departments.map((d, index) => (
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
export default ReminderTypes;
