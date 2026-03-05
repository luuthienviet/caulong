import React from "react";

export default function SuccessPopup({ onClose }) {
  return (
    <div className="success-overlay">
      <div className="success-box">
        <h2>🎉 ĐẶT SÂN THÀNH CÔNG!</h2>
        <p>Yêu cầu của bạn đã được gửi.</p>

        <button
          className="btn-book"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}