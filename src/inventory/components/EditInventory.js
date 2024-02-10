import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const EditInventory = ({
  currentInventory,
  rightContent,
  setRightContent,
  setData,
  setToken,
  catData,
  unitData,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const intialValues = {
    invID: "",
    category: "",
    itemName: "",
    productCode: "",
    unitType: "",
    vat: "",
    notes: "",
    updatedBy: currentUser.username,
    lastUpdated: "",
    error: undefined,
  };
  const [formData, setFormdata] = useState(intialValues);
  const [submitvalue, setSubmitValue] = useState("Save");
  const ref = useRef(null);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formData, [name]: value });
  };
  useEffect(() => {
    if (rightContent !== "Edit") return;
    setFormdata((prev) => {
      let updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = currentInventory[key];
      });
      return updated;
    });
  }, [rightContent]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validate(formData);
    setSubmitValue("...Saving");
  };

  const validate = (values) => {
    if (!values.category) {
      setFormdata({ ...formData, error: "Please Select category " });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.itemName) {
      setFormdata({ ...formData, error: "Please Enter Item Name" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitType) {
      setFormdata({ ...formData, error: "Please Select Unit type" });
      ref.current.scrollTop = 0;
      return;
    }

    // if (!values.vat) {
    // 	setFormdata({ ...formData, error: "Please Select Vat Percentage" });
    // 	ref.current.scrollTop = 0;
    // 	return;
    // }

    setFormdata({ ...formData, error: undefined });
  };

  useEffect(async () => {
    if (submitvalue === "...Saving" && !formData.error) {
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      formData["ilastUpdated"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/inventory/update-inv?timeZone=" +
            currentUser.timeZone,
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setData((prev) => {
            let updatedData = prev.filter((i) => {
              if (i.invID === currentInventory.invID) {
                Object.keys(formData).forEach((key) => {
                  i[key] = formData[key];
                });
                i.history.unshift({
                  moduleID: formData.invID,
                  action: "Inventory Edited",
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: currentUser.username,
                });
              }
              return i;
            });

            return updatedData;
          });

          setRightContent("Product Summary");
          setFormdata(intialValues);
          setSubmitValue("Save");
          toast.success("Inventory Updated successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Inventory updation failed");
          setSubmitValue("Save");
        });
    } else {
      setSubmitValue("Save");
    }
  }, [submitvalue]);

  return (
    rightContent === "Edit" && (
      <div className="task-details-box" ref={ref}>
        <div className="create-task-container task-details-container">
          <form name="materialForm" autoComplete="off">
            <div className="task-form-container">
              {formData.error && (
                <div>
                  <span class="warning-text-error warning-text">
                    {formData.error}
                  </span>
                </div>
              )}
              <fieldset>
                <legend>Category</legend>
                <select
                  className="title"
                  name="category"
                  value={formData.category}
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
                <legend>Item Name </legend>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  placeholder="Enter Item name"
                />
              </fieldset>
              <fieldset>
                <legend>Product Code/ Bar Code</legend>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleFormChange}
                  placeholder="Enter Product Ref Code / Bar Code(optional)"
                />
              </fieldset>

              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "48%", position: "relative" }}>
                  <fieldset>
                    <legend>Unit Type</legend>
                    <select
                      className="title"
                      name="unitType"
                      value={formData.unitType}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select Unit Type
                      </option>
                      {unitData.unittypes.map((unit, index) => (
                        <option value={unit.unitname}> {unit.unitname} </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
                <div style={{ width: "48%", left: "4%", position: "relative" }}>
                  <fieldset>
                    <legend>VAT</legend>
                    <select
                      className="title"
                      name="vat"
                      value={formData.vat}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled selected>
                        Vat (Optional)
                      </option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                      <option value={20}>20%</option>
                    </select>
                  </fieldset>
                </div>
              </div>
              <fieldset>
                <legend>Notes</legend>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Enter Notes if any (Optional). 100 Characters MAX"
                  maxLength="100"
                />
              </fieldset>
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
      </div>
    )
  );
};

export default EditInventory;
