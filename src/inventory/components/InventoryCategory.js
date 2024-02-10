import React, { useEffect, useState } from "react";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import axios from "axios";
import toast from "react-hot-toast";
import InventoryUnit from "./InventoryUnit";
import Gap from "../../common/Gap";

const InventoryCategory = (props) => {
  let { catData, setCatdata, setToken } = props;

  const [edit, changeEdit] = useState({ id: "", isEditable: false });

  const handleSave = async () => {
    if (
      catData.newCat === undefined ||
      catData.newCat.toString().trim().length <= 0
    ) {
      alert("Please Enter Category");
      return;
    }
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/pnm/postCategory",
        { isEditable: edit.isEditable, id: edit.id, name: catData.newCat },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (edit.isEditable) {
          setCatdata((prevState) => {
            let newcategories = prevState.categories.filter((c) => {
              if (c.catID === edit.id) {
                c.catname = prevState.newCat;
              }
              return c;
            });

            return {
              categories: newcategories,
              addVisible: false,
              newCat: "",
            };
          });
          toast.success("Category updated successfully");
        } else {
          setCatdata((prevState) => {
            return {
              categories: [
                ...prevState.categories,
                { catID: res.data.insertId, catname: prevState.newCat },
              ],
              addVisible: false,
              newCat: "",
            };
          });
          toast.success("Category Saved successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Category Addition Failed");
        changeEdit({ id: "", isEditable: false });
      });

    changeEdit({ id: "", isEditable: false });
  };

  const handleEdit = (m) => {
    changeEdit({ id: m.catID, isEditable: true });
    setCatdata((prevState) => {
      return {
        categories: prevState.categories,
        addVisible: true,
        newCat: m.catname,
      };
    });
  };

  const handleDelete = async (cat) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/pnm/deleteCategory",
        { id: cat.catID },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        let updatedData = catData.categories.filter(
          (d) => d.catID != cat.catID
        );

        setCatdata({ categories: updatedData, addVisible: false });
        toast.success("Category " + cat.name + " deleted successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(async () => {
    if (catData && catData.categories && catData.categories.length > 0) return;
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/pnm/categories", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setCatdata({ categories: res.data, addVisible: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.rightContent]);

  useEffect(async () => {
    if (
      props.unitData &&
      props.unitData.unittypes &&
      props.unitData.unittypes.length > 0
    )
      return;
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/pnm/units", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        props.setUnitdata({ unittypes: res.data, addVisible: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.rightContent]);

  return (
    props.rightContent === "Cat&Unit" && (
      <>
        <div className="task-details-box">
          <div className="create-task-container task-details-container">
            <div className="department-heading">
              <span>Category</span>
              <img
                title="Add Department"
                className="dep-plus"
                src={Dep_plus}
                onClick={() => setCatdata({ ...catData, addVisible: true })}
              />
            </div>

            {catData && catData.addVisible && (
              <>
                <div className="dep-adder">
                  <div className="dep-input mat-input">
                    <input
                      name="newCat"
                      type="text"
                      placeholder="Enter Category"
                      value={catData.newCat}
                      onChange={(e) => {
                        setCatdata({ ...catData, newCat: e.target.value });
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
                        setCatdata({ ...catData, addVisible: false })
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
                  {catData
                    ? catData.categories.map((d, index) => (
                        <tr className="dep-tr" key={index}>
                          <td className="name-container">{d.catname}</td>
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
          <Gap />
          <InventoryUnit
            rightContent={props.rightContent}
            unitData={props.unitData}
            setUnitdata={props.setUnitdata}
            setToken={setToken}
          />
        </div>
      </>
    )
  );
};

export default InventoryCategory;
