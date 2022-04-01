import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import PNG from "../tasks/assets/png.png";
import PDF from "../tasks/assets/pdf.png";
import JPG from "../tasks/assets/img.png";
import Filter_Clear from "../tasks/assets/filter-clear.png";
import File_Loader from "../assets/images/file-loader.gif"
import toast from 'react-hot-toast';
import axios from 'axios';
import OneBookFileViewer from './onebook-files-viewer/OneBookFileViewer';

const FileUploaderListViewer = ({ isView, data, handleUpload, handleDelete, module, id, setToken }) => {

    let ref = useRef(null);
    const [error, setError] = useState(undefined);
    const fileTypesImages = { 
        "image/png": PNG, 
        "application/pdf": PDF, 
        "image/jpeg": JPG, 
        "image/jpg": JPG,
        "image/gif": JPG, 
        "text/plain":PNG 
    }
    useEffect(() => {
        const handlePaste = (e) => {
            if (!ref.current) return;
            console.log('something pasted from Details');
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file') {
                    const myNewFile = new File([item.getAsFile()], Math.random().toString(36).substring(2, 6) + "-" + item.getAsFile().name, { type: item.getAsFile().type });
                    handleChange(myNewFile);
                }
            }
        }

        window.addEventListener('paste', handlePaste);

        return () => {
            window.removeEventListener('paste', handlePaste);
        }
    }, []);

    const fileValidation=file=>{
        let flag=true;
        console.log(file.type);
        if(!Object.keys(fileTypesImages).includes(file.type)){
            setError("File Type is not Supported");
            flag=false;
        }
        return flag;
    }
    const handleChange = async file => {
        if (isView && !id) {
            setError("Error Occured! Please try again");
            return;
        }
        if(!fileValidation(file)) return;
        setError(undefined);
        let fileData = { fileID: 99999999, originalname: file.name, filename: file.name, type: file.type, status: "Loading" }
        handleUpload(fileData);
        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        const formdata = new FormData();
        formdata.append('file', file);
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/files/uploadFile?moduleID=' + id + '&username=' + currentUser.username + "&module=" + module +"&timeZone="+currentUser.timeZone, formdata, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                handleDelete(99999999);
                handleUpload(res.data);
                toast.success("File " + file.name + " uploaded Successfully");
            }).catch((err) => {
                toast.error("File " + file.name + "+upload Failed");
                handleDelete(99999999);
            })

    }

    const deleteFile = (attachment) => {
        attachment["module"] = module;
        axios.post(process.env.REACT_APP_API_ENDPOINT + '/files/deleteFile', attachment, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                handleDelete(attachment.fileID);
                toast.success("File Deleted Successfully");

            }).catch(err => {
                toast.error("File Deletion Failed");
                console.log(err);
            })

    }


    return (
        <>
            <div className="messages task-details-container" ref={ref}>
                <div className="message-Heading">
                    Files upload
                </div>
                {error ? <div>
                    <span class="warning-text-error warning-text" >{error}</span>
                </div> : ''}
                <div className='file-uploader-box'>
                    <div class="file-upload-container">
                        <FileUploader
                            onTypeError={(err) => setError(err)}
                            onSizeError={(err) => setError(err)}
                            maxSize="5"
                            handleChange={handleChange}
                            name=""
                            hoverTitle="Drop your file here"
                            >
                            <div className="drop-area">
                                Drag Or Screen Shot + Ctrl + V
                            </div>
                        </FileUploader>
                    </div>
                    <div className='upload-button-container'>
                    </div>
                </div>
                <div>
                    <span class="warning-text">Max File Size : 5 MB / File</span>
                </div>
            </div>
            {data.length > 0 ? (<div style={{ borderTop: "0.1px solid #c4c4c4", position: "relative", top: "20px", paddingTop: "10px" }}><div className="attachments-container task-details-container" >
                <div className='uploaded-file-heading'>Uploaded Files</div>
                {[...new Set(data)].map((attachment) =>
                    <div key={attachment.fileID} className="files-viewer-container">
                        <div className="files-image-container">
                            <img className='files-image' src={fileTypesImages[attachment.type]} />
                        </div>
                        <div className="delete-button-container">
                            <div style={{ textAlign: 'left', width: '80%' }}>
                                <OneBookFileViewer data={data} module={module} file={attachment} Trigger_Button={<span className="files-name" title="View File" onClick={(e) => { e.preventDefault() }}>{attachment.originalname}</span>} />
                            </div>
                            <div style={{ textAlign: 'right', width: '20%' }}><img title="Delete File" className="filter-clear-button file-delete" src={(attachment.status && attachment.status === "Loading") ? File_Loader : Filter_Clear} onClick={(e) => (attachment.status && attachment.status === "Loading") ? undefined : deleteFile(attachment)} />
                            </div>
                        </div>
                    </div>)}
            </div></div>) : ''}

        </>
    );
};

export default FileUploaderListViewer;