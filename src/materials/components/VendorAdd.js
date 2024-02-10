import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const VendorAdd = ({
  rightContent,
  setToken,
  setRightContent,
  currentMaterial,
  setData,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const intialVendorValues = {
    vendorName: "",
    vendorPrice: 0,
    vendorCode: "",
    updatedBy: currentUser.username,
    error: undefined,
  };

  const [vendorFormData, setVendorFormdata] = useState(intialVendorValues);
  const [submitVendorvalue, setSubmitVendorvalue] = useState("Save");

  const handleVendorFormChange = (e) => {
    const { name, value } = e.target;
    setVendorFormdata({ ...vendorFormData, [name]: value });
  };

  const validate = (values) => {
    if (values.vendorCode && values.vendorPrice && values.vendorName) {
      setVendorFormdata({ ...vendorFormData, error: undefined });
    } else {
      setVendorFormdata({
        ...vendorFormData,
        error: "Please Enter all the Fields",
      });
      return;
    }
  };

  const handleVendorFormSubmit = (e) => {
    e.preventDefault();

    validate(vendorFormData);

    setSubmitVendorvalue("...Saving");
  };

  useEffect(async () => {
    if (submitVendorvalue === "...Saving" && !vendorFormData.error) {
      vendorFormData["prodID"] = currentMaterial.prodID;

      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      vendorFormData["lastUpdate"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/pnm/add-vendor?timeZone=" +
            currentUser.timeZone,
          vendorFormData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Vendor added successfully");
          vendorFormData["id"] = res.data.insertId;
          setData((prevState) => {
            let updateddata = prevState.filter((d) => {
              if (d.prodID === currentMaterial.prodID) {
                d.vendor.push(vendorFormData);
                d.history.unshift({
                  moduleID: currentMaterial.prodID,
                  action: "Added Vendor",
                  description: vendorFormData.vendorName,
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: vendorFormData.updatedBy,
                });
              }
              return d;
            });
            return updateddata;
          });
          setVendorFormdata(intialVendorValues);
          setSubmitVendorvalue("Save");
          setRightContent("Details");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Vendor creation failed");
          setSubmitVendorvalue("Save");
        });
    } else {
      setSubmitVendorvalue("Save");
    }
  }, [submitVendorvalue]);

  return (
    rightContent === "VendorAdd" && (
      <div className="task-details-box">
        <div className="create-task-container task-details-container">
          <form name="vendorForm" autocomplete="off">
            <div className="task-form-container">
              {vendorFormData.error && (
                <div>
                  <span class="warning-text-error warning-text">
                    {vendorFormData.error}
                  </span>
                </div>
              )}
              <fieldset>
                <legend>Vendor Name</legend>
                <input
                  type="text"
                  name="vendorName"
                  value={vendorFormData.vendorName}
                  onChange={handleVendorFormChange}
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
                      value={vendorFormData.vendorPrice}
                      onChange={handleVendorFormChange}
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
                      value={vendorFormData.vendorCode}
                      onChange={handleVendorFormChange}
                      placeholder="Enter Prod Ref Code"
                    />
                  </fieldset>
                </div>
              </div>

              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={submitVendorvalue}
                  onClick={handleVendorFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default VendorAdd;
