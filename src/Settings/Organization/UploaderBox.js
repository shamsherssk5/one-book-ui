import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Popup from "reactjs-popup";
import './uploaderBox.css';
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import axios from "axios";
import toast from "react-hot-toast";

const Modal = ({ Trigger_Button, id, setToken, orgData, setOrgdData }) => {
  const [error, setError] = useState();
  const [file, setFile] = useState();

  const fileTypes = ["JPG", "PNG", "JPEG"];

  const [uploadValue, setUploadValue] = useState("Upload");

  const handleChange = (file) => {
    setFile(file);
    setError(undefined);
  }

  const handleUpload = async () => {
    if (uploadValue === "...Uploading") return;
    if (!file) {
      setError("Please Choose a File");
      return;
    }
    if (!id) {
      setError("Error Occured! Please try again");
      return;
    }
    setError(undefined);
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    const formdata = new FormData();
    formdata.append('file', file);
    setUploadValue("...Uploading");
    await axios.post(process.env.REACT_APP_API_ENDPOINT + '/files/uploadFile?moduleID=org' + id + '&username=' + currentUser.username + "&module=orgLogo", formdata, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        toast.success("Logo " + file.name + " uploaded Successfully");
        setFile(undefined);
        setOrgdData(prev => {
          return { ...prev, filename: res.data.filename }
        });
        setUploadValue("Upload");
        document.querySelector("button.save-button.upload-close-button").click();

      }).catch((err) => {
        console.log(err);
        toast.error("Logo " + file.name + "+upload Failed");
        setUploadValue("Upload");
      })
  }

  return (

    <Popup
      trigger={Trigger_Button}
      modal
      closeOnDocumentClick={false}
    >
      {close => (
        <div className="upload-box-modal">
          {id ? <>
            <div className="upload-box-header"> Upload Logo </div>
            <div className="upload-box-content">
              <div className="upload-box-text">
                <div>The maximum file size is 3 MB. upload the largest logo you have, at least 140 pixels on its shortest side.</div>
                <div className="browse-button-container">
                  <FileUploader
                    onTypeError={(err) => setError(err)}
                    onSizeError={(err) => setError(err)}
                    maxSize="3"
                    handleChange={handleChange}
                    name=""
                    hoverTitle="Drop your file here"
                    types={fileTypes}>
                    <div style={{ width: "100%", textAlign: "center" }}>
                      <span style={{ color: "#353A42" }}>Choose a file to upload</span> <span className="save-button browse-button">Browse</span>
                      {error && <div>
                        <span class="warning-text-error warning-text" >{error}</span>
                      </div>}
                    </div>
                  </FileUploader>
                </div>

                {file && <>
                  <div className="files-name-upload-box"> {file.name} <img title="Delete File" className="filter-clear-button upload-file-box-delete" src={Filter_Clear} onClick={() => setFile(undefined)} /></div>
                </>}

                <div className="imp-text-upload-box">The logo will be appear on invoices, Quotes and other documents</div>
              </div>
            </div>
            <div className="upload-box-actions">
              <div style={{ width: "50%", textAlign: "left" }}>
                <button style={{ background: "#7C7C7C" }}
                  className="save-button upload-close-button"
                  onClick={() => { close(); setFile(undefined);setError(undefined) }}>
                  Cancel
                </button>
              </div>

              <div style={{ width: "50%", textAlign: "right", opacity: file ?'1':'.35' }}>
                <button
                  className="save-button upload-close-button"
                  onClick={handleUpload}>
                  {uploadValue}
                </button>
              </div>
            </div> </> :
            <div className="error-upload-box">
              <p>Please Save Organization Data then upload logo</p>
              <button
                className="save-button"
                onClick={() => { close() }}>
                Close
              </button>
            </div>}
        </div>
      )}
    </Popup>)
}

export default Modal;


