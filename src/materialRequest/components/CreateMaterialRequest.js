import React, { useState, useEffect, useRef } from "react";
import "../css/MaterialRequestHome.css";
import DatePicker from "react-date-picker";
import Gap from "../../common/Gap";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import toast from "react-hot-toast";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import _ from "lodash";

const CreateMaterialRequest = ({
  rightContent,
  setData,
  depData,
  setToken,
  setRightContent,
  setSelectData,
  unitData,
  setUnitdata,
  pnm,
  setpnm,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const handleDelete = (id) => {
    setFiles((prev) => {
      let f = prev.filter((file) => file.fileID !== id);
      return f;
    });
  };

  const [matType, setMatType] = useState("list");

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  };

  const intialValues = {
    orgID: currentUser.orgID,
    department: "",
    materialName: "",
    quantity: 0,
    unit: "",
    projectID: "",
    priority: "",
    status: "Order Request",
    requestedDate: "",
    notes: "",
    createdBy: currentUser.username,
    error: undefined,
  };

  const [submitvalue, setSubmitValue] = useState("Save");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [formMatData, setFormMatData] = useState(intialValues);
  const [start, onChange] = useState(new Date());

  useEffect(async () => {
    if (pnm && pnm.length > 0) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/mtr/getpnm?orgID=" +
          currentUser.orgID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setpnm(res.data);
        setUnitdata(_.uniqBy(res.data || [], "unitname"));
      })
      .catch((err) => {
        console.log(err);
      });
  }, [rightContent]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "priority" && value === "Custom Date") {
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

  const handleFormSubmit = (e) => {
    e.preventDefault();

    validate(formMatData);

    setSubmitValue("...Saving");
  };

  useEffect(async () => {
    formMatData["priority_date"] = start
      ? start.getFullYear().toString() +
        "-" +
        (start.getMonth() + 1).toString() +
        "-" +
        start.getDate().toString()
      : "";

    if (submitvalue === "...Saving" && !formMatData.error) {
      formMatData["attachments"] = files;
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/mtr/create-mtr?timeZone=" +
            currentUser.timeZone,
          formMatData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formMatData["matID"] = res.data.insertId;
          formMatData["refText"] = "MR-";
          formMatData["refNum"] = "####";
          formMatData["history"] = [];
          formMatData["conversations"] = [];
          formMatData["requestedDate"] = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: currentUser.timeZone,
            })
          ).toLocaleString();
          formMatData.history.unshift({
            moduleID: formMatData.matID,
            action: "Added",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formMatData.createdBy,
          });
          setData((prevState) => [formMatData, ...prevState]);
          setSelectData(formMatData);
          setFiles([]);
          setRightContent("Details");
          setFormMatData(intialValues);
          setSubmitValue("Save");
          setMatType("list");
          toast.success("Material Request created Successfully!");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Matrial Request creation failed");
          setSubmitValue("Save");
        });
    } else {
      setSubmitValue("Save");
    }
  }, [submitvalue]);

  return (
    rightContent === "Create" && (
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
        <Gap />
        <FileUploaderListViewer
          isView={false}
          setToken={setToken}
          data={files}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="mtr"
          id={undefined}
        />
      </div>
    )
  );
};

export default CreateMaterialRequest;
