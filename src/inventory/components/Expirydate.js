import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import DatePicker from "react-date-picker";

const ExpiryDate = ({
  Trigger_Button,
  expiryDate,
  setToken,
  invID,
  setData,
}) => {
  const [expDate, setExpDate] = useState();
  const [submitValue, setSubmitValue] = useState("Save");

  const handleSave = async () => {
    if (!expDate) return;
    setSubmitValue("...saving");
    let data = {
      expDate:
        expDate.getFullYear().toString() +
        "-" +
        (expDate.getMonth() + 1).toString() +
        "-" +
        expDate.getDate().toString(),
      invID: invID,
    };
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/inventory/update-expiry",
        data,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        setData((prev) => {
          let updatedData = prev.filter((i) => {
            if (i.invID === invID) {
              i.expiryDate = data.expDate;
            }
            return i;
          });
          return updatedData;
        });

        toast.success("Expiry Date Added Successfully");
        setSubmitValue("Save");
        setExpDate();
        document.body.click();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Expiry Date Addition failed");
        setSubmitValue("Save");
      });
  };

  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={() => {
        document.getElementsByClassName(
          "fade show popover bs-popover-bottom"
        )[0].style.display = "none";
        setExpDate(
          expiryDate !== null && expiryDate ? new Date(expiryDate) : undefined
        );
      }}
    >
      {(close) => (
        <div className="note-box-holder">
          <div className="note-box-header">Set Expiry Date</div>
          <div className="note-input">
            <div className="create-task-container task-details-container expirydate-holder">
              <fieldset>
                <legend>Expiry Date</legend>
                <DatePicker
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="YYYY"
                  onChange={setExpDate}
                  value={expDate}
                  required={true}
                  calendarIcon={null}
                  clearIcon={null}
                />
              </fieldset>
            </div>
          </div>
          <div
            className="upload-box-actions"
            style={{ display: "flex", paddingTop: "0.8vh" }}
          >
            <div style={{ width: "50%", textAlign: "left" }}>
              <button
                style={{ background: "#7C7C7C" }}
                className="save-button upload-close-button"
                onClick={() => {
                  close();
                  document.body.click();
                }}
              >
                Cancel
              </button>
            </div>

            <div
              style={{
                width: "50%",
                textAlign: "right",
                opacity: expDate ? "1" : ".35",
              }}
            >
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

export default ExpiryDate;
