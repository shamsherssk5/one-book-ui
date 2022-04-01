import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import g_plus from "../../assets/images/g_plus.png";
import search from "../../assets/images/gr_sr.png";
import filter from "../../tasks/assets/filter.png";
import filterclear from "../../tasks/assets/filter-clear.png";
import unfilter from "../../tasks/assets/unfilter.png";
import history from "../../tasks/assets/history.png";
import next from "../../assets/images/next.png";
import back from "../../assets/images/back-button.png";
import deletebtn from "../../tasks/assets/delete-but.png";
import depplus from "../../tasks/assets/dep-plus.png";
import Data from "../data.json";
import "../css/MaterialRequestHome.css";
import MaterialReqPaginatedItems from "./MaterialReqPaginatedItems";
import CreateMaterialRequest from "./CreateMaterialRequest";
import Departments from "./Departments";
import MaterialDetails from "./MaterialDetails";
import DatePicker from "react-date-picker";

const MaterialRequestHome = () => {
	const [itemsPerPage, setItemsPerPage] = useState(25);
	const [rightContent, setRightContent] = useState("Details");
	const [menuButton, setMenuButton] = useState("all");
	const [data, setData] = useState([]);
	const [actualData, setActualData] = useState([]);
	const [currentreq, setCurrentreq] = useState({});
	const [originalData, setOriginalData] = useState(Data);
	const [filtered, setFiltered] = useState(false);
	const [isSearchOpen, searchOpen] = useState(false);
	const [filterView, openFilterview] = useState(false);
	const [start, setStart] = useState();
	const [end, setEnd] = useState();
	const [selectData, setSelectData] = useState();
	const [focusID, setFocusID] = useState(null);

	const [depData, setDepdata] = useState({
		departments: [],
		addVisible: false,
		newCat: "",
	});
	let currentUser = {
		username: "Kishore ",
		id: 12345,
		avatarUrl: "pf3.jpg",
	};

	const handleSearchChange = (e) => {
		setData((prev) => {
			let updatedmatreq = prev.filter((m) =>
				m.MRref.toLowerCase().includes(e.target.value.toLowerCase())
			);
			return updatedmatreq;
		});
	};

	const handKeyDown = (e) => {
		if (e.key === "Backspace" || e.key === "Delete") setData(actualData);
	};

	const filterData = () => {
		var department = document.getElementById("department").value;
		var status = document.getElementById("status").value;
		var user = document.getElementById("user").value;
		// var assignFrom = document.getElementById("assignFrom").value;
		let updData = data
			.filter((d) => department === "" || d.title === department)
			.filter((d) => status === "" || d.status === status)
			.filter(
				(d) =>
					user === "" ||
					(d.createdBy !== undefined &&
						d.createdBy !== null &&
						d.createdBy.includes(user))
			)
			.filter(
				(d) =>
					start === undefined ||
					new Date(d.requestedDate).valueOf() >= new Date(start).valueOf()
			)
			.filter(
				(d) =>
					end === undefined ||
					new Date(d.requestedDate).valueOf() <= new Date(end).valueOf()
			);

		setData(updData);
		setFiltered(true);
	};

	const clearFilter = () => {
		setStart();
		setEnd();
		setFiltered(false);
		document.getElementById("department").value = "";
		document.getElementById("status").value = "";
		document.getElementById("user").value = "";
		document.getElementById("assignFrom").value = "";
	};
	useEffect(() => {
		setData(
			originalData.filter(
				(d) => d.status === menuButton || menuButton === "all"
			)
		);
		setSelectData(Data[0]);
	}, [menuButton]);

	return (
		<div className="main-left-right-div-container myscrollbar">
			<div className="main-left-div">
				<div className="left-div-header customers">
					<span className="header-title-sub">OTHERS</span>
					<span className="header-title-main">Material Request</span>
					<img
						className="g_plus customers materialreq"
						src={g_plus}
						onClick={() => setRightContent("Create")}
					/>
					<OverlayTrigger
						placement="bottom-end"
						trigger="click"
						rootClose={true}
						overlay={
							<Popover>
								<div className="popup">
									<p>Add New</p>
									<p>Add Note</p>
									<p> Export</p>
									<p> Import</p>
									<p>Merge Items</p>
									<p> Delete</p>
								</div>
							</Popover>
						}
					>
						<button variant="success" className="left-options-button">
							Options
						</button>
					</OverlayTrigger>
				</div>

				<div className="left-div-content customers">
					<div className="customers-button-container">
						<div className="customers-buttons materialreq-buttons">
							<div className="cust-head-empty" style={{ width: "6.7%" }} />
							<div
								className={
									menuButton === "all" ? "cust-all active" : "cust-all"
								}
								onClick={() => setMenuButton("all")}
							>
								<span className="cust-span-all">All</span>
							</div>
							<div
								className="cust-preferred"
								onClick={() => setMenuButton("Order Request")}
							>
								<div
									className={
										menuButton === "Order Request"
											? "cust-preffered-text active"
											: "cust-preffered-text"
									}
								>
									<span className="cust-span-all but-text">Order Request</span>
								</div>
								<div
									className={
										menuButton === "Order Request"
											? "cust-prefer-count active"
											: "cust-prefer-count"
									}
								>
									<span className="cust-span-all but-count">
										{
											originalData.filter((d) => d.status === "Order Request")
												.length
										}
									</span>
								</div>
							</div>
							<div
								className="cust-preferred"
								onClick={() => setMenuButton("Order Placed")}
							>
								<div
									className={
										menuButton === "Order Placed"
											? "cust-preffered-text active"
											: "cust-preffered-text"
									}
								>
									<span className="cust-span-all but-text">Order Placed</span>
								</div>
								<div
									className={
										menuButton === "Order Placed"
											? "cust-prefer-count active"
											: "cust-prefer-count"
									}
								>
									<span className="cust-span-all but-count">
										{
											originalData.filter((d) => d.status === "Order Placed")
												.length
										}
									</span>
								</div>
							</div>

							<div
								className="cust-blacklisted"
								onClick={() => setMenuButton("Order Declined")}
							>
								<div
									className={
										menuButton === "Order Declined"
											? "cust-preffered-text active"
											: "cust-preffered-text"
									}
								>
									<span className="cust-span-all but-text">Order Declined</span>
								</div>
								<div
									className={
										menuButton === "Order Declined"
											? "cust-prefer-count active"
											: "cust-prefer-count"
									}
								>
									<span className="cust-span-all but-count">
										{
											originalData.filter((d) => d.status === "Order Declined")
												.length
										}
									</span>
								</div>
							</div>
							<div
								className="cust-blacklisted"
								onClick={() => setMenuButton("Order Received")}
							>
								<div
									className={
										menuButton === "Order Received"
											? "cust-preffered-text active"
											: "cust-preffered-text"
									}
								>
									<span className="cust-span-all but-text">Order Received</span>
								</div>
								<div
									className={
										menuButton === "Order Received"
											? "cust-prefer-count active"
											: "cust-prefer-count"
									}
								>
									<span className="cust-span-all but-count">
										{
											originalData.filter((d) => d.status === "Order Received")
												.length
										}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="customers-numbers-container">
						{!isSearchOpen && (
							<img
								title="Search Material"
								className="left-gs-img customers search-button"
								src={search}
								onClick={() => {
									searchOpen(true);
									setActualData(data);
								}}
							/>
						)}
						{isSearchOpen && (
							<>
								<input
									type="text"
									placeholder="Enter Mrref"
									className="search-button-text matreq-search"
									onChange={handleSearchChange}
									onKeyDown={handKeyDown}
								/>
								<small
									title="close Search"
									className="calendar-closee template matreq-search"
									onClick={() => {
										searchOpen(false);
										setData(actualData);
									}}
								>
									&#10006;
								</small>
							</>
						)}
						{!filtered && (
							<img
								title="Filter"
								className="left-gs-img customers filter-button"
								src={unfilter}
								onClick={() => {
									openFilterview(true);
								}}
							/>
						)}
						{filtered && (
							<img
								title="Filter"
								className="left-gs-img customers filter-button"
								src={filter}
								onClick={() => {
									openFilterview(true);
								}}
							/>
						)}
					</div>

					{/* {filterView && (
						<div className="left-filter-view">
							<div className="filter-view-container">
								<div className="filter-view-inner-container">
									<div className="create-task-container filter-fieldset">
										<table
											className="filter-table"
											cellPadding="0"
											cellSpacing="0"
											width="100%"
											border="0"
										>
											<tbody>
												<tr>
													<td className="filter-td">
														<fieldset>
															<legend>Department</legend>
															<select
																className="title"
																id="department"
																onChange={filterData}
																required
															>
																<option value="" disabled selected>
																	Select Department
																</option>

																{[...new Set(data.map((req) => req.Department))]
																	.filter((field) => field != undefined)
																	.map((field, index) => (
																		<option key={index} value={field}>
																			{field}
																		</option>
																	))}
															</select>
														</fieldset>
													</td>
													<td className="filter-td">
														<fieldset>
															<legend>Status</legend>
															<select
																className="title"
																id="Status"
																onChange={filterData}
																required
															>
																<option value="" disabled selected>
																	Select Status
																</option>
																{[...new Set(data.map((task) => task.status))]
																	.filter((field) => field != undefined)
																	.map((field, index) => (
																		<option key={index} value={field}>
																			{field}
																		</option>
																	))}
															</select>
														</fieldset>
													</td>
													<td className="filter-td">
														<fieldset>
															<legend>Created By</legend>
															<select
																className="title"
																id="user"
																onChange={filterData}
																required
															>
																<option value="" disabled selected>
																	Select name
																</option>
																{[...new Set(data.map((req) => req.createdBy))]
																	.filter((field) => field != undefined)
																	.map((field, index) => (
																		<option key={index} value={field}>
																			{field}
																		</option>
																	))}
															</select>
														</fieldset>
													</td>

													<td className="filter-td">
														<fieldset>
															<legend>Date From</legend>
															<DatePicker
																dayPlaceholder="DD"
																monthPlaceholder="MM"
																yearPlaceholder="YYYY"
																onChange={setStart}
																value={start}
																required={true}
																calendarIcon={null}
																clearIcon={null}
															/>
														</fieldset>
													</td>
													<td className="filter-td">
														<fieldset>
															<legend>Date to</legend>
															<DatePicker
																dayPlaceholder="DD"
																monthPlaceholder="MM"
																yearPlaceholder="YYYY"
																onChange={setEnd}
																value={end}
																required={true}
																calendarIcon={null}
																clearIcon={null}
															/>
														</fieldset>
													</td>
													<td className="filter-td">
														<table width="100%">
															<tbody>
																<tr width="100%">
																	<td style={{ width: "65%" }}>
																		<div className="filter-text-container">
																			<button
																				className="save-button filter-text"
																				onClick={() => {
																					filterData();
																					console.log("should filter here");
																				}}
																			>
																				Filter
																			</button>
																		</div>
																	</td>
																	<td style={{ width: "35%" }}>
																		<img
																			title="Close Filter"
																			className="filter-clear-button"
																			src={filterclear}
																			onClick={() => {
																				clearFilter();
																				openFilterview(false);
																				setData(actualData);
																			}}
																		/>
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					)} */}

					<div className="customers-container">
						<MaterialReqPaginatedItems
							itemsPerPage={itemsPerPage}
							setItemsPerPage={setItemsPerPage}
							items={data}
							setData={setData}
							selectData={selectData}
							setSelectData={setSelectData}
							focusID={focusID}
							setFocusID={setFocusID}
							rightContent={rightContent}
							setRightContent={setRightContent}
						/>
					</div>
				</div>
			</div>

			<div className="main-right-div">
				<>
					<div className="right-div-header">
						<span className="right-header-title">
							{rightContent === "Details" ? "Details" : "Create"}
						</span>
						{(rightContent === "Create" || rightContent === "Departments") && (
							<>
								<span
									className={
										rightContent === "Create"
											? "right-sub-header-1 clicked"
											: "right-sub-header-1"
									}
									onClick={() => setRightContent("Create")}
								>
									Material Request
								</span>
								<span
									className={
										rightContent === "Departments"
											? "right-sub-header-2 clicked mrq"
											: "right-sub-header-2 mrq"
									}
									onClick={() => setRightContent("Departments")}
								>
									Departments
								</span>
							</>
						)}
					</div>
				</>
				<div className="right-div-content">
					<CreateMaterialRequest
						rightContent={rightContent}
						data={data}
						setData={setData}
						depData={depData}
						setDepdata={setDepdata}
					/>

					<Departments
						rightContent={rightContent}
						depData={depData}
						setDepdata={setDepdata}
					/>

					<MaterialDetails
						rightContent={rightContent}
						matData={selectData}
						setData={setData}
						currentUser={currentUser}
					/>
				</div>
			</div>
		</div>
	);
};

export default MaterialRequestHome;
