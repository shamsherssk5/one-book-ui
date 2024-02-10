import "./styles/confirmBox.css";
import Warning from "../assets/images/warning.png";
export const confirmationBox = {
  render: (message, onConfirm, onCancel) => {
    return (
      <div className="confirm-box-container">
        <div
          style={{ position: "relative", width: "100%", textAlign: "center" }}
        >
          <img src={Warning} className="warning-box-image" />
          <span className="warning-box-text">Warning</span>
          <span className="warning-box-message">{message}</span>
        </div>
        <div className="warning-box-button-container">
          <div style={{ width: "50%", textAlign: "left" }}>
            <button style={{ background: "#2687D7" }} onClick={onCancel}>
              No
            </button>
          </div>
          <div style={{ width: "50%", textAlign: "right" }}>
            <button style={{ background: "#F94444" }} onClick={onConfirm}>
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const proceedBox = {
  render: (message, onConfirm, onCancel) => {
    return (
      <div className="confirm-box-container">
        <div
          style={{ position: "relative", width: "100%", textAlign: "center" }}
        >
          <img src={Warning} className="warning-box-image" />
          <span className="warning-box-text">Warning</span>
          <span className="warning-box-message">{message}</span>
        </div>
        <div className="warning-box-button-container">
          <div style={{ width: "50%", textAlign: "left" }}>
            <button style={{ background: "#F94444" }} onClick={onCancel}>
              Cancel
            </button>
          </div>
          <div style={{ width: "50%", textAlign: "right" }}>
            <button style={{ background: "#2687D7" }} onClick={onConfirm}>
              Proceed
            </button>
          </div>
        </div>
      </div>
    );
  },
};
