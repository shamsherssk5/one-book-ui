import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import Open from "../../assets/images/next.png";

const ItemMovement = ({
  Trigger_Button,
  setToken,
  setData,
  currentInventory,
  heading,
  stores,
  type,
  available,
  isAdd,
  isEdit,
  setEditTrigger,
  currentVendor,
}) => {
  const [projects, setProjects] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [rackList, setRackList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [rackNo, setRackNo] = useState("");

  useEffect(() => {
    if (supplier) {
      let racks = [
        ...new Set(
          currentInventory.vendor
            .filter((v) => v.location === supplier)
            .map((v) => v.rackNo)
        ),
      ];
      setRackList(racks);
      if (racks.length === 1) {
        setRackNo(racks[0]);
        let u = currentInventory.vendor
          .filter((v) => v.location === supplier && v.rackNo === racks[0])
          .map((v) => v.total / v.qty);
        setFormdata({ ...formData, unitPrice: u[0] });
      } else {
        if (isEdit) {
          setRackNo(currentVendor.vendorName.split("/")[1]);
        } else {
          setRackNo("");
        }
      }
    }
  }, [supplier]);

  useEffect(() => {
    if (supplier && rackNo) {
      let u = currentInventory.vendor
        .filter((v) => v.location === supplier && v.rackNo === rackNo)
        .map((v) => v.total / v.qty);
      setFormdata({ ...formData, unitPrice: u[0] });
    }
  }, [rackNo]);

  useEffect(async () => {
    setSupplier("");
    await axios
      .get(process.env.REACT_APP_API_ENDPOINT + "/tasks/projects", {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setProjects(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [submitValue, setSubmitValue] = useState("Save");
  let types = {
    "Receive Item": "Received",
    "Receive Item": "Received",
    "Transfer Item": "Transferred",
    "Deliver Item": "Delivered",
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formData, [name]: value, error: undefined });
  };

  const intialValues = {
    invID: currentInventory.invID,
    qty: "",
    unitPrice: "",
    total: "",
    location: "",
    notes: "",
    vendorName: "",
    vendorPrice: 0,
    vendorCode: "",
    updatedBy: currentUser.username,
    lastUpdate: "",
    rackNo: "",
    error: undefined,
    moveType: types[heading],
  };

  useEffect(async () => {
    if (isEdit && currentVendor) {
      currentVendor["unitPrice"] = currentVendor.total / currentVendor.qty;
      setFormdata(currentVendor);
      if (heading !== "Receive Item") {
        setSupplier(currentVendor.vendorName.split("/")[0]);
      }
    }
  }, [isEdit, currentVendor]);

  const [formData, setFormdata] = useState(intialValues);
  const [openDeliveryAddr, setOpenDeliveryAddr] = useState(false);

  const validateFormData = (values) => {
    if (!values.qty) {
      setFormdata({ ...formData, error: "Please Enter Quantity" });
      return true;
    }
    if (values.qty && isNaN(values.qty)) {
      setFormdata({
        ...formData,
        error: "Please Enter Numeric Quantity",
      });
      return true;
    }

    if (heading === "Receive Item" && !values.unitPrice) {
      setFormdata({ ...formData, error: "Please Enter Unit price" });
      return true;
    }

    if (values.unitPrice && isNaN(values.unitPrice)) {
      setFormdata({
        ...formData,
        error: "Please Enter Numeric Unit Price",
      });
      return true;
    }

    if (!values.location && type !== "disposal") {
      setFormdata({
        ...formData,
        error: {
          receive: "Please Select Storage Location",
          project: "Please Select Project",
          delivery: "Please Enter Delivery Address",
        }[type],
      });
      return true;
    }

    if (heading !== "Receive Item" && !supplier) {
      setFormdata({
        ...formData,
        error: "Please Select Supplier",
      });
      return true;
    }

    if (
      heading !== "Receive Item" &&
      rackList.length > 1 &&
      !rackList.includes(rackNo)
    ) {
      setFormdata({
        ...formData,
        error: "Please Select Supplier's Rack No",
      });
      return true;
    }

    if (!isEdit && heading !== "Receive Item" && values.qty > available) {
      setFormdata({
        ...formData,
        error: "Quantity should be equal to or less than Available stock",
      });
      return true;
    }

    if (
      isEdit &&
      heading !== "Receive Item" &&
      values.qty > available + parseInt(currentVendor.qty)
    ) {
      setFormdata({
        ...formData,
        error: "Quantity should be equal to or less than Available stock",
      });
      return true;
    }
    setFormdata({ ...formData, error: undefined });
    return false;
  };

  const handleSave = async () => {
    if (validateFormData(formData)) return;
    formData.total = formData.qty * formData.unitPrice;
    if (type === "disposal") {
      formData["moveFromTo"] = "Disposal";
    } else {
      formData["moveFromTo"] = "";
    }

    if (heading !== "Receive Item") {
      formData.vendorName = `${supplier}/${rackNo}`;
    }
    setSubmitValue("...saving");
    if (isEdit) {
      formData["updatedBy"] = currentUser.username;
      formData["lastUpdate"] = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      ).toLocaleString();
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/inventory/editItem?timeZone=" +
            currentUser.timeZone,
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }

          setData((prevState) => {
            let prev = [...prevState];
            let updateddata = prev.filter((d) => {
              if (d.invID === currentInventory.invID) {
                d.iqty =
                  d.iqty +
                  (heading === "Receive Item"
                    ? parseInt(formData.qty - currentVendor.qty)
                    : -parseInt(formData.qty - currentVendor.qty));
                d.itotal =
                  d.itotal +
                  (heading === "Receive Item"
                    ? parseInt(formData.total - currentVendor.total)
                    : -parseInt(formData.total - currentVendor.total));
                d.ilastUpdated = new Date(
                  new Date().toLocaleString("en-US", {
                    timeZone: currentUser.timeZone,
                  })
                ).toLocaleString();
                let updatedVendor = d.vendor.map((v) =>
                  v.id === formData.id ? formData : v
                );
                d.vendor = updatedVendor;
                d.history.unshift({
                  moduleID: currentInventory.invID,
                  action: "item Updated",
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: currentUser.username,
                });
              }
              return d;
            });
            return updateddata;
          });

          toast.success("Item Updated Successfully");
          setSubmitValue("Save");
          document.body.click();
          setEditTrigger();
        })
        .catch((err) => {
          console.log(err);
          toast.error("Item Updation failed");
          setSubmitValue("Save");
        });
    } else {
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/inventory/saveItem?timeZone=" +
            currentUser.timeZone,
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formData["id"] = res.data.insertId;
          formData["lastUpdate"] = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: currentUser.timeZone,
            })
          ).toLocaleString();
          setData((prevState) => {
            let prev = [...prevState];
            let updateddata = prev.filter((d) => {
              if (d.invID === currentInventory.invID) {
                d.iqty =
                  d.iqty +
                  (heading === "Receive Item"
                    ? parseInt(formData.qty)
                    : -parseInt(formData.qty));
                d.itotal =
                  d.itotal +
                  (heading === "Receive Item"
                    ? parseInt(formData.total)
                    : -parseInt(formData.total));
                d.ilastUpdated = new Date(
                  new Date().toLocaleString("en-US", {
                    timeZone: currentUser.timeZone,
                  })
                ).toLocaleString();
                d.vendor.unshift(formData);
                d.history.unshift({
                  moduleID: currentInventory.invID,
                  action: "item " + types[heading],
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: currentUser.username,
                });
              }
              return d;
            });
            return updateddata;
          });

          toast.success("Item " + types[heading] + " Successfully");
          setSubmitValue("Save");
          document.body.click();
        })
        .catch((err) => {
          console.log(err);
          toast.error("Item Updation failed");
          setSubmitValue("Save");
        });
    }
  };

  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={() => {
        if (heading !== "Receive Item" && available === 0 && !isEdit) {
          toast.error("Zero Stock(s) available for Transfer");
          document.body.click();
          return;
        }
        let elements = document.getElementsByClassName(
          "fade show popover bs-popover-bottom"
        );
        let ele = document.getElementsByClassName(
          "fade show popover bs-popover-end"
        );

        [...elements].forEach((element) => {
          element.style.display = "none";
        });

        [...ele].forEach((element) => {
          element.style.display = "none";
        });

        if (isEdit) {
          setEditTrigger(true);
        }

        if (heading !== "Receive Item") {
          setSuppliersList([
            ...new Set(
              currentInventory.vendor
                .filter((v) => v.moveType === "Received")
                .map((v) => v.location)
            ),
          ]);
        }
      }}
    >
      {(close) => (
        <div className="upload-box-modal movement-box-modal">
          <div className="upload-box-header">
            {isEdit && "Edit"} {isAdd ? "Add item" : heading}{" "}
          </div>
          <div className="upload-box-content">
            <div className="upload-box-text">
              <div className="create-task-container task-details-container movement-container">
                {formData.error && (
                  <div>
                    <span class="warning-text-error warning-text">
                      {formData.error}
                    </span>
                  </div>
                )}
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
                  <div style={{ width: "4%" }}></div>
                  <div style={{ width: "48%" }}>
                    {heading === "Receive Item" ? (
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
                    ) : (
                      <fieldset>
                        <legend>Value</legend>
                        <input
                          readOnly={true}
                          type="text"
                          name="total"
                          value={formData.unitPrice * formData.qty}
                          onChange={handleFormChange}
                          placeholder="Total"
                          min={0}
                        />
                      </fieldset>
                    )}
                  </div>
                </div>

                {heading === "Receive Item" && (
                  <fieldset>
                    <legend>Value</legend>
                    <input
                      readOnly="true"
                      type="text"
                      name="total"
                      value={formData.unitPrice * formData.qty}
                      onChange={handleFormChange}
                      placeholder="Total"
                      min={0}
                    />
                  </fieldset>
                )}

                {heading !== "Receive Item" && (
                  <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "48%" }}>
                      <fieldset>
                        <legend>Supplier</legend>
                        <select
                          className="title"
                          name="supplier"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          required
                        >
                          <option value="" disabled selected>
                            Select Supplier
                          </option>
                          {suppliersList.map((v, index) => (
                            <option value={v}>{v}</option>
                          ))}
                        </select>
                      </fieldset>
                    </div>
                    <div style={{ width: "4%" }} />
                    <div style={{ width: "48%" }}>
                      <fieldset>
                        <legend>Rack No</legend>
                        <select
                          className="title"
                          name="supplier"
                          value={rackNo}
                          onChange={(e) => setRackNo(e.target.value)}
                          required
                        >
                          <option value="" disabled selected>
                            Select Rack No
                          </option>
                          {rackList.map((v, index) => (
                            <option value={v}>{v}</option>
                          ))}
                        </select>
                      </fieldset>
                    </div>
                  </div>
                )}

                {
                  {
                    receive: (
                      <>
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
                              <option
                                value={`${store.warehouseName}-${store.area}`}
                              >
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
                      </>
                    ),
                    project: (
                      <fieldset>
                        <legend>project</legend>
                        <select
                          className="title"
                          name="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="" disabled selected>
                            Select Project
                          </option>
                          {projects && projects.length > 0
                            ? projects.map((p) => (
                                <option
                                  value={`<span>(PROJ-${p.projID})<br/>${p.name}</span>`}
                                >
                                  {p.name}
                                </option>
                              ))
                            : ""}
                        </select>
                        ,
                      </fieldset>
                    ),

                    delivery: (
                      <fieldset>
                        <legend>Address</legend>
                        <textarea
                          id="notes"
                          name="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          placeholder="Enter Address"
                          maxLength="150"
                        />
                      </fieldset>
                    ),
                  }[type]
                }
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
                {heading === "Receive Item" && (
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
                )}

                {openDeliveryAddr && (
                  <div>
                    <fieldset>
                      <legend>Vendor Name</legend>
                      <input
                        type="text"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleFormChange}
                        placeholder="Select/Add vendor"
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
                            value={formData.vendorPrice}
                            onChange={handleFormChange}
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
                            value={formData.vendorCode}
                            onChange={handleFormChange}
                            placeholder="Enter Vendor Ref Code"
                          />
                        </fieldset>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="upload-box-actions">
            <div style={{ width: "50%", textAlign: "left" }}>
              <button
                style={{ background: "#7C7C7C" }}
                className="save-button upload-close-button"
                onClick={() => {
                  close();
                  isEdit && setEditTrigger();
                  document.body.click();
                }}
              >
                Cancel
              </button>
            </div>

            <div style={{ width: "50%", textAlign: "right" }}>
              <button
                className="save-button upload-close-button"
                onClick={handleSave}
              >
                {submitValue}
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};
export default ItemMovement;
