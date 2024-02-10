import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import axios from "axios";
import toast from "react-hot-toast";

const EstimateCategorySettings = ({
  Trigger_Button,
  materials,
  setMaterials,
  setToken,
}) => {
  const [categories, setCategories] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let emptyFormData = {
    category: "",
    sellingPercentage: "",
  };
  const [formData, setFormData] = useState(emptyFormData);
  const [editFormData, setEditFormData] = useState(emptyFormData);
  const [save, setSave] = useState("Save");
  const handlePopupOpen = () => {
    setFormData(emptyFormData);
    setIsEdit(false);
    setAddVisible(false);
    let catgs = materials
      .filter((m) => m.marginType === "percentage")
      .map((m) => {
        return {
          category: m.category,
          sellingPercentage: m.sellingPercentage,
        };
      });
    let distinctCategories = [...new Set(catgs.map((m) => m.category))];
    let finalCats = [];
    if (distinctCategories && distinctCategories.length) {
      distinctCategories.forEach((cat) => {
        let categ = catgs.find((c) => c.category === cat);
        if (categ) {
          let isAllSame = catgs
            .filter((c) => c.category === categ.category)
            .every((c) => c.sellingPercentage === categ.sellingPercentage);
          if (isAllSame) {
            finalCats.push(categ);
          } else {
            finalCats.push({ ...categ, sellingPercentage: "NIL" });
          }
        }
      });
    }
    finalCats.sort((a, b) => a.category.localeCompare(b.category));
    setCategories(finalCats);
  };
  const handleEdit = (cat) => {
    setFormData(cat);
    setIsEdit(true);
    setAddVisible(true);
    setEditFormData(cat);
  };
  const handleCancel = () => {
    setIsEdit(false);
    setFormData(emptyFormData);
    setAddVisible(false);
    setEditFormData(emptyFormData);
  };
  const handleAdd = () => {
    setIsEdit(false);
    setFormData(emptyFormData);
    setAddVisible(true);
    setEditFormData(emptyFormData);
  };
  const handleSave = async (close) => {
    let prodIDs = [];
    if (isEdit) {
      prodIDs = materials
        .filter((c) => c.category === editFormData.category)
        .map((c) => c.prodID);
      if (prodIDs.length === 0) {
        toast.error("Something Went Wrong!!!");
        handleCancel();
      }
    }
    setSave("....");
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/estimations/addEditCategories",
        { isEdit, formData, prodIDs, orgID: currentUser.orgID },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (isEdit) {
          setMaterials((prev) => {
            let updated = [...prev].map((cat) => {
              if (prodIDs.includes(cat.prodID)) {
                return {
                  ...cat,
                  category: formData.category,
                  sellingPercentage: formData.sellingPercentage,
                };
              } else {
                return { ...cat };
              }
            });
            return updated;
          });
          close();
          toast.success("Category updated successfully");
        } else {
          close();
          toast.success("Category saved successfully");
        }
        handleCancel();
        setSave("Save");
      })
      .catch((err) => {
        console.log(err);
        setSave("Save");
      });
  };

  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={handlePopupOpen}
    >
      {(close) => (
        <div className="category-settings myscrollbar">
          <div className="main-right-div category-settings-main">
            <div className="right-div-header">
              <span className="right-header-title">Category Settings</span>
              <span className="est-currency-text-span est-currency-text-span-home categ-setting-default">
                Category Default
              </span>
              <svg
                onClick={() => close()}
                className="close-cross-button category-close-cross-button"
                version="1.1"
                viewBox="0 0 122.878 122.88"
              >
                <g>
                  <path d="M1.426,8.313c-1.901-1.901-1.901-4.984,0-6.886c1.901-1.902,4.984-1.902,6.886,0l53.127,53.127l53.127-53.127 c1.901-1.902,4.984-1.902,6.887,0c1.901,1.901,1.901,4.985,0,6.886L68.324,61.439l53.128,53.128c1.901,1.901,1.901,4.984,0,6.886 c-1.902,1.902-4.985,1.902-6.887,0L61.438,68.326L8.312,121.453c-1.901,1.902-4.984,1.902-6.886,0 c-1.901-1.901-1.901-4.984,0-6.886l53.127-53.128L1.426,8.313L1.426,8.313z" />
                </g>
              </svg>
            </div>

            <div className="right-div-content">
              <div className="task-details-box">
                <div className="create-task-container task-details-container">
                  <div className="department-heading">
                    <span>ADD NEW</span>
                    <img
                      title="Add Department"
                      className="dep-plus"
                      src={Dep_plus}
                      onClick={handleAdd}
                    />
                  </div>
                  {addVisible && (
                    <>
                      <div className="dep-adder">
                        <div className="dep-input">
                          <input
                            name="category"
                            type="text"
                            placeholder="Enter Category"
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category: e.target.value,
                              })
                            }
                          ></input>
                        </div>
                        <div className="categ-percentage">
                          <span className="markup-percentage">Mark Up (%)</span>
                          <input
                            className="sellingPercentage-input"
                            name="sellingPercentage"
                            type="text"
                            value={formData.sellingPercentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sellingPercentage: e.target.value,
                              })
                            }
                          ></input>
                          <span className="percentage-text">%</span>
                        </div>

                        <div className="dep-add-button">
                          <button
                            className="save-button"
                            onClick={() => handleSave(close)}
                          >
                            {save}
                          </button>
                          <span
                            title="Close"
                            className="calendar-closee in-dep"
                            onClick={handleCancel}
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
                        {categories.map((cat, index) => (
                          <tr className="dep-tr" key={index}>
                            <td className="name-container">{cat.category}</td>
                            <td>
                              ( {cat.sellingPercentage}
                              {cat.sellingPercentage !== "NIL" && "%"} )
                            </td>
                            <td className="dep-small-td">
                              <img
                                title="Edit"
                                className="dep-img"
                                onClick={() => handleEdit(cat)}
                                src={Edit_Button}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default EstimateCategorySettings;
