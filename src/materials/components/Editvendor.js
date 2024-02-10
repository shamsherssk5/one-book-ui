import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Editvendor = ({
  rightContent,
  setToken,
  setRightContent,
  currentVendor,
  setData,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));

  const [vendorFormData, setVendorFormdata] = useState({});
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
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      vendorFormData["lastUpdate"] =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString() +
        "-" +
        d.getDate().toString();
      vendorFormData["updatedBy"] = currentUser.username;
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/pnm/update-vendor?timeZone=" +
            currentUser.timeZone,
          vendorFormData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Vendor updated successfully");
          setData((prevState) => {
            let updateddata = prevState.filter((d) => {
              if (d.prodID === currentVendor.prodID) {
                d.vendor.filter((v) => {
                  if (v.id === currentVendor.id) {
                    Object.keys(vendorFormData).forEach((key) => {
                      v[key] = vendorFormData[key];
                    });
                  }
                  return v;
                });
                d.history.unshift({
                  moduleID: currentVendor.prodID,
                  action: "Edited Vendor",
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
          setSubmitVendorvalue("Save");
          setRightContent("Details");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Vendor updation failed");
          setSubmitVendorvalue("Save");
        });
    } else {
      setSubmitVendorvalue("Save");
    }
  }, [submitVendorvalue]);

  useEffect(() => {
    if (rightContent !== "VendorEdit") return;
    if (currentVendor) {
      setVendorFormdata(currentVendor);
    }
  }, [currentVendor, rightContent]);
  return (
    rightContent === "VendorEdit" && (
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

export default Editvendor;
