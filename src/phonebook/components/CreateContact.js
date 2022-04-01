import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import G_plus from "../../assets/images/g_plus.png";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";

const CreateContact = ({ rightContent,setRightContent, setSelectData, setData, setToken }) => {
  let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
  const [files, setFiles] = useState([]);
  const [additionalContact, setAdditionalContact] = useState();
  const ref = useRef(null);
  const handleDelete = (id) => {
    setFiles(prev => {
      let f = prev.filter(file => file.fileID !== id)
      return f;
      ;
    })
  }

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  }
  const [submitValue, setSubmitValue] = useState("Save");
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  let emptyContact={
    companyName: "",
    contactPerson: "",
    contactNumber: "",
    keyWords: "",
    rating: 3,
    category: "preferred",
    email: "",
    error: undefined,
    orgID:currentUser.orgID,
    address:"",
    assignee:currentUser.username
  }  
  const [formContactData, setformContactData] = useState(emptyContact);

  const handleFormContactChange = (event) => {
    const { name, value } = event.target;
    setformContactData({
      ...formContactData,
      [name]: value, error:undefined
    });
  };

  const formValidation = (values) => {
    console.log("Form validation starts");
    if (!values.companyName) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please fill company name",
      });
      return;
    }
    if (!values.contactPerson) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please fill contact person",
      });
      return;
    }
    if (values.email && regex.test(formContactData.email) === false) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please fill a valid email id",
      });
      return;
    }
    if (!values.contactNumber && !additionalContact) {
      ref.current.scrollTop = 0;
      // check phone number count
      setformContactData({
        ...formContactData,
        error: "Please fill contact number",
      });
      return;
    }
    setformContactData({ ...formContactData, error: undefined });
    setSubmitValue("...Saving");
    console.log("Form validation ends");
  };

  const handleContactFormSubmit = (event) => {
    event.preventDefault();
    formValidation(formContactData);
  };

  useEffect(async () => {
    console.log(formContactData); // function
    if (submitValue === "...Saving" && !formContactData.error) {
      formContactData['attachments'] = files;
      formContactData.contactNumber=formContactData.contactNumber+(additionalContact?","+additionalContact:"")
      await axios.post(process.env.REACT_APP_API_ENDPOINT + '/phoneBook/create-phone-book?timeZone='+currentUser.timeZone, formContactData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
          if (res.data.error) {
              setToken(undefined);
          }
          formContactData["ID"]=res.data.insertId;
          formContactData["refText"]="CON-";
          formContactData["refNum"]="1000";
          formContactData['history']=[];
          formContactData['conversations']=[];
          formContactData['creationTime']=new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone})).toLocaleString()
          formContactData.history.unshift({"moduleID":formContactData.iD,"action":"Added","dateAndTime": new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone})).toLocaleString(),"name":formContactData.assignee});
          setData((prevState) => [formContactData,...prevState]);
          setSelectData(formContactData);
          setSubmitValue("Save");
          setAdditionalContact();
          setFiles([]);
          setRightContent("Details");
          setformContactData(emptyContact);
        }).catch((err) => {
          console.log(err);
          toast.error("Contact creation failed");
          setSubmitValue("Save");
      })
    }
    
  }, [submitValue]);

  return (
    rightContent === "Create" && (
      <div className="task-details-box" ref={ref}>
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
                <textarea id="notes" name="address" value={formContactData.address} onChange={handleFormContactChange} placeholder="(Optional) - 300 Characters MAX" maxLength="300" />
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
                  onClick={handleContactFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>
        <Gap />
        <FileUploaderListViewer isView={false} setToken={setToken} data={files} handleUpload={handleUpload} handleDelete={handleDelete} module="phonebook" id={undefined} />
      </div>
    )
  );
};

export default CreateContact;
