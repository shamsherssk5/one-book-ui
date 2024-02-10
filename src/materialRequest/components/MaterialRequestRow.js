import React, { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Dots from "../../tasks/assets/vertical-dots.png";
import Style from "../../tasks/css/task.module.css";
import { OverlayTrigger, Popover } from "react-bootstrap";

const MaterialRequestRow = ({
  mtr,
  index,
  departments,
  pnm,
  unitData,
  handleRowDeletion,
  setMaterialRows,
}) => {
  const [start, onChange] = useState(new Date());
  const handleFormChange = (property, value) => {
    setMaterialRows((prev) => {
      let data = [...prev].map((row, i) => {
        if (i == index) {
          if (property == "priority" && value === "Custom Date") {
            row[property] = value;
            row["isCustomDate"] = true;
          } else if (property == "priority" && !value) {
            row[property] = "";
            row["isCustomDate"] = false;
          } else if (property == "materialName") {
            row[property] = value;
            row["unit"] = (pnm || []).find(
              (p) => p.itemName === value
            )?.unitname;
          } else {
            row[property] = value;
          }
          row.error = undefined;
        }
        return row;
      });
      return [...data];
    });
  };
  const handleRowCopy = () => {
    document.body.click();
    setMaterialRows((prev) => [...prev, { ...mtr }]);
  };
  useEffect(() => {
    handleFormChange(
      "priority_date",
      start
        ? start.getFullYear().toString() +
            "-" +
            (start.getMonth() + 1).toString() +
            "-" +
            start.getDate().toString()
        : ""
    );
  }, [start]);
  return (
    <div className="create-task-container mtr-multiple-row-container">
      <fieldset>
        <legend>Department</legend>
        <Select
          isLoading={departments.length === 0}
          isSearchable={true}
          placeholder={departments.length > 0 ? "Select Department" : "Loading"}
          name="department"
          key={`my_unique_select_key__${mtr.department}`}
          value={
            mtr.department
              ? {
                  label: mtr.department,
                  value: mtr.department,
                }
              : undefined
          }
          onChange={(selected) =>
            handleFormChange("department", selected.value)
          }
          options={departments.map((p) => {
            return {
              value: p.name,
              label: p.name,
            };
          })}
        />
      </fieldset>
      <fieldset className="large">
        <legend>Material Name</legend>
        <CreatableSelect
          isLoading={pnm.length === 0}
          isSearchable={true}
          placeholder={pnm.length > 0 ? "Select Material Name" : "Loading"}
          name="materialName"
          key={`my_unique_select_key__${mtr.materialName}`}
          value={
            mtr.materialName
              ? {
                  label: mtr.materialName,
                  value: mtr.materialName,
                }
              : undefined
          }
          onChange={(selected) =>
            handleFormChange("materialName", selected.value)
          }
          options={pnm.map((p) => {
            return {
              value: p.itemName,
              label: p.itemName,
            };
          })}
        />
      </fieldset>
      <fieldset className="project">
        <legend>Project Related</legend>
        <CreatableSelect
          isLoading={false}
          isSearchable={true}
          placeholder={"Select Project (Optional)"}
          name="projectRelatedme"
          key={`my_unique_select_key__${mtr.projectRelated}`}
          value={
            mtr.projectRelated
              ? {
                  label: mtr.projectRelated,
                  value: mtr.projectRelated,
                }
              : undefined
          }
          onChange={(selected) =>
            handleFormChange("projectRelated", selected.value)
          }
          options={[].map((p) => {
            return {
              value: p.name,
              label: p.name,
            };
          })}
        />
      </fieldset>
      <fieldset className="small">
        <legend>Qty</legend>
        <input
          type="number"
          step={1}
          name="quantity"
          value={mtr.quantity}
          onChange={(e) => handleFormChange("quantity", e.target.value)}
          placeholder="Enter Qty"
          autoFocus
        />
      </fieldset>
      <fieldset>
        <legend>Unit</legend>
        <Select
          isLoading={unitData.length === 0}
          isSearchable={true}
          placeholder={unitData.length > 0 ? "Select Unit" : "Loading"}
          name="unit"
          key={`my_unique_select_key__${mtr.unit}`}
          value={
            mtr.unit
              ? {
                  label: mtr.unit,
                  value: mtr.unit,
                }
              : undefined
          }
          onChange={(selected) => handleFormChange("unit", selected.value)}
          options={unitData.map((p) => {
            return {
              value: p.unitname,
              label: p.unitname,
            };
          })}
        />
      </fieldset>
      {!mtr.isCustomDate && (
        <fieldset>
          <legend>Priority</legend>
          <Select
            isSearchable={true}
            placeholder={"Select Priority"}
            name="priority"
            key={`my_unique_select_key__${mtr.priority}`}
            value={
              mtr.priority
                ? {
                    label: mtr.priority,
                    value: mtr.priority,
                  }
                : undefined
            }
            onChange={(selected) =>
              handleFormChange("priority", selected.value)
            }
            options={["HIGH", "MEDIUM", "LOW", "Custom Date"].map((p) => {
              return {
                value: p,
                label: p,
              };
            })}
          />
        </fieldset>
      )}
      {mtr.isCustomDate && (
        <fieldset style={{ position: "relative" }}>
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
            onClick={() => handleFormChange("priority", "")}
            style={{ top: "12%" }}
          >
            &#10006;
          </span>
        </fieldset>
      )}
      <fieldset className="large">
        <legend>Notes</legend>
        <textarea
          id="notes"
          name="notes"
          value={mtr.notes}
          onChange={(e) => handleFormChange("notes", e.target.value)}
          placeholder="Enter Notes if any (Optional) - 150 Characters MAX"
          maxLength="150"
        />
      </fieldset>
      <div className="mtr-mult-image-con">
        <OverlayTrigger
          placement="left"
          trigger="click"
          rootClose
          overlay={
            <Popover>
              <div className={Style.popup}>
                <p
                  className={Style.delete}
                  onClick={() => {
                    handleRowDeletion(index);
                  }}
                >
                  Delete
                </p>
                <p className="p-leave" onClick={handleRowCopy}>
                  Copy
                </p>
              </div>
            </Popover>
          }
        >
          <img
            title="Modify"
            variant="success"
            className="est-dots mtr-mult-row-dots"
            src={Dots}
          />
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default MaterialRequestRow;
