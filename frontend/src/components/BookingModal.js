import React, { useEffect, useState } from "react";

export default function BookingModal({
  selectedCourt,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  duration,
  setDuration,
  showDepositStep,
  setShowDepositStep,
  handleUpload,
  paymentProof,
  handleBooking,
  schedule,
  setSelectedCourt,
}) {

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = selectedCourt ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedCourt]);

  if (!selectedCourt) return null;

  const hours = [
    "05","06","07","08","09","10","11","12",
    "13","14","15","16","17","18","19","20","21"
  ];

  // =============================
  // CHECK GIỜ ĐÃ ĐẶT
  // =============================
  const getStatus = (hour) => {
    return schedule?.[selectedCourt.id]?.[selectedDate]?.[hour];
  };

  const isHourDisabled = (hour) => {
    const status = getStatus(hour);
    return status === "Đã đặt" || status === "pending";
  };

  // =============================
  // CHECK ĐỦ GIỜ LIÊN TIẾP
  // =============================
  const canExtendDuration = () => {
    const startIndex = hours.indexOf(selectedHour);
    const nextIndex = startIndex + duration;

    if (nextIndex >= hours.length) return false;

    const nextHour = hours[nextIndex];
    return !isHourDisabled(nextHour);
  };

  // =============================
  // TÍNH GIÁ THEO NGÀY / TỐI
  // =============================
  const priceForHour = (h) => {
    const hourNumber = Number(h);
    if (hourNumber >= 17) {
      return Math.floor(selectedCourt.price * 1.3);
    }
    return selectedCourt.price;
  };

  const calculateTotal = () => {
    if (!selectedHour) return 0;

    let total = 0;
    const startIndex = hours.indexOf(selectedHour);

    for (let i = 0; i < duration; i++) {
      const hour = hours[startIndex + i];
      total += priceForHour(hour);
    }

    return total;
  };

  const totalPrice = calculateTotal();
  const depositAmount = Math.floor(totalPrice * 0.5);

  return (
    <div className="booking-overlay">
      <div className="booking-container">

        <button
          className="modal-close"
          onClick={() => {
            setSelectedCourt(null);
            setSelectedDate("");
            setSelectedHour("");
            setDuration(1);
            setShowDepositStep(false);
          }}
        >
          ✕
        </button>

        <img
          src={selectedCourt.image}
          alt={selectedCourt.name}
          className="booking-image"
        />

        <h2>{selectedCourt.name}</h2>

        <p>
          💰 Giá ngày (05–17h): {selectedCourt.price.toLocaleString()} VNĐ
          <br />
          🌙 Giá tối (17–22h):{" "}
          {Math.floor(selectedCourt.price * 1.3).toLocaleString()} VNĐ
        </p>

        {/* CHỌN NGÀY */}
        <div className="form-group">
          <label>Chọn ngày</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedHour("");
              setDuration(1);
            }}
          />
        </div>

        {/* CHỌN GIỜ */}
        {selectedDate && (
          <>
            <label>Chọn giờ bắt đầu</label>
            <div className="time-grid">
              {hours.map((h) => {
                const disabled = isHourDisabled(h);

                return (
                  <button
                    key={h}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedHour(h);
                      setDuration(1);
                    }}
                    className={`time-btn ${
                      disabled
                        ? "disabled"
                        : selectedHour === h
                        ? "selected"
                        : ""
                    }`}
                  >
                    {h}:00
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* THỜI LƯỢNG */}
        {selectedHour && (
          <>
            <div className="duration-box">
              <button
                onClick={() => setDuration(Math.max(1, duration - 1))}
              >
                −
              </button>

              <span>{duration} giờ</span>

              <button
                disabled={!canExtendDuration()}
                onClick={() => {
                  if (canExtendDuration()) {
                    setDuration(duration + 1);
                  }
                }}
              >
                +
              </button>
            </div>

            <div className="total-box">
              Tổng tiền: <b>{totalPrice.toLocaleString()} VNĐ</b>
            </div>
          </>
        )}

        {!showDepositStep && (
          <button
            className="main-btn"
            disabled={!selectedDate || !selectedHour}
            onClick={() => setShowDepositStep(true)}
          >
            TIẾP TỤC ĐẶT SÂN
          </button>
        )}

        {/* ĐẶT CỌC */}
        {showDepositStep && (
          <div className="deposit-section">
            <h3>Đặt cọc 50%: {depositAmount.toLocaleString()} VNĐ</h3>

            <p><b>Ngân hàng:</b> Vietcombank</p>
            <p><b>Số TK:</b> 0123456789</p>
            <p><b>Chủ TK:</b> NGUYEN VAN A</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, selectedCourt.id)}
            />

            {paymentProof[selectedCourt.id] && (
              <>
                <img
                  src={paymentProof[selectedCourt.id]}
                  alt="proof"
                  className="proof-img"
                />

                <button
                  className="confirm-btn"
                  onClick={() => {
                    handleBooking(selectedCourt);
                    setShowSuccess(true);
                  }}
                >
                  GỬI YÊU CẦU
                </button>
              </>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="success-popup">
            <div className="success-box">
              <h3>✅ Đặt sân thành công</h3>
              <p>Vui lòng chờ quản lý xác nhận.</p>
              <button onClick={() => setShowSuccess(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}