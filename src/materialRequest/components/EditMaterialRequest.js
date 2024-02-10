import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-date-picker";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
const EditMaterialRequest = ({
  rightContent,
  setData,
  depData,
  setToken,
  setRightContent,
  selectData,
  unitData,
  pnm,
}) => {
  const ref = useRef(null);
  const [submitvalue, setSubmitValue] = useState("Save");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [formMatData, setFormMatData] = useState({});
  const [start, onChange] = useState(new Date());
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [matType, setMatType] = useState("new");
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (e.target.name === "priority" && e.target.value === "Custom Date") {
      setIsCustomDate(true);
      setFormMatData({ ...formMatData, priority: "Custom Date" });
      return;
    } else if (name == "materialName") {
      setFormMatData({
        ...formMatData,
        [name]: value,
        error: undefined,
        unit: (pnm || []).find((p) => p.itemName === value)?.unitname,
      });
      return;
    }

    setFormMatData({ ...formMatData, [name]: value, error: undefined });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validate(formMatData);
    setSubmitValue("...Saving");
  };

  const validate = (values) => {
    if (!values.department) {
      setFormMatData({ ...formMatData, error: "Please Select Department" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.materialName) {
      setFormMatData({
        ...formMatData,
        error: "Please Enter material Name",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.quantity) {
      setFormMatData({ ...formMatData, error: "Please Enter Quantity" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unit) {
      setFormMatData({ ...formMatData, error: "Please Select Unit" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.priority) {
      setFormMatData({ ...formMatData, error: "Please Select Priority" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.quantity && values.quantity <= 0) {
      setFormMatData({
        ...formMatData,
        error: "Quantity must be greater than zero",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.quantity && isNaN(values.quantity)) {
      setFormMatData({
        ...formMatData,
        error: "Quantity must be Number",
      });
      ref.current.scrollTop = 0;
      return;
    }

    setFormMatData({ ...formMatData, error: undefined });
  };

  useEffect(async () => {
    formMatData["priority_date"] = start
      ? start.getFullYear().toString() +
        "-" +
        (start.getMonth() + 1).toString() +
        "-" +
        start.getDate().toString()
      : "";
    formMatData["assignee"] = currentUser.username;
    if (submitvalue === "...Saving" && !formMatData.error) {
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/mtr/update-mtr?timeZone=" +
            currentUser.timeZone,
          formMatData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formMatData.history.unshift({
            moduleID: formMatData.matID,
            action: "Edited",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formMatData.createdBy,
          });
          setData((prev) => {
            let updateData = prev.filter((cust) => {
              if (cust.matID === selectData.matID) {
                Object.keys(formMatData).forEach((key) => {
                  cust[key] = formMatData[key];
                });
              }
              return cust;
            });
            return updateData;
          });
          setRightContent("Details");
          setSubmitValue("Save");
          setMatType("new");
          toast.success("Material Request updated Successfully!");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Matrial Request updation failed");
          setSubmitValue("Save");
        });
    } else {
      setSubmitValue("Save");
    }
  }, [submitvalue]);

  useEffect(() => {
    if (rightContent != "Edit" || selectData == undefined) return;
    if (selectData.priority === "Custom Date") {
      onChange(new Date(selectData.priority_date));
      setIsCustomDate(true);
    } else {
      setIsCustomDate(false);
      onChange(new Date());
    }
    setFormMatData(selectData);
  }, [rightContent]);

  return (
    rightContent === "Edit" && (
      <div className="task-details-box" ref={ref}>
        <div className="create-task-container task-details-container">
          <form name="materialForm" autoComplete="off">
            <div className="task-form-container">
              {formMatData.error && (
                <div>
                  <span class="warning-text-error warning-text">
                    {formMatData.error}
                  </span>
                </div>
              )}
              <fieldset>
                <legend>Department / Section</legend>
                <Select
                  isLoading={depData.departments.length === 0}
                  isSearchable={true}
                  placeholder={"Select Department"}
                  name="department"
                  key={`my_unique_select_key__${formMatData.department}`}
                  value={
                    formMatData.department
                      ? {
                          label: formMatData.department,
                          value: formMatData.department,
                        }
                      : undefined
                  }
                  onChange={(selected) =>
                    handleFormChange({
                      target: { name: "department", value: selected.value },
                    })
                  }
                  options={depData.departments.map((p) => {
                    return {
                      value: p.name,
                      label: p.name,
                    };
                  })}
                />
              </fieldset>
              <fieldset>
                <legend>Material Name</legend>
                <CreatableSelect
                  isLoading={pnm.length === 0}
                  isSearchable={true}
                  placeholder={"Select Material Name"}
                  name="materialName"
                  key={`my_unique_select_key__${formMatData.materialName}`}
                  value={
                    formMatData.materialName
                      ? {
                          label: formMatData.materialName,
                          value: formMatData.materialName,
                        }
                      : undefined
                  }
                  onChange={(selected) =>
                    handleFormChange({
                      target: { name: "materialName", value: selected.value },
                    })
                  }
                  options={pnm.map((p) => {
                    return {
                      value: p.itemName,
                      label: p.itemName,
                    };
                  })}
                />
              </fieldset>
              <fieldset>
                <legend>Project Related</legend>
                <input
                  type="text"
                  name="projectRelated"
                  value={formMatData.projectRelated}
                  onChange={handleFormChange}
                  placeholder="Enter / Select Project (Optional)"
                />
              </fieldset>

              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "48%" }}>
                  <fieldset style={{ height: "78.7%" }}>
                    <legend>Qty</legend>
                    <input
                      type="number"
                      step={1}
                      name="quantity"
                      value={formMatData.quantity}
                      onChange={handleFormChange}
                      placeholder="Enter Qty"
                    />
                  </fieldset>
                </div>
                <div style={{ width: "48%", left: "4%", position: "relative" }}>
                  <fieldset>
                    <legend>Unit</legend>
                    <Select
                      isLoading={unitData.length === 0}
                      isSearchable={true}
                      placeholder={"Select Unit"}
                      name="unit"
                      key={`my_unique_select_key__${formMatData.unit}`}
                      value={
                        formMatData.unit
                          ? {
                              label: formMatData.unit,
                              value: formMatData.unit,
                            }
                          : undefined
                      }
                      onChange={(selected) =>
                        handleFormChange({
                          target: { name: "unit", value: selected.value },
                        })
                      }
                      options={unitData.map((p) => {
                        return {
                          value: p.unitname,
                          label: p.unitname,
                        };
                      })}
                    />
                  </fieldset>
                </div>
              </div>

              {!isCustomDate && (
                <fieldset>
                  <legend>Priority</legend>
                  <Select
                    isSearchable={true}
                    placeholder={"Select Priority"}
                    name="priority"
                    key={`my_unique_select_key__${formMatData.priority}`}
                    value={
                      formMatData.priority
                        ? {
                            label: formMatData.priority,
                            value: formMatData.priority,
                          }
                        : undefined
                    }
                    onChange={(selected) =>
                      handleFormChange({
                        target: { name: "priority", value: selected.value },
                      })
                    }
                    options={["HIGH", "MEDIUM", "LOW", "Custom Date"].map(
                      (p) => {
                        return {
                          value: p,
                          label: p,
                        };
                      }
                    )}
                  />
                </fieldset>
              )}
              {isCustomDate && (
                <fieldset>
                  <legend>Custom Date</legend>
                  <DatePicker
                    onChange={onChange}
                    value={start}
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
                      setFormMatData({ ...formMatData, priority: "" });
                    }}
                  >
                    &#10006;
                  </span>
                </fieldset>
              )}

              <fieldset>
                <legend>Notes</legend>
                <textarea
                  id="notes"
                  name="notes"
                  value={formMatData.notes}
                  onChange={handleFormChange}
                  placeholder="Enter Notes if any (Optional) - 150 Characters MAX"
                  maxLength="150"
                />
              </fieldset>

              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={submitvalue}
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

export default EditMaterialRequest;
