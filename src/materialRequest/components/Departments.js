import { useEffect, useRef, useState } from "react";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import "react-color-palette/lib/css/styles.css";
import { ColorPicker, useColor } from "react-color-palette";
import toast from "react-hot-toast";
import axios from "axios";
import Departmentdata from "../depdata.json";

const Departments = (props) => {
	let { depData, setDepdata } = props;
	const [edit, changeEdit] = useState({ id: "", isEditable: false });
	const [color, setColor] = useColor("hex", "#121212");
	const handleSave = async () => {
		if (depData.newDep == undefined || depData.newDep.trim().length <= 0) {
			alert("Please Enter Department");
			return;
		}

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
			toast.success("Department updated successfully");
			changeEdit({ id: "", isEditable: false });
		} else {
			setDepdata((prevState) => {
				return {
					departments: [
						...prevState.departments,
						{
							depID: "DEP00",
							name: prevState.newDep,
							colour: color.hex,
						},
					],
					addVisible: false,
					newDep: "",
				};
			});
		}

		changeEdit({ id: "", isEditable: false });
	};

	const handleDelete = (dep) => {
		let updatedData = depData.departments.filter((d) => d.depID != dep.depID);
		setDepdata({ departments: updatedData, addVisible: false });
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

	useEffect(() => {
		setDepdata({ departments: Departmentdata, addVisible: false });
	}, []);

	return (
		props.rightContent === "Departments" && (
			<div className="task-details-box">
				<div className="task-details-container">
					<div className="department-heading">
						<span>Add Departments</span>
						<img
							title="Add Department"
							className="dep-plus"
							src={Dep_plus}
							onClick={() => setDepdata({ ...depData, addVisible: true })}
						/>
					</div>
					{depData && depData.addVisible && (
						<>
							<div className="dep-adder">
								<div className="dep-input">
									<input
										name="newDep"
										type="text"
										placeholder="Enter Department"
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
export default Departments;
