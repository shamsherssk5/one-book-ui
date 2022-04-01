import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import G_plus from "../../assets/images/g_plus.png";

const EditContact = ({ rightContent, selectData, setData, setRightContent, setToken}) => {
  let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
  const [submitValue, setSubmitValue] = useState("Update");
  const [additionalContact, setAdditionalContact] = useState();
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const [formContactData, setformContactData] = useState({});
  const handleFormContactChange = (event) => {
    const { name, value } = event.target;
    setformContactData({
      ...formContactData,
      [name]: value,
    });
  };

  const formValidation = (values) => {
    console.log("Form validation starts");
    if (!values.companyName) {
      setformContactData({
        ...formContactData,
        error: "Please fill company name",
      });
      return;
    }
    if (!values.contactPerson) {
      setformContactData({
        ...formContactData,
        error: "Please fill contact person",
      });
      return;
    }
    if (values.email && regex.test(formContactData.email) === false) {
      setformContactData({
        ...formContactData,
        error: "Please fill a valid email id",
      });
      return;
    }

    if (!values.contactNumber && !additionalContact) {
      setformContactData({
        ...formContactData,
        error: "Please fill contact number",
      });
      return;
    }

    setformContactData({ ...formContactData, error: undefined });
    setSubmitValue("Saving...");
  };

  const handleContactFormSubmit = (event) => {
    event.preventDefault();
    formValidation(formContactData);
  };

  useEffect(async () => {
    if (submitValue === "Saving..." && !formContactData.error) {
      formContactData.contactNumber=formContactData.contactNumber+(additionalContact?","+additionalContact:"")
      formContactData["assignee"]=currentUser.username;
      await axios.post(process.env.REACT_APP_API_ENDPOINT + '/phoneBook/update-phone-book?timeZone='+currentUser.timeZone, formContactData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
          if (res.data.error) {
              setToken(undefined);
          }

          setData((prev) => {
            let updatedPhoneBook = prev.filter((p) => {
              if (p.ID === selectData.ID) {
                p.companyName = formContactData.companyName;
                p.companyNameAlias = formContactData.companyNameAlias;
                p.contactPerson = formContactData.contactPerson;
                p.contactNumber = formContactData.contactNumber;
                p.keyWords = formContactData.keyWords;
                p.rating = formContactData.rating;
                p.category = formContactData.category;
                p.email = formContactData.email;
                p.error = undefined;
                p.address = formContactData.address;
                p.history.unshift({"moduleID":formContactData.ID,"action":"Edited","dateAndTime": new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone})).toLocaleString(),"name":currentUser.username});
              }
              return p;
            });
            return updatedPhoneBook;
          });
          setSubmitValue("Update");
          setRightContent("Details");
          toast.success("Contact Updated Successfully");
      
        }).catch((err) => {
          console.log(err);
          toast.error("Contact updation failed");
          setSubmitValue("Update");
      })
      
    }
  
  }, [submitValue]);

  useEffect(() => {
    if (rightContent != "Edit" || selectData == undefined) return;
    if (selectData.contactNumber.split(",").length > 1) {
      setAdditionalContact(selectData.contactNumber.split(",")[0]);
    }
    setformContactData({
      companyName: selectData.companyName,
      companyNameAlias: selectData.companyNameAlias,
      contactPerson: selectData.contactPerson,
      contactNumber: selectData.contactNumber.split(",").length > 1 ? selectData.contactNumber.split(",")[1] : selectData.contactNumber,
      keyWords: selectData.keyWords,
      rating: selectData.rating,
      category: selectData.category,
      email: selectData.email,
      error: undefined,
      address: selectData.address,
      ID:selectData.ID
    });
  }, [rightContent]);

  return (
    rightContent === "Edit" && (
      <div className="task-details-box">
        <div className="create-task-container task-details-container">
          <form name="taskForm" autoComplete="off">
            <div className="task-form-container">
              {formContactData.error ? (
                <div>
                  <span class="warning-text-error warning-text">
                    {formContactData.error}
                  </span>
                </div>
              ) : (
                ""
              )}
              <fieldset>
                <legend>Company Name</legend>
                <input
                  type="text"
                  name="companyName"
                  value={formContactData.companyName}
                  onChange={handleFormContactChange}
                  placeholder="Enter Company Name"
                  maxLength="75"
                />
              </fieldset>
              <fieldset>
                <legend>Contact Person</legend>
                <input
                  type="text"
                  name="contactPerson"
                  value={formContactData.contactPerson}
                  onChange={handleFormContactChange}
                  placeholder="Enter Contact Person Name"
                  maxLength="75"
                />
              </fieldset>
              <fieldset>
                <legend>Email</legend>
                <input
                  type="email"
                  name="email"
                  value={formContactData.email}
                  onChange={handleFormContactChange}
                  placeholder="Email address (Optional)"
                  maxLength="75"
                />
              </fieldset>
              {additionalContact && <>
                <span className="additional-text">+{additionalContact}
                  <small
                    title="Remove Contact"
                    style={{ paddingLeft: "5px", fontSize: "0.88vw", color: "#0b375b" }}
                    onClick={() => { setAdditionalContact() }} >
                    &#10006;
                  </small>
                </span>
                <p></p>
              </>
              }
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: additionalContact?"100%":"86%" }}>
                  <fieldset>
                    <legend>Contact Number</legend>
                    <PhoneInput
                      name="contactNumber"
                      country={"in"}
                      value={formContactData.contactNumber}
                      placeholder="Enter Contact Number"
                      onChange={p => setformContactData({ ...formContactData, contactNumber: p, error:undefined })
                      }
                    />
                  </fieldset>

                </div>
                { !additionalContact &&<div style={{ width: "14%", position: "relative" }}>
                   <img className="phonebook-contact-add" src={G_plus} onClick={() => { setAdditionalContact(formContactData.contactNumber); setformContactData({ ...formContactData, contactNumber: "" }) }} />
                </div>}
              </div>
              <fieldset>
                <legend>Address</legend>
                <input
                  type="text"
                  name="address"
                  value={formContactData.address}
                  onChange={handleFormContactChange}
                  placeholder="(Optional) - 300 Characters MAX"
                  maxLength="300"
                />
              </fieldset>
              <fieldset>
                <legend>Key Words/ Type of work</legend>
                <input
                  type="text"
                  name="keyWords"
                  value={formContactData.keyWords}
                  onChange={handleFormContactChange}
                  placeholder="(Optional) - 300 Characters MAX"
                  maxLength="300"
                />
              </fieldset>
              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={submitValue}
                  // disabled=
                  onClick={handleContactFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default EditContact;
