import React, { useEffect, useState } from "react";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import axios from "axios";
import toast from "react-hot-toast";

const MaterialUnit = (props) => {
  let { unitData, setUnitdata, setToken } = props;

  const [edit, changeEdit] = useState({ id: "", isEditable: false });

  useEffect(async () => {
    if (unitData && unitData.unittypes && unitData.unittypes.length > 0) return;
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/pnm/units", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setUnitdata({ unittypes: res.data, addVisible: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.rightContent]);

  const handleSave = async () => {
    if (unitData.newUnit === undefined || unitData.newUnit.trim().length <= 0) {
      alert("Please Enter Unit Type");
      return;
    }

    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/pnm/postUnit",
        { isEditable: edit.isEditable, id: edit.id, name: unitData.newUnit },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (edit.isEditable) {
          setUnitdata((prevState) => {
            let newunittypes = prevState.unittypes.filter((c) => {
              if (c.unitID === edit.id) {
                c.unitname = prevState.newUnit;
              }
              return c;
            });

            return {
              unittypes: newunittypes,
              addVisible: false,
              newUnit: "",
            };
          });
          toast.success("Unit updated successfully");
          changeEdit({ id: "", isEditable: false });
        } else {
          setUnitdata((prevState) => {
            return {
              unittypes: [
                ...prevState.unittypes,
                { unitID: res.data.insertId, unitname: prevState.newUnit },
              ],
              addVisible: false,
              newUnit: "",
            };
          });
          toast.success("Unit Saved successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Unit Addition Failed");
        changeEdit({ id: "", isEditable: false });
      });
  };

  const handleEdit = (u) => {
    changeEdit({ id: u.unitID, isEditable: true });
    setUnitdata((prevState) => {
      return {
        unittypes: prevState.unittypes,
        addVisible: true,
        newUnit: u.unitname,
      };
    });
  };

  const handleDelete = async (unit) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/pnm/deleteUnit",
        { id: unit.unitID },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        let updatedData = unitData.unittypes.filter(
          (d) => d.unitID != unit.unitID
        );
        setUnitdata({ unittypes: updatedData, addVisible: false });
        toast.success("Unit " + unit.unitname + " deleted successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    props.rightContent === "Unit info" && (
      <div className="task-details-box">
        <div className="create-task-container task-details-container">
          <div className="department-heading">
            <span>Add Unit Type</span>

            <img
              title="Add Department"
              className="dep-plus"
              src={Dep_plus}
              onClick={() => setUnitdata({ ...unitData, addVisible: true })}
            />
          </div>

          {unitData && unitData.addVisible && (
            <>
              <div className="dep-adder">
                <div className="dep-input mat-input">
                  <input
                    name="newunit"
                    type="text"
                    placeholder="Enter Unit type"
                    value={unitData.newUnit}
                    onChange={(e) => {
                      setUnitdata({ ...unitData, newUnit: e.target.value });
                    }}
                  ></input>
                </div>

                <div className="dep-add-button">
                  <button className="save-button" onClick={handleSave}>
                    Save
                  </button>

                  <span
                    title="Close"
                    className="calendar-closee in-dep"
                    onClick={() =>
                      setUnitdata({ ...unitData, addVisible: false })
                    }
                  >
                    &#10006;
                  </span>
                </div>
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
                {unitData
                  ? unitData.unittypes.map((d, index) => (
                      <tr className="dep-tr" key={index}>
                        <td className="name-container">{d.unitname}</td>
                        <td className="dep-small-td">
                          <span
                            style={{ backgroundColor: d.colour }}
                            className="color-backg"
                          ></span>
                        </td>
                        <td className="dep-small-td">
                          <img
                            title="Edit"
                            className="dep-img"
                            onClick={() => handleEdit(d)}
                            src={Edit_Button}
                          />
                        </td>
                        <td className="dep-small-td">
                          <img
                            className="dep-img"
                            title="Delete"
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

export default MaterialUnit;
