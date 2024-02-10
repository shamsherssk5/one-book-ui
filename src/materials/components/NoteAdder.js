import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";

const NoteAdder = ({
  Trigger_Button,
  notes,
  setToken,
  type,
  id,
  setData,
  prodID,
}) => {
  const [note, setNote] = useState(notes);
  const [submitValue, setSubmitValue] = useState("Save");

  const handleSave = async () => {
    if (!note) return;
    setSubmitValue("...saving");
    let data = { type: type, id: id, note: note };
    await axios
      .post(process.env.REACT_APP_API_ENDPOINT + "/pnm/update-note", data, {
        headers: { Authorization: window.localStorage.getItem("token") },
      })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (type == "mat") {
          setData((prevState) => {
            let updateddata = prevState.filter((d) => {
              if (d.prodID === id) {
                d.notes = note;
              }
              return d;
            });
            return updateddata;
          });
        } else if (type === "vendor") {
          setData((prevState) => {
            let updateddata = prevState.filter((d) => {
              if (d.prodID === prodID) {
                let updVendors = d.vendor.filter((v) => {
                  if (v.id === id) {
                    v["notes"] = note;
                  }
                  return v;
                });
                d.vendor = updVendors;
              }
              return d;
            });
            return updateddata;
          });
        }

        toast.success("Note Added Successfully");
        setSubmitValue("Save");
        setNote("");
        document.body.click();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Note Addition failed");
        setSubmitValue("Save");
      });
  };

  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={() => {
        var elements = document.getElementsByClassName(
          "fade show popover bs-popover-bottom"
        );
        if (elements.length > 0) {
          elements[0].style.display = "none";
        }
      }}
    >
      {(close) => (
        <div className="note-box-holder">
          <div className="note-box-header">Add Note</div>
          <div className="note-box-side-header">Notes</div>
          <div className="note-input">
            <textarea
              id="notes"
              className="mat-notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Max 300 Characters"
              maxLength="300"
            />
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
                opacity: note ? "1" : ".35",
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

export default NoteAdder;
