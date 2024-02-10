import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import generateEstPDF from "./EstimatePDFGenerator";
import generateQuotePDF from "../../quotes/components/QuotePDFGenerator";

const EstimateEmail = ({
  Trigger_Button,
  setToken,
  currentEstimate,
  estimateRows,
  stats,
  logo,
  isModuleRestricted,
  customer,
  organization,
  financialDetails,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let emptyFormData = {
    email: "",
    subject: "",
    message: "",
  };
  const [formData, setFormData] = useState(emptyFormData);
  const [sendMe, setSendMe] = useState(true);
  const [isValidEmail, setIsvalidEmail] = useState(false);
  const [senddButton, setSendButton] = useState("Send");
  const handlePopupOpen = () => {
    setSendButton("Send");
    setIsvalidEmail(false);
    setSendMe(true);
    setFormData({
      ...formData,
      email: "",
      subject:
        currentEstimate.refText +
        currentEstimate.refNum +
        "-" +
        currentEstimate.customer +
        "-" +
        currentEstimate.projName,
      message:
        "Hi,\n\nThank you for the Enquiry.\n\nHere's Quote: " +
        currentEstimate.refText +
        currentEstimate.refNum +
        " for " +
        currentEstimate.currency +
        " " +
        (stats.grandTotal || 0).toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
        }) +
        "\n\n\nIf you have any concerns, please let us know.\n\nRegards,\n" +
        currentUser.username,
    });
  };
  const sendEmail = async () => {
    if (!isValidEmail) return;
    let doc = generateEstPDF(
      estimateRows,
      currentEstimate,
      stats,
      false,
      logo,
      customer,
      organization,
      financialDetails,
      isModuleRestricted
    );
    const form = new FormData();
    form.append(
      "file",
      new File(
        [doc.output("blob")],
        currentEstimate.refText +
          currentEstimate.refNum +
          "-" +
          currentEstimate.customer +
          "-" +
          currentEstimate.projName +
          ".pdf",
        {
          type: "application/pdf",
          lastModified: new Date().getTime(),
        }
      )
    );
    setSendButton("...Sending");
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/export-file?module=Estimate - PDF Export&email=" +
          (sendMe ? currentUser.email : "") +
          "&to=" +
          formData.email +
          "&subject=" +
          formData.subject +
          "&message=" +
          formData.message,
        form,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        setSendButton("Send");
        document
          .querySelector("button.save-button.upload-close-button")
          .click();
        toast.success("Email Sent Successfully");
        setFormData(emptyFormData);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Sending Email Failed");
        setSendButton("Send");
      });
  };
  const emailValidation = (value) => {
    let mailformat =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    setIsvalidEmail(value.match(mailformat));
  };
  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={handlePopupOpen}
    >
      {(close) => (
        <div className="send-email-container myscrollbar">
          <div className="main-right-div category-settings-main">
            <div className="right-div-header" style={{ border: "none" }}>
              <span
                className="right-header-title"
                style={{ left: "3%", top: "50%" }}
              >
                Send Estimate
              </span>
              <svg
                onClick={() => close()}
                className="close-cross-button category-close-cross-button"
                version="1.1"
                viewBox="0 0 122.878 122.88"
              >
                <g>
                  <path d="M1.426,8.313c-1.901-1.901-1.901-4.984,0-6.886c1.901-1.902,4.984-1.902,6.886,0l53.127,53.127l53.127-53.127 c1.901-1.902,4.984-1.902,6.887,0c1.901,1.901,1.901,4.985,0,6.886L68.324,61.439l53.128,53.128c1.901,1.901,1.901,4.984,0,6.886 c-1.902,1.902-4.985,1.902-6.887,0L61.438,68.326L8.312,121.453c-1.901,1.902-4.984,1.902-6.886,0 c-1.901-1.901-1.901-4.984,0-6.886l53.127-53.128L1.426,8.313L1.426,8.313z" />
                </g>
              </svg>
            </div>
            <div className="email-data-container">
              <div className="email-to-subject-container">
                <span class="email-input-header">To</span>
                <p>
                  <input
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      emailValidation(e.target.value);
                    }}
                    autoFocus
                    className="email-input-type"
                    placeholder="Enter your contact's email address"
                  ></input>
                </p>
              </div>
              <div className="email-to-subject-container">
                <span class="email-input-header">Subject</span>
                <p>
                  <input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="email-input-type"
                  ></input>
                </p>
              </div>
              <div className="email-message-container">
                <span class="email-input-header ">Message</span>
                <p>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="email-input-type email-input-message"
                  ></textarea>
                </p>
              </div>
              <div className="chckbox-container">
                <input
                  onChange={(e) => setSendMe(e.target.checked)}
                  className="input-checkkbox-permissions"
                  type="checkbox"
                  checked={sendMe}
                />
                &nbsp;&nbsp;
                <span class="email-input-header">Send me a copy</span>
              </div>
            </div>
            <div className="email-box-actions">
              <div style={{ width: "60%", textAlign: "left" }}>
                <button
                  style={{ background: "#7C7C7C" }}
                  className="save-button upload-close-button"
                  onClick={() => {
                    close();
                  }}
                >
                  Cancel
                </button>
              </div>

              <div
                style={{
                  width: "60%",
                  textAlign: "right",
                  opacity: isValidEmail ? "1" : ".35",
                }}
              >
                <button
                  className="save-button upload-close-button"
                  onClick={sendEmail}
                >
                  {senddButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default EstimateEmail;
