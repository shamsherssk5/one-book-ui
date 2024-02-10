import React, { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import "./file-view-onebook.css";
import Download from "./assets/download.png";
import ZoomIn from "./assets/zoomIn.png";
import ZoomOut from "./assets/zoomOut.png";
import Rotate from "./assets/rotate.png";
import Print from "./assets/print.png";
import ReactToPrint from "react-to-print";
import Left_Arrow from "../../tasks/assets/left-arrow.png";
import Right_Arrow from "../../tasks/assets/right-arrow.png";

const OneBookFileViewer = ({ module, Trigger_Button, data, file }) => {
  let imagesIcon = ["image/gif", "image/png", "image/jpeg", "image/jpg"];
  const imageRef = useRef(null);
  const fileViewRef = useRef(null);
  let angle = 0;
  const increaseSize = () => {
    imageRef.current.style.width = imageRef.current.clientWidth + 10 + "px";
  };
  const decreaseSize = () => {
    imageRef.current.style.width = imageRef.current.clientWidth - 10 + "px";
  };
  const [currentFile, setCurrentFile] = useState(file);

  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  const rotateIt = () => {
    if (angle === 360) angle = 0;
    angle = angle + 90;
    imageRef.current.style.transform =
      "translate(-50%,-50%) rotate(" + angle + "deg)";
    if (angle === 90 || angle === 270) {
      imageRef.current.style.maxHeight = "90vw";
      imageRef.current.style.maxWidth = "78vh";
    } else {
      imageRef.current.style.maxHeight = "78vh";
      imageRef.current.style.maxWidth = "90vw";
    }
  };

  return (
    <Popup trigger={Trigger_Button} modal closeOnDocumentClick={false}>
      {(close) => (
        <div className="upload-box-modal file-viewer-parent">
          <div className="upload-box-header upload-box-header-file">
            {currentFile.originalname}
            <span style={{ float: "right", marginRight: "2vw" }}>
              {/* {data.indexOf(currentFile)!==0 && <img style={{width:"1vw"}} className='file-action-images' src={Rotate} alt="Previous" title='Previous' onClick={()=>setCurrentFile(data[data.indexOf(currentFile)-1])}/>}
            {data.indexOf(currentFile)!==(data.length-1) && <img style={{width:"1vw"}} className='file-action-images' src={Rotate} alt="Next" title='Next' onClick={()=>setCurrentFile(data[data.indexOf(currentFile)+1])} />} */}
            </span>
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
          <div style={{ width: "100%", position: "relative", display: "flex" }}>
            <div
              className={
                data.indexOf(currentFile) !== 0
                  ? "next-prev-button-container"
                  : "next-prev-button-container not-available"
              }
            >
              <img
                src={Left_Arrow}
                onClick={() => {
                  if (data.indexOf(currentFile) !== 0)
                    setCurrentFile(data[data.indexOf(currentFile) - 1]);
                }}
                alt="Left-Arrow"
              />
            </div>

            <div
              className="upload-box-content file-viewer-content"
              ref={fileViewRef}
            >
              {imagesIcon.includes(currentFile.type) && (
                <img
                  className="image-view-class"
                  ref={imageRef}
                  crossOrigin
                  src={
                    process.env.REACT_APP_API_ENDPOINT +
                    "/auth/getFile?name=/" +
                    module +
                    "/" +
                    currentFile.filename
                  }
                  alt="Unable to fetch"
                  onLoad={() =>
                    (fileViewRef.current.style.background = "white")
                  }
                />
              )}
              {currentFile.type === "application/pdf" && (
                <embed
                  className="pdf-viewer"
                  width={"100%"}
                  height={"100%"}
                  src={
                    process.env.REACT_APP_API_ENDPOINT +
                    "/auth/getFile?name=/" +
                    module +
                    "/" +
                    currentFile.filename
                  }
                />
              )}
              {currentFile.type === "text/plain" && (
                <iframe
                  id="printIframe"
                  title="printFrame"
                  name="printIframe"
                  src={
                    process.env.REACT_APP_API_ENDPOINT +
                    "/auth/getFile?name=/" +
                    module +
                    "/" +
                    currentFile.filename
                  }
                  width="100%"
                  frameborder="0"
                  style={{ background: "white", minHeight: "78vh" }}
                />
              )}
            </div>
            <div
              className={
                data.indexOf(currentFile) !== data.length - 1
                  ? "next-prev-button-container"
                  : "next-prev-button-container not-available"
              }
            >
              <img
                src={Right_Arrow}
                onClick={() => {
                  if (data.indexOf(currentFile) !== data.length - 1)
                    setCurrentFile(data[data.indexOf(currentFile) + 1]);
                }}
              />
            </div>
          </div>
          {currentFile.type !== "application/pdf" && (
            <div className="upload-box-actions file-view-actions">
              {imagesIcon.includes(currentFile.type) && (
                <img
                  title="Rotate"
                  className="file-action-images"
                  src={Rotate}
                  onClick={rotateIt}
                />
              )}
              {imagesIcon.includes(currentFile.type) && (
                <img
                  title="Zoom In"
                  className="file-action-images"
                  src={ZoomIn}
                  onClick={decreaseSize}
                />
              )}
              {imagesIcon.includes(currentFile.type) && (
                <img
                  title="Zoom Out"
                  className="file-action-images"
                  src={ZoomOut}
                  onClick={increaseSize}
                />
              )}
              {imagesIcon.includes(currentFile.type) && (
                <ReactToPrint
                  trigger={() => (
                    <img
                      title="Print"
                      className="file-action-images"
                      src={Print}
                    />
                  )}
                  content={() => imageRef.current}
                />
              )}
              <a
                style={{
                  outline: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                }}
                href={
                  process.env.REACT_APP_API_ENDPOINT +
                  "/auth/downLoadFile?name=/" +
                  module +
                  "/" +
                  currentFile.filename
                }
              >
                <img
                  title="Download"
                  className="file-action-images"
                  src={Download}
                />
              </a>
            </div>
          )}
        </div>
      )}
    </Popup>
  );
};

export default OneBookFileViewer;
