import React, { useState, useEffect } from "react";
import "../css/MaterialRequestHome.css";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import { FileUploader } from "react-drag-drop-files";
import next from "../../tasks/assets/next.png";
import DatePicker from "react-date-picker";

const CreateMaterialRequest = ({
	rightContent,
	data,
	setData,
	depData,
	unitData,
	vendorProdid,
}) => {
	console.log(data);

	const intialValues = {
		MRref: "MR-05128",
		matID: "",
		Department: "",
		materialName: "",
		quantity: 0,
		unit: "",
		projectCode: "PR-051",
		projectRelated: "",
		priority: "",
		status: "Order Request",
		requestedDate: "02 feb 2022",
		notes: "",
		createdBy: "",
		error: undefined,
	};

	const [submitvalue, setSubmitValue] = useState("Save");
	const [isCustomDate, setIsCustomDate] = useState(false);
	const [disable, submitDisable] = useState(false);
	const [formMatData, setFormMatData] = useState(intialValues);
	const [formErrors, setFormErrors] = useState({});
	const [counter, setCounter] = useState(5);
	const [value, onChange] = useState(new Date());

	const handleFormChange = (e) => {
		if (e.target.name === "priority" && e.target.value === "Custom Date") {
			setIsCustomDate(true);
			setFormMatData({ ...formMatData, priority: "Custom Date" });
			return;
		}
		const { name, value } = e.target;

		setFormMatData({ ...formMatData, [name]: value });
	};

	const validate = (values) => {
		const generateId = () => {};

		if (!values.Department) {
			setFormMatData({ ...formMatData, error: "Please fill Department field" });
			return;
		}

		if (!values.materialName) {
			setFormMatData({
				...formMatData,
				error: "Please fill material Name field",
			});
			return;
		}

		if (!values.quantity) {
			setFormMatData({ ...formMatData, error: "Please fill quantity field" });
			return;
		}

		if (!values.unit) {
			setFormMatData({ ...formMatData, error: "Please fill unit field" });
			return;
		}

		if (values.quantity && isNaN(values.quantity)) {
			setFormMatData({
				...formMatData,
				error: "Please fill numeric data in quantity field",
			});
			return;
		}

		setFormMatData({ ...formMatData, error: undefined });

		console.log("form validation ends");
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();

		validate(formMatData);

		setSubmitValue("...Saving");
	};

	useEffect(() => {
		console.log(submitvalue);
		console.log(formMatData.error);

		if (submitvalue === "...Saving" && !formMatData.error) {
			setData((prevState) => [...prevState, formMatData]);
			setFormMatData(intialValues);
			setSubmitValue("Save");
		} else {
			setSubmitValue("Save");
			console.log("else loop");
		}
	}, [submitvalue]);

	return (
		rightContent === "Create" && (
			<div className="task-details-box">
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
								<select
									className="title"
									name="Department"
									value={formMatData.Department}
									onChange={handleFormChange}
									required
								>
									<option value="" disabled selected>
										Select Department
									</option>
									{depData.departments.map((dep, index) => (
										<option value={dep.name}> {dep.name} </option>
									))}
								</select>
							</fieldset>
							<fieldset>
								<legend>Material Name</legend>
								<input
									type="text"
									name="materialName"
									value={formMatData.materialName}
									onChange={handleFormChange}
									placeholder="Enter / Select Requested Material"
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
									<fieldset>
										<legend>Qty</legend>
										<input
											type="number"
											step={0.01}
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
										<select
											className="title"
											name="unit"
											value={formMatData.unit}
											onChange={handleFormChange}
											required
										>
											<option value="" disabled selected>
												Select Unit
											</option>
											<option value="Sheet">Sheet</option>
											<option value="inch">inch</option>
											<option value="Sqft">Sqft</option>
											<option value="Sqcm">Sqcm</option>
										</select>
									</fieldset>
								</div>
							</div>

							{!isCustomDate && (
								<fieldset>
									<legend>Priority</legend>
									<select
										className="title"
										name="priority"
										value={formMatData.priority}
										onChange={handleFormChange}
										required
									>
										<option value="" disabled selected>
											HIGH/MEDIUM/LOW & Pick a Date
										</option>
										<option value="HIGH">HIGH</option>
										<option value="MEDIUM">MEDIUM</option>
										<option value="LOW">LOW</option>
										<option value="Custom Date">CUSTOM DATE</option>
									</select>
								</fieldset>
							)}
							{isCustomDate && (
								<fieldset>
									<legend>Custom Date</legend>
									<DatePicker
										onChange={onChange}
										value={value}
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

export default CreateMaterialRequest;
