import React, { useState, useEffect, useRef } from "react";
import "../styles/MaterialHome.css";
import next from "../../tasks/assets/next.png";
import axios from "axios";
import toast from "react-hot-toast";

const EditMaterial = ({
  rightContent,
  editdata,
  setData,
  catData,
  unitData,
  setToken,
  setRightContent,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [formEditData, setFormEditdata] = useState({});
  const [submitvalue, setSubmitValue] = useState("Save");
  const [typesContent, setTypesContent] = useState("percentage");
  const ref = useRef(null);

  useEffect(() => {
    if (rightContent !== "Edit") return;
    editdata["error"] = undefined;
    setFormEditdata(editdata);
    setTypesContent(editdata.marginType);
  }, [rightContent, rightContent]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormEditdata({ ...formEditData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validate(formEditData);
    setSubmitValue("...Saving");
  };

  useEffect(async () => {
    if (submitvalue === "...Saving" && !formEditData.error) {
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      formEditData["lastUpdate"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      formEditData.updatedBy = currentUser.username;
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/pnm/update-pnm?timeZone=" +
            currentUser.timeZone,
          formEditData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setData((prev) => {
            let updateData = prev.filter((cust) => {
              if (cust.prodID === editdata.prodID) {
                Object.keys(formEditData).forEach((key) => {
                  cust[key] = formEditData[key];
                });
              }
              return cust;
            });
            return updateData;
          });
          toast.success("Material Info Edited successfully");
          formEditData.history.unshift({
            moduleID: formEditData.prodID,
            action: "Edited",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formEditData.updatedBy,
          });
          setRightContent("Details");
          setSubmitValue("Save");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Materials Edit failed");
          setSubmitValue("Save");
        });
    } else {
      setSubmitValue("Save");
    }
  }, [submitvalue]);

  const validate = (values) => {
    if (!values.category) {
      setFormEditdata({ ...formEditData, error: "Please Select category " });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.itemName) {
      setFormEditdata({ ...formEditData, error: "Please Enter Item Name" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.itemDesc) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Item Description",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitPrice) {
      setFormEditdata({ ...formEditData, error: "Please Enter Unit price" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitType) {
      setFormEditdata({ ...formEditData, error: "Please Select Unit type" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "percentage" && !values.sellingPercentage) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Selling Percentage",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "percentage" && !values.reduceLimit) {
      setFormEditdata({ ...formEditData, error: "Please Enter Reduce Limit" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "fixed" && !values.fixedSellingPrice) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Fixed Selling Price",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "fixed" && !values.reduceLimitAmount) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Reduce Limit Amount",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.unitPrice && isNaN(values.unitPrice)) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Numeric Unit Price",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (
      values.marginType === "percentage" &&
      values.sellingPercentage &&
      isNaN(values.sellingPercentage)
    ) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter numeric Selling Percentage",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (
      values.marginType === "percentage" &&
      values.reduceLimit &&
      isNaN(values.reduceLimit)
    ) {
      setFormEditdata({
        ...formEditData,
        error: "Please Enter Numeric Reduce Limit",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (
      values.marginType === "fixed" &&
      values.fixedSellingPrice &&
      values.reduceLimitAmount
    ) {
      setFormEditdata({
        ...formEditData,
        sellingPercentage: "",
        reduceLimit: "",
      });
    }

    if (
      values.marginType === "percentage" &&
      values.reduceLimit &&
      values.sellingPercentage
    ) {
      setFormEditdata({
        ...formEditData,
        fixedSellingPrice: "",
        reduceLimitAmount: "",
      });
    }

    if (values.marginType === "others") {
      setFormEditdata({
        ...formEditData,
        fixedSellingPrice: "",
        reduceLimitAmount: "",
        sellingPercentage: "",
        reduceLimit: "",
      });
    }

    setFormEditdata({ ...formEditData, error: undefined });
  };

  return (
    rightContent === "Edit" && (
      <div className="task-details-box" ref={ref}>
        <div className="create-task-container task-details-container">
          <form name="editForm" autoComplete="off">
            <div className="task-form-container">
              {formEditData.error && (
                <div>
                  <span class="warning-text-error warning-text">
                    {formEditData.error}
                  </span>
                </div>
              )}
              <fieldset>
                <legend>Category</legend>
                <select
                  className="title"
                  name="category"
                  value={formEditData.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled selected>
                    Select category
                  </option>
                  {catData.categories.map((cat, index) => (
                    <option value={cat.catname}> {cat.catname} </option>
                  ))}
                </select>
              </fieldset>
              <fieldset>
                <legend>Short Key</legend>
                <input
                  type="text"
                  name="shotKey"
                  value={formEditData.shotKey}
                  onChange={handleFormChange}
                  placeholder="Create Shot Key(optional)"
                />
              </fieldset>
              <fieldset>
                <legend>Item Name *</legend>
                <input
                  type="text"
                  name="itemName"
                  value={formEditData.itemName}
                  onChange={handleFormChange}
                  placeholder="Enter Item name"
                />
              </fieldset>
              <fieldset>
                <legend>Item Description</legend>
                <input
                  type="text"
                  name="itemDesc"
                  value={formEditData.itemDesc}
                  onChange={handleFormChange}
                  placeholder="Enter Item description"
                />
              </fieldset>

              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "48%" }}>
                  <fieldset>
                    <legend>Unit Price(COST)</legend>
                    <input
                      type="number"
                      step={0.01}
                      name="unitPrice"
                      value={formEditData.unitPrice}
                      onChange={handleFormChange}
                      placeholder="Enter Unit Cost"
                    />
                  </fieldset>
                </div>
                <div style={{ width: "48%", left: "4%", position: "relative" }}>
                  <fieldset>
                    <legend>Unit Type</legend>
                    <select
                      className="title"
                      name="unitType"
                      value={formEditData.unitType}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select unittype
                      </option>
                      {unitData.unittypes.map((unit, index) => (
                        <option value={unit.unitname}> {unit.unitname} </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              </div>
              <div className="material-Margin">Margin Type</div>

              <div className="typesContainer">
                <div
                  className="typesContainerBox "
                  onClick={() => {
                    setTypesContent("percentage");
                    setFormEditdata({
                      ...formEditData,
                      marginType: "percentage",
                    });
                  }}
                >
                  <div className="dep-color">
                    <span
                      style={
                        typesContent === "percentage"
                          ? { background: "#44B764", border: "" }
                          : { background: "white", border: "0.5px solid black" }
                      }
                      className="color-backg dep-backg"
                    ></span>
                  </div>
                  <div
                    className="dep-add-button"
                    style={{ marginLeft: "0.31vw", fontSize: "0.73vw" }}
                  >
                    Percentage
                  </div>
                </div>

                <div
                  className="typesContainerBox "
                  onClick={() => {
                    setTypesContent("fixed");
                    setFormEditdata({ ...formEditData, marginType: "fixed" });
                  }}
                >
                  <div className="dep-color">
                    <span
                      style={
                        typesContent === "fixed"
                          ? { background: "#44B764", border: "" }
                          : { background: "white", border: "0.5px solid black" }
                      }
                      className="color-backg dep-backg"
                    ></span>
                  </div>
                  <div
                    className="dep-add-button"
                    style={{ marginLeft: "0.31vw", fontSize: "0.73vw" }}
                  >
                    Fixed
                  </div>
                </div>

                <div
                  className="typesContainerBox"
                  onClick={() => {
                    setTypesContent("others");
                    setFormEditdata({ ...formEditData, marginType: "others" });
                  }}
                >
                  <div className="dep-color">
                    <span
                      style={
                        typesContent === "others"
                          ? { background: "#44B764", border: "" }
                          : { background: "white", border: "0.5px solid black" }
                      }
                      className="color-backg dep-backg"
                    ></span>
                  </div>
                  <div
                    className="dep-add-button"
                    style={{ marginLeft: "0.31vw", fontSize: "0.73vw" }}
                  >
                    Others
                  </div>
                </div>
              </div>

              {formEditData.marginType === "percentage" && (
                <div>
                  <div className="margin-perc">
                    <div className="margin-perc-fieldset">
                      <fieldset
                        style={{
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                        }}
                      >
                        <legend>Selling percentage</legend>
                        <input
                          type="number"
                          step="1"
                          name="sellingPercentage"
                          value={formEditData.sellingPercentage}
                          onChange={handleFormChange}
                          placeholder="Enter margin Percentage"
                        />
                      </fieldset>
                    </div>

                    <div className="margin-perc-symbol">
                      <div className="margin-perc-symbol-inner">
                        {" "}
                        <span className="symbol-cont">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="margin-perc">
                    <div className="margin-perc-fieldset">
                      <fieldset
                        style={{
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                        }}
                      >
                        <legend>Reduce Limit</legend>
                        <input
                          type="number"
                          step="1"
                          name="reduceLimit"
                          value={formEditData.reduceLimit}
                          onChange={handleFormChange}
                          placeholder="Set Selling Reduce Limit"
                        />
                      </fieldset>
                    </div>

                    <div className="margin-perc-symbol">
                      <div className="margin-perc-symbol-inner">
                        {" "}
                        <span className="symbol-cont">%</span>
                      </div>
                    </div>
                  </div>

                  <fieldset>
                    <legend>Notes</legend>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formEditData.notes}
                      onChange={handleFormChange}
                      placeholder="Enter Notes if any (Optional). 100 Characters MAX"
                      maxLength="100"
                    />
                  </fieldset>
                </div>
              )}

              {formEditData.marginType === "fixed" && (
                <div>
                  <fieldset>
                    <legend>Fixed selling price</legend>
                    <input
                      type="number"
                      name="fixedSellingPrice"
                      value={formEditData.fixedSellingPrice}
                      onChange={handleFormChange}
                      placeholder="Enter Fixed selling price"
                    />
                  </fieldset>
                  <fieldset>
                    <legend>Reduce Limit Amount</legend>
                    <input
                      type="number"
                      name="reduceLimitAmount"
                      value={formEditData.reduceLimitAmount}
                      onChange={handleFormChange}
                      placeholder="Enter Reduce Amount"
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Notes</legend>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formEditData.notes}
                      onChange={handleFormChange}
                      placeholder="Enter Notes if any (Optional). 100 Characters MAX"
                      maxLength="100"
                    />
                  </fieldset>
                </div>
              )}

              {formEditData.marginType === "others" && (
                <div>
                  <div
                    style={{
                      fontSize: "0.76vw",
                      fontWeight: "normal",
                      color: "#C4C4C4",
                    }}
                  >
                    Entered data will not be accessible in Estimations
                  </div>

                  <fieldset>
                    <legend>Notes</legend>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formEditData.notes}
                      onChange={handleFormChange}
                      placeholder="Enter Notes if any (Optional). 100 Characters MAX"
                      maxLength="100"
                    />
                  </fieldset>
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="create-task-container task-details-container">
          <div className="submit-button-container">
            <input
              className="submit-button"
              type="button"
              value={submitvalue}
              onClick={handleFormSubmit}
            />
          </div>
        </div>
        <div class="empty-details-container"></div>
      </div>
    )
  );
};

export default EditMaterial;
