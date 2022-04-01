import React, { useEffect, useState } from "react";
import Colors from "./MatColors";
import verticaldots from "../../tasks/assets/vertical-dots.png";
import subject_sort from "../../tasks/assets/subject-sort.png";
import sorticon from "../../tasks/assets/sort.png";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Style from "../../tasks/css/task.module.css";

const MaterialReqListItems = ({
	currentItems,
	setData,
	focusID,
	setFocusID,
	selectData,
	setSelectData,
	rightContent,
	setRightContent,
}) => {
	const [sort, setSort] = useState("");
	const handleMatDelete = () => {};
	const handleMatEdit = () => {};
	const handleForward = () => {};
	useEffect(() => {
		const prior = { LOW: 0, MEDIUM: 1, HIGH: 2, CustomDate: 3 };
		const categ = {
			"Order Request": 0,
			"Order Placed": 1,
			"Order Declined": 2,
			"Order Received": 3,
		};
		if (sort === "") return;
		setData((prevState) => {
			let sortedData = [...prevState];
			switch (sort) {
				case "mrref":
					sortedData.sort((a, b) => a.MRref.localeCompare(b.MRref));
					break;
				case "mrref_dec":
					sortedData.sort((a, b) => b.MRref.localeCompare(a.MRref));
					break;
				case "unit":
					sortedData.sort((a, b) =>
						a.unit > b.unit ? -1 : b.unit > a.unit ? 1 : 0
					);
					break;
				case "unit_dec":
					sortedData.sort((a, b) =>
						a.unit > b.unit ? 1 : b.unit > a.unit ? -1 : 0
					);
					break;

				case "qty":
					console.log(sortedData);
					console.log(sort);
					sortedData.sort((a, b) => a.quantity - b.quantity);
					console.log(sortedData);
					break;
				case "qty_dec":
					sortedData.sort((a, b) => b.quantity - a.quantity);
					break;
				case "priority":
					sortedData.sort((a, b) => prior[b.priority] - prior[a.priority]);
					break;
				case "priority_dec":
					sortedData.sort((a, b) => prior[a.priority] - prior[b.priority]);
					break;
				case "status":
					sortedData.sort((a, b) => categ[b.status] - categ[a.status]);
					break;
				case "status_dec":
					sortedData.sort((a, b) => categ[a.status] - categ[b.status]);
					break;
				case "requestedDate":
					sortedData.sort(
						(a, b) =>
							new Date(b.requestedDate).valueOf() -
							new Date(a.requestedDate).valueOf()
					);
					console.log(sortedData);
					break;
				case "requestedDate_dec":
					console.log(sortedData);
					sortedData.sort(
						(a, b) =>
							new Date(a.requestedDate).valueOf() -
							new Date(b.requestedDate).valueOf()
					);
					console.log(sortedData);
					break;
				default:
					break;
			}
			return sortedData;
		});
	}, [sort]);

	const handleOnchange = (e) => {
		let isAllChecked = currentItems.every(
			(d) => document.getElementById(d.matID).checked
		);
		if (isAllChecked) {
			document.getElementById("all").checked = true;
		} else {
			document.getElementById("all").checked = false;
		}
	};

	const handleCheckAll = (e) => {
		console.log("called");
		currentItems.forEach((element) => {
			document.getElementById(element.matID).checked = e.target.checked;
		});
	};


	useEffect(() => {
		if (currentItems == null) return;
		setToInitial();
	  }, [currentItems])
	
	  const setToInitial=()=>{
		document.getElementById("all").checked = false;
		currentItems.forEach(element => {
		  document.getElementById(element.matID).checked = false;
		});
	  }
	

	return (
		<div className="list-container-box">

			{currentItems && (
				<div style={{ width: "100%", height: "100%", position: "relative" }}>
					<table className="list-view-table">
						<thead className="thead-class">
							<tr className="list-view-header-row">
								<th width="3.6%">
									<input
										id="all"
										className="chkbx"
										name="all"
										type="checkbox"
										onChange={handleCheckAll}
									/>
								</th>
								<th
									width="30.4%"
									onClick={() =>
										sort == "mrref" ? setSort("mrref_dec") : setSort("mrref")
									}
								>
									Task Ref & Material{" "}
									<img
										title="sort"
										className={sort == "mrref" ? "sort sort-flip" : "sort"}
										src={subject_sort}
									/>
								</th>
								<th
									width="5.9%"
									onClick={() =>
										sort == "qty" ? setSort("qty_dec") : setSort("qty")
									}
								>
									Qty
									<img
										title="sort"
										className={sort === "qty" ? "sort sort-flip" : "sort"}
										src={sorticon}
									/>
								</th>
								<th
									width="5.9%"
									onClick={() =>
										sort === "unit" ? setSort("unit_dec") : setSort("unit")
									}
								>
									Unit
									<img
										title="sort"
										className={sort == "unit" ? "sort sort-flip" : "sort"}
										src={sorticon}
									/>
								</th>
								<th width="19.8%">Project </th>
								<th
									width="8.5%"
									onClick={() =>
										sort === "priority"
											? setSort("priority_dec")
											: setSort("priority")
									}
								>
									Priority
									<img
										title="sort"
										className={sort === "priority" ? "sort sort-flip" : "sort"}
										src={sorticon}
									/>
								</th>
								<th
									width="13.5%"
									onClick={() =>
										sort === "status"
											? setSort("status_dec")
											: setSort("status")
									}
								>
									Status
									<img
										title="sort"
										className={sort === "status" ? "sort sort-flip" : "sort"}
										src={sorticon}
									/>
								</th>
								<th
									width="10.2%"
									onClick={() =>
										sort == "requestedDate"
											? setSort("requestedDate_dec")
											: setSort("requestedDate")
									}
								>
									Requested Date
									<img
										title="sort"
										className={
											sort == "requestedDate" ? "sort sort-flip" : "sort"
										}
										src={sorticon}
									/>
								</th>
								<th width="2.2%"></th>
							</tr>
						</thead>
						<tbody className="tbody-class">
							{currentItems.map((mat, index) => {
								return (
									<>
										<tr
											key={index}
											className="task-list-row-container"
											onClick={() => {
												setSelectData(mat);
												setRightContent("Details");
											}}
											style={{
												backgroundColor:
													mat.matID === selectData.matID ? "#E5F1FA" : "",
											}}
										>
											<td width="3.6%">
												<input
													className="chkbx"
													name={mat.matID}
													id={mat.matID}
													type="checkbox"
													onChange={handleOnchange}
												/>
											</td>

											<td width="30.4%" className="ref-subject-container">
												<p>{mat.MRref}</p>
												<p className="list-subject">{mat.materialName}</p>
											</td>
											<td width="5.9%">{mat.quantity}</td>
											<td width="5.9%">{mat.unit}</td>
											<td width="19.8%" className="ref-subject-container">
												<p>{mat.projectCode}</p>
												<p>{mat.projectRelated}</p>
											</td>
											<td
												width="8.5%"
												style={{
													color: Colors[mat.priority],
												}}
											>
												{mat.priority === "customDate"
													? mat.priorityDate
													: mat.priority}
											</td>

											<td width="13.5%">
												<div
													className="list-category"
													style={{
														border: "0.5px solid " + Colors[mat.status],
														color: Colors[mat.status],
													}}
												>
													{mat.status}
												</div>
											</td>
											<td width="10.2%">{mat.requestedDate}</td>
											<td width="2.2">
												<img
													title="Modify"
													variant="success"
													className="vertical-dots"
													src={verticaldots}
												/>
											</td>
										</tr>
										{/* tds +1 = colspan */}
										<tr className="empty-row-container">
											<td width="100%" className="border-td" colSpan="10">
												<div></div>
											</td>
										</tr>
									</>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default MaterialReqListItems;
