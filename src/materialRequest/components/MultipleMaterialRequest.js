import React, { useRef } from "react";
import Popup from "reactjs-popup";
import { useState } from "react";
import g_plus from "../../assets/images/g_plus.png";
import MaterialRequestRow from "./MaterialRequestRow";
import { getConfirmation } from "../../common/DialogBox";
import toast from "react-hot-toast";
import axios from "axios";
const MultipleMaterialRequest = ({
  Trigger_Button,
  setToken,
  departments,
  pnm,
  unitData,
  setRefresh,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const scrollRef = useRef(null);
  let emptyFormData = {
    department: "",
    materialName: "",
    quantity: 0,
    unit: "",
    projectID: "",
    priority: "",
    notes: "",
    isCustomDate: false,
    error: undefined,
    priority_date: "",
    createdBy: currentUser.username,
    orgID: currentUser.orgID,
    status: "Order Request",
  };
  const [materialRows, setMaterialRows] = useState([emptyFormData]);

  const [senddButton, setSendButton] = useState("Send");
  const handlePopupOpen = () => {
    setMaterialRows([emptyFormData]);
    setSendButton("Send");
  };
  const createRequest = async () => {
    let errorIndex = [];
    materialRows.forEach((row, i) => {
      if (
        !row.department ||
        !row.materialName ||
        !row.quantity ||
        !row.unit ||
        !row.priority ||
        (row.quantity && row.quantity <= 0) ||
        (row.quantity && isNaN(row.quantity))
      ) {
        errorIndex.push(i);
      }
    });
    if (errorIndex.length) {
      setMaterialRows((prev) => {
        let data = [...prev].map((mat, i) => {
          if (errorIndex.includes(i)) {
            mat.error = true;
          }
          return mat;
        });
        return data;
      });
      scrollRef.current.scrollTop = 0;
      alert("Invalid data at row(s) :" + errorIndex.toString());
    } else {
      setSendButton("...Sending");
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/mtr/create-multiple-mtr?timeZone=" +
            currentUser.timeZone,
          { mtrs: materialRows },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          document
            .querySelector("button.save-button.upload-close-button")
            .click();
          toast.success("Matrial Request creation in Progress. Please wait...");
          setTimeout(() => {
            setRefresh(Math.random());
          }, 2000);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Matrial Request creation failed");
          setSendButton("Send");
        });
    }
  };

  const handleRowAddition = () => {
    setMaterialRows([...materialRows, emptyFormData]);
    scrollRef.current.scrollTop += 50;
  };
  const handleRowDeletion = async (i) => {
    document.body.click();
    if (materialRows.length === 1) {
      return;
    }
    await getConfirmation(
      "You want to delete Selected Material Request?",
      () => {
        setMaterialRows([...materialRows.filter((m, index) => index != i)]);
      }
    );
  };
  return (
    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
      onOpen={handlePopupOpen}
    >
      {(close) => (
        <div className="mult-mat-req-container  myscrollbar">
          <div className="main-right-div category-settings-main">
            <div className="right-div-header" style={{ border: "none" }}>
              <span
                className="right-header-title"
                style={{ left: "3%", top: "50%" }}
              >
                Create Multiple Material Requests
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
              <div className="mat-rows-cont" ref={scrollRef}>
                <table className="multi-mat-table">
                  <tbody>
                    {materialRows.map((m, i) => (
                      <tr>
                        <td className={m.error ? "multi-mat-row-error" : ""}>
                          <MaterialRequestRow
                            mtr={m}
                            index={i}
                            departments={departments}
                            pnm={pnm}
                            unitData={unitData}
                            handleRowDeletion={handleRowDeletion}
                            setMaterialRows={setMaterialRows}
                          ></MaterialRequestRow>
                        </td>
                      </tr>
                    ))}

                    {materialRows.length < 11 && (
                      <tr>
                        <td style={{ textAlign: "left" }}>
                          <img
                            className="g_plus"
                            src={g_plus}
                            onClick={handleRowAddition}
                            style={{
                              left: "auto",
                              top: "auto",
                              position: "relative",
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                  opacity: true ? "1" : ".35",
                }}
              >
                <button
                  className="save-button upload-close-button"
                  onClick={createRequest}
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

export default MultipleMaterialRequest;
