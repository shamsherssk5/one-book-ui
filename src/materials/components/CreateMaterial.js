import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Open from "../../assets/images/next.png";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";

const CreateMaterial = ({
  rightContent,
  setRightContent,
  setData,
  catData,
  unitData,
  setToken,
  setCurrentMaterial,
}) => {
  const [openDeliveryAddr, setOpenDeliveryAddr] = useState(false);
  const [typesContent, setTypesContent] = useState("percentage");
  const [submitvalue, setSubmitValue] = useState("Save");
  const ref = useRef(null);
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  const [files, setFiles] = useState([]);
  const handleDelete = (id) => {
    setFiles((prev) => {
      let f = prev.filter((file) => file.fileID !== id);
      return f;
    });
  };

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  };

  const intialValues = {
    category: "",
    shotKey: "",
    itemName: "",
    itemDesc: "",
    unitPrice: "",
    unitType: "",
    sellingPercentage: "",
    reduceLimit: "",
    fixedSellingPrice: "",
    reduceLimitAmount: "",
    notes: "",
    sellingPrice: "",
    updatedBy: currentUser.username,
    orgID: currentUser.orgID,
    marginType: "percentage",
    error: undefined,
  };

  const vendorintialValues = {
    vendorName: "",
    vendorPrice: 0,
    vendorCode: "",
  };
  const [formData, setFormdata] = useState(intialValues);
  const [formVendor, setFormVendor] = useState(vendorintialValues);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formData, [name]: value });
  };

  const handleFormVendorChange = (e) => {
    const { name, value } = e.target;
    setFormVendor({ ...formVendor, [name]: value });
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

    if (!values.itemDesc) {
      setFormdata({ ...formData, error: "Please Enter Item Description" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitPrice) {
      setFormdata({ ...formData, error: "Please Enter Unit price" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitType) {
      setFormdata({ ...formData, error: "Please Select Unit type" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "percentage" && !values.sellingPercentage) {
      setFormdata({
        ...formData,
        error: "Please Enter Selling Percentage",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "percentage" && !values.reduceLimit) {
      setFormdata({ ...formData, error: "Please Enter Reduce Limit" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "fixed" && !values.fixedSellingPrice) {
      setFormdata({
        ...formData,
        error: "Please Enter Fixed Selling Price",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.marginType === "fixed" && !values.reduceLimitAmount) {
      setFormdata({
        ...formData,
        error: "Please Enter Reduce Limit Amount",
      });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.unitPrice && isNaN(values.unitPrice)) {
      setFormdata({
        ...formData,
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
      setFormdata({
        ...formData,
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
      setFormdata({
        ...formData,
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
      setFormdata({ ...formData, sellingPercentage: "", reduceLimit: "" });
    }

    if (
      values.marginType === "percentage" &&
      values.reduceLimit &&
      values.sellingPercentage
    ) {
      setFormdata({
        ...formData,
        fixedSellingPrice: "",
        reduceLimitAmount: "",
      });
    }

    if (values.marginType === "others") {
      setFormdata({
        ...formData,
        fixedSellingPrice: "",
        reduceLimitAmount: "",
        sellingPercentage: "",
        reduceLimit: "",
      });
    }

    setFormdata({ ...formData, error: undefined });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validate(formData);
    setSubmitValue("...Saving");
  };

  useEffect(async () => {
    if (submitvalue === "...Saving" && !formData.error) {
      formData["attachments"] = files;
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      formData["lastUpdate"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      let data = {
        pnm: formData,
        vendor: formVendor,
      };

      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/pnm/create-pnm?timeZone=" +
            currentUser.timeZone,
          data,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("products and Materials created successfully");
          formData["prodID"] = res.data.id;
          formData["attachments"] = files;
          formData["refText"] = "PM-";
          formData["refNum"] = "####";
          formData["vendor"] = [];
          formVendor["id"] = res.data.vid;
          formVendor["prodID"] = res.data.id;
          formData.vendor.push(formVendor);
          formData["history"] = [];
          formData.history.unshift({
            moduleID: formData.prodID,
            action: "Added",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formData.updatedBy,
          });
          setRightContent("Details");
          setCurrentMaterial(formData);
          setData((prevState) => [formData, ...prevState]);
          setFormdata(intialValues);
          setFormVendor(vendorintialValues);
          setFiles([]);
          setSubmitValue("Save");
          setOpenDeliveryAddr(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Material creation failed");
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
                <legend>Short Key</legend>
                <input
                  type="text"
                  name="shotKey"
                  value={formData.shotKey}
                  onChange={handleFormChange}
                  placeholder="Create Shot Key(optional)"
                />
              </fieldset>
              <fieldset>
                <legend>Item Name *</legend>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  placeholder="Enter Item name"
                />
              </fieldset>
              <fieldset>
                <legend>Item Description</legend>
                <input
                  type="text"
                  name="itemDesc"
                  value={formData.itemDesc}
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
                      step={1}
                      name="unitPrice"
                      value={formData.unitPrice}
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
                      value={formData.unitType}
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
                    setFormdata({ ...formData, marginType: "percentage" });
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
                    setFormdata({ ...formData, marginType: "fixed" });
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
                    setFormdata({ ...formData, marginType: "others" });
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

              {typesContent === "percentage" && (
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
                          value={formData.sellingPercentage}
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
                          value={formData.reduceLimit}
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
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Enter Notes if any (Optional). 100 Characters MAX"
                      maxLength="100"
                    />
                  </fieldset>
                </div>
              )}

              {typesContent === "fixed" && (
                <div>
                  <fieldset>
                    <legend>Fixed selling price</legend>
                    <input
                      type="number"
                      name="fixedSellingPrice"
                      value={formData.fixedSellingPrice}
                      onChange={handleFormChange}
                      placeholder="Enter Fixed selling price"
                    />
                  </fieldset>
                  <fieldset>
                    <legend>Reduce Limit Amount</legend>
                    <input
                      type="number"
                      name="reduceLimitAmount"
                      value={formData.reduceLimitAmount}
                      onChange={handleFormChange}
                      placeholder="Enter Reduce Amount"
                    />
                  </fieldset>

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
              )}

              {typesContent === "others" && (
                <div>
                  <div
                    style={{
                      fontSize: "0.76vw",
                      fontWeight: "normal",
                      color: "#C4C4C4",
                      paddingTop: "1vh",
                      paddingBottom: "2vh",
                    }}
                  >
                    Entered data will not be accessible in Estimations
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
              )}
              <div className="financial-details-Box">
                <div className="financial-box-header">Add Vendor</div>
                <div className="finacial-box-image-container">
                  <img
                    style={
                      openDeliveryAddr ? { transform: "rotate(90deg)" } : {}
                    }
                    src={Open}
                    onClick={() => {
                      setOpenDeliveryAddr(!openDeliveryAddr);
                    }}
                  />
                </div>
              </div>

              {openDeliveryAddr && (
                <div>
                  <fieldset>
                    <legend>Vendor Name</legend>
                    <input
                      type="text"
                      name="vendorName"
                      value={formVendor.vendorName}
                      onChange={handleFormVendorChange}
                      placeholder="Select/Add vendor"
                    />
                  </fieldset>
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "48%" }}>
                      <fieldset>
                        <legend>Price</legend>
                        <input
                          type="number"
                          step="0.1"
                          name="vendorPrice"
                          value={formVendor.vendorPrice}
                          onChange={handleFormVendorChange}
                          placeholder="Enter Cost"
                        />
                      </fieldset>
                    </div>
                    <div
                      style={{
                        width: "48%",
                        left: "4%",
                        position: "relative",
                      }}
                    >
                      <fieldset>
                        <legend>Reference/Code</legend>
                        <input
                          type="text"
                          name="vendorCode"
                          value={formVendor.vendorCode}
                          onChange={handleFormVendorChange}
                          placeholder="Enter Prod Ref Code"
                        />
                      </fieldset>
                    </div>
                  </div>
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
        <Gap />
        <FileUploaderListViewer
          isView={false}
          setToken={setToken}
          data={files}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="pnm"
          id={undefined}
        />
      </div>
    )
  );
};

export default CreateMaterial;
