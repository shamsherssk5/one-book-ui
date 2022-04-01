import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

import './WarnningStyle.css'


const Warnning = (props) => {
    const refWarnnig = useRef(null);
    const handleNo = () => {
        props.onNo();
    }
    const handleYes = () => {
        props.onYes();
    }
    return (<div className="warn-main-conainer">
        <div className="warnnig-msg-div" style={{ backgroundColor: props.bgColor || '#fff' }}>
            <div className="warnnig-img-div">
                <svg width="109" height="95" viewBox="0 0 109 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M53.9722 0.0760315C53.3106 0.177806 52.7339 0.576424 52.4116 1.16163L0.302964 91.4019C-0.0871721 92.0804 -0.0871721 92.9115 0.311445 93.5816C0.701582 94.2516 1.42249 94.6672 2.20276 94.6587H106.42C107.2 94.6672 107.921 94.2516 108.311 93.5816C108.71 92.9115 108.71 92.0804 108.32 91.4019L56.2112 1.16163C55.7702 0.364394 54.8712 -0.0681488 53.9722 0.0760315ZM54.3114 6.58961L102.62 90.3163H6.00235L54.3114 6.58961ZM51.801 33.6617C51.3345 33.6617 51.0546 33.9416 51.0546 34.408V65.8225C51.0546 66.289 51.3345 66.6367 51.801 66.6367H56.8219C57.2883 66.6367 57.5682 66.289 57.5682 65.8225V34.408C57.5682 33.9416 57.2883 33.6617 56.8219 33.6617H51.801ZM51.326 72.8789C51.0377 72.9891 50.9189 73.2775 50.9189 73.6252V79.3246C50.9189 79.7911 51.1988 80.071 51.6653 80.071H56.9576C57.424 80.071 57.7039 79.7911 57.7039 79.3246V73.6252C57.7039 73.1588 57.424 72.8789 56.9576 72.8789H51.6653C51.5465 72.8789 51.4193 72.845 51.326 72.8789Z" fill="#FF820E" />
                </svg>
            </div>
            <div className="warnnig-msg-labal">Warnnig</div>
            <div className="warnnig-desc-div">
                {props.message || 'Are you sure,  you want to Proceed ?'}
            </div>
            <div className="warnnig-btn-div">
                <button className="warnnig-btn-no" onClick={handleNo}>{props.noBtnName || 'No'}</button>
                <button className="warnnig-btn-yes" onClick={handleYes}>{props.yesBtnName || 'Yes'}</button>
            </div>
            <hr className='warnnig-footer-line' />
        </div ></div>)
}

export default Warnning