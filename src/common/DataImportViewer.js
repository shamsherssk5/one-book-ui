import React, { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";

const DataImportViewer = ({
  moduleName,
  Trigger_Button,
  data,
  handleUpload,
  uploadValue,
}) => {
  return (
    <Popup trigger={Trigger_Button} modal closeOnDocumentClick={false}>
      {(close) => (
        <div className="upload-box-modal file-viewer-parent">
          <div className="upload-box-header upload-box-header-file">
            {moduleName}
            <span style={{ float: "right", marginRight: "2vw" }}></span>
            <svg
              onClick={() => close()}
              className="close-cross-button"
              version="1.1"
              viewBox="0 0 122.878 122.88"
            >
              <g>
                <path d="M1.426,8.313c-1.901-1.901-1.901-4.984,0-6.886c1.901-1.902,4.984-1.902,6.886,0l53.127,53.127l53.127-53.127 c1.901-1.902,4.984-1.902,6.887,0c1.901,1.901,1.901,4.985,0,6.886L68.324,61.439l53.128,53.128c1.901,1.901,1.901,4.984,0,6.886 c-1.902,1.902-4.985,1.902-6.887,0L61.438,68.326L8.312,121.453c-1.901,1.902-4.984,1.902-6.886,0 c-1.901-1.901-1.901-4.984,0-6.886l53.127-53.128L1.426,8.313L1.426,8.313z" />
              </g>
            </svg>
          </div>
          <div
            style={{
              width: "100%",
              position: "relative",
              display: "flex",
              height: "80vh",
              overflow: "auto",
            }}
          >
            <div
              className="upload-box-content file-viewer-content"
              style={{ background: "white" }}
            >
              {data && data.length && (
                <table className="data-import-viewer-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      {data[0].map((column) => (
                        <th>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.slice(1)].map((row, i) => (
                      <tr>
                        <td>{i + 1}</td>
                        {row.map((column) => (
                          <td>{column}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div
            className="upload-box-actions "
            style={{ borderTop: "2px solid #ff820e" }}
          >
            <div style={{ width: "50%", textAlign: "left" }}>
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
                width: "50%",
                textAlign: "right",
              }}
            >
              <button
                className="save-button upload-close-button"
                onClick={handleUpload}
              >
                {uploadValue}
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};
export default DataImportViewer;
