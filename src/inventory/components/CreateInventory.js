import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Open from "../../assets/images/next.png";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";

const CreateInventory = ({
  rightContent,
  setRightContent,
  setData,
  catData,
  unitData,
  setToken,
  setCurrentInventory,
  stores,
  menuButton,
}) => {
  const [openDeliveryAddr, setOpenDeliveryAddr] = useState(false);
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
    itemName: "",
    productCode: "",
    qty: "",
    unitType: "",
    unitPrice: "",
    vat: "",
    total: "",
    rackNo: "",
    location: "",
    notes: "",
    updatedBy: currentUser.username,
    lastUpdated: "",
    orgID: currentUser.orgID,
    error: undefined,
  };

  const vendorintialValues = {
    vendorName: "",
    vendorPrice: 0,
    vendorCode: "",
    updatedBy: currentUser.username,
    lastUpdate: "",
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

    if (!values.unitType) {
      setFormdata({ ...formData, error: "Please Select Unit type" });
      ref.current.scrollTop = 0;
      return;
    }

    if (!values.unitPrice) {
      setFormdata({ ...formData, error: "Please Enter Unit price" });
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

    if (!values.qty) {
      setFormdata({ ...formData, error: "Please Enter Quantity" });
      ref.current.scrollTop = 0;
      return;
    }

    if (values.qty && isNaN(values.qty)) {
      setFormdata({
        ...formData,
        error: "Please Enter Numeric Quantity",
      });
      ref.current.scrollTop = 0;
      return;
    }

    // if (!values.vat) {
    // 	setFormdata({ ...formData, error: "Please Select Vat Percentage" });
    // 	ref.current.scrollTop = 0;
    // 	return;
    // }

    if (!values.location) {
      setFormdata({ ...formData, error: "Please Select Storage Location" });
      ref.current.scrollTop = 0;
      return;
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
      formData["custName"] =
        menuButton === "storage" ? formVendor.vendorName : "";
      formData["menu"] = menuButton === "storage" ? "storage" : "stock";
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      formData["lastUpdated"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      formData.total = formData.qty * formData.unitPrice;
      let data = {
        inv: formData,
        vendor: formVendor,
      };
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/inventory/create-inv?timeZone=" +
            currentUser.timeZone,
          data,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formData["invID"] = res.data.id;
          formData["attachments"] = files;
          formData["refText"] = "IN-";
          formData["refNum"] = "####";
          formData["vendor"] = [];
          formData["iqty"] = formData.qty;
          formData["itotal"] = formData.total;
          formData["ilastUpdated"] = formData.lastUpdated;
          formVendor["id"] = res.data.vid;
          formVendor["invID"] = res.data.id;
          formVendor["qty"] = formData.qty;
          formVendor["total"] = formData.total;
          formVendor["location"] = formData.location;
          formVendor["rackNo"] = formData.rackNo;
          formVendor["lastUpdate"] = formData.updatedBy;
          formVendor["moveType"] = "Received";
          formData.vendor.push(formVendor);
          formData["history"] = [];
          formData.history.unshift({
            moduleID: formData.invID,
            action: "Added",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formData.updatedBy,
          });
          setRightContent("Product Alerts");
          setCurrentInventory(formData);
          setData((prevState) => [formData, ...prevState]);
          setFormdata(intialValues);
          setFormVendor(vendorintialValues);
          setFiles([]);
          setSubmitValue("Save");
          setOpenDeliveryAddr(false);
          toast.success("Inventory created successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Inventory creation failed");
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
                <div style={{ width: "48%" }}>
                  <fieldset>
                    <legend>Qty</legend>
                    <input
                      type="number"
                      step={1}
                      name="qty"
                      value={formData.qty}
                      onChange={handleFormChange}
                      placeholder="Enter Qty"
                      min={0}
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
                        Select Unit Type
                      </option>
                      {unitData.unittypes.map((unit, index) => (
                        <option value={unit.unitname}> {unit.unitname} </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              </div>

              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "48%" }}>
                  <fieldset>
                    <legend>Unit Price</legend>
                    <input
                      type="number"
                      step={1}
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleFormChange}
                      placeholder="Enter Unit Price"
                      min={0}
                    />
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
                <legend>Value</legend>
                <input
                  readOnly="true"
                  type="text"
                  name="total"
                  value={formData.unitPrice * formData.qty}
                  onChange={handleFormChange}
                  placeholder="Total"
                />
              </fieldset>

              <fieldset>
                <legend>Storage Location</legend>
                <select
                  className="title"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled selected>
                    Select WareHouse
                  </option>
                  {stores.map((store, index) => (
                    <option value={`${store.warehouseName}-${store.area}`}>
                      {" "}
                      {store.warehouseName}-{store.area}{" "}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <legend>Rack Ref No</legend>
                <input
                  type="text"
                  name="rackNo"
                  value={formData.rackNo}
                  onChange={handleFormChange}
                  placeholder="Enter Rack Number(optional)"
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

              <div className="financial-details-Box">
                <div
                  className="financial-box-header"
                  onClick={() => {
                    setOpenDeliveryAddr(!openDeliveryAddr);
                  }}
                >
                  Add {menuButton === "storage" ? "Customer" : "Vendor"}
                </div>
                <div className="finacial-box-image-container">
                  <img
                    style={
                      openDeliveryAddr ? { transform: "rotate(90deg)" } : {}
                    }
                    src={Open}
                    onClick={() => {
                      setOpenDeliveryAddr(!openDeliveryAddr);
                    }}
                    alt=""
                  />
                </div>
              </div>

              {openDeliveryAddr && (
                <div>
                  <fieldset>
                    <legend>
                      {menuButton === "storage" ? "Customer" : "Vendor"} Name
                    </legend>
                    <input
                      type="text"
                      name="vendorName"
                      value={formVendor.vendorName}
                      onChange={handleFormVendorChange}
                      placeholder={`Select/Add ${
                        menuButton === "storage" ? "Customer" : "Vendor"
                      }`}
                    />
                  </fieldset>
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "48%" }}>
                      <fieldset>
                        <legend>Price</legend>
                        <input
                          type="number"
                          step="1"
                          name="vendorPrice"
                          value={formVendor.vendorPrice}
                          onChange={handleFormVendorChange}
                          placeholder="Enter Cost"
                          min={0}
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
                          placeholder="Enter Ref Code"
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
          module="inv"
          id={undefined}
        />
      </div>
    )
  );
};

export default CreateInventory;
