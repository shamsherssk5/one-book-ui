import { useEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Popup from "reactjs-popup";
import Filter_Clear from "../tasks/assets/filter-clear.png";
import axios from "axios";
import toast from "react-hot-toast";
import DataImportViewer from "./DataImportViewer";
import readXlsxFile from "read-excel-file";

const DataImporter = ({
  moduleName,
  module,
  Trigger_Button,
  setToken,
  setRefresh,
}) => {
  const [error, setError] = useState();
  const [file, setFile] = useState();

  const [data, setData] = useState([]);

  const fileTypes = [".xls", ".xlsx", ".csv"];

  const [uploadValue, setUploadValue] = useState("Upload");

  const handleChange = (file) => {
    if (fileTypes.some((fileType) => file.name.includes(fileType))) {
      setFile(file);
      setError(undefined);
    } else {
      setError("File Type is not supported");
    }
  };

  useEffect(() => {
    if (file) {
      readXlsxFile(file).then((rows) => {
        setData(rows);
      });
    }
  }, [file]);

  const handleUpload = async () => {
    if (uploadValue === "...Uploading") return;
    if (!file) {
      setError("Please Choose a File");
      return;
    }
    if (data && data.length > 105) {
      setError("The maximum number of rows allowed is 100");
      return;
    }
    setError(undefined);
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    const formdata = new FormData();
    formdata.append("file", file);
    setUploadValue("...Uploading");
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/import-data?moduleName=" +
          module +
          "&username=" +
          currentUser.username +
          "&module=data-imports&orgID=" +
          currentUser.orgID,
        formdata,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setFile(undefined);
        setUploadValue("Upload");
        document
          .querySelector("button.save-button.upload-close-button")
          .click();
        document.body.click();
        toast.success(
          "Data import is in Progress...Please Stay on the Page!!!"
        );
        for (var start = 1; start < 5; start++) {
          setTimeout(() => {
            setRefresh(Math.random());
          }, 3000 * start);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Data Import - " + file.name + "+upload Failed");
        setUploadValue("Upload");
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
        <div className="upload-box-modal">
          <div className="upload-box-header"> Import {moduleName} </div>
          <div className="upload-box-content">
            <div className="upload-box-text">
              <div>
                The maximum number of rows allowed is 100. Please make sure that
                the data is in valid Format.
              </div>
              <div className="browse-button-container">
                <FileUploader
                  onSizeError={(err) => setError(err)}
                  maxSize="10"
                  handleChange={handleChange}
                  name=""
                  hoverTitle="Drop your file here"
                >
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <span style={{ color: "#353A42" }}>
                      Choose a file to upload
                    </span>
                    <span className="save-button browse-button">Browse</span>
                    {error && (
                      <div>
                        <span class="warning-text-error warning-text">
                          {error}
                        </span>
                      </div>
                    )}
                  </div>
                </FileUploader>
              </div>

              {file && (
                <>
                  <div className="files-name-upload-box">
                    {file.name}
                    <img
                      title="Delete File"
                      className="filter-clear-button upload-file-box-delete"
                      src={Filter_Clear}
                      onClick={() => setFile(undefined)}
                    />
                  </div>
                </>
              )}

              <div className="imp-text-upload-box download">
                <a
                  style={{
                    outline: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    textDecoration: "none",
                  }}
                  href={
                    process.env.REACT_APP_API_ENDPOINT +
                    "/auth/downLoadFile?name=/data-imports/sample/" +
                    module +
                    ".xlsx"
                  }
                >
                  Download a sample document
                </a>
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
                  setFile(undefined);
                  setError(undefined);
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
                opacity: file ? "1" : ".35",
              }}
            >
              {file && (
                <DataImportViewer
                  moduleName={moduleName}
                  data={data}
                  handleUpload={handleUpload}
                  uploadValue={uploadValue}
                  Trigger_Button={
                    <button
                      className="save-button upload-close-button"
                      style={{ marginRight: "1vw" }}
                    >
                      Preview
                    </button>
                  }
                />
              )}
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

export default DataImporter;
