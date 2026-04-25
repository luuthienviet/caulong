import React, { useEffect, useState } from "react";
import CourtCalendar from './CourtCalendar';
 
export default function BookingModal({
  user,
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
  bookingRequests = [],
  onGoToPayment,          // 👈 THÊM PROP NÀY
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

  const isPastHour = (hour) => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;
    const now = new Date();
    const currentHour = now.getHours();
    return parseInt(hour) < currentHour;
  };

  const isHourDisabled = (hour) => {
    if (isPastHour(hour)) return true;
    if (!selectedCourt || !selectedDate) return false;
    return bookingRequests.some(
      req => req.courtId === selectedCourt.id && 
             req.date === selectedDate && 
             req.hour === hour && 
             req.status === 'approved'
    );
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedHour('');
    setDuration(1);
    setShowDepositStep(false);
  };

  const canExtendDuration = () => {
    const startIndex = hours.indexOf(selectedHour);
    const nextIndex = startIndex + duration;
    if (nextIndex >= hours.length) return false;
    const nextHour = hours[nextIndex];
    return !isHourDisabled(nextHour);
  };

  const priceForHour = (h) => {
    const hourNumber = Number(h);
    if (hourNumber >= 17) return Math.floor(selectedCourt.price * 1.3);
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

  // Xác nhận thông tin và chuyển sang trang thanh toán
  const handleConfirmInfo = () => {
    if (!selectedDate || !selectedHour) {
      alert("Vui lòng chọn ngày và giờ");
      return;
    }
    const bookingData = {
      selectedCourt,
      selectedDate,
      selectedHour,
      duration,
      totalPrice,
      depositAmount,
      user
    };
    if (onGoToPayment) {
      onGoToPayment(bookingData);
      // Đóng modal
      setSelectedCourt(null);
      setSelectedDate("");
      setSelectedHour("");
      setDuration(1);
      setShowDepositStep(false);
    }
  };

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

        <img src={selectedCourt.image} alt={selectedCourt.name} className="booking-image" />
        <h2>{selectedCourt.name}</h2>
        <div className="court-description">
          <p>{selectedCourt.desc || selectedCourt.description}</p>
        </div>
        <p>
          💰 Giá ngày (05–17h): {selectedCourt.price.toLocaleString()} VNĐ/giờ
          <br />
          🌙 Giá tối (17–22h): {Math.floor(selectedCourt.price * 1.3).toLocaleString()} VNĐ/giờ
        </p>

        {/* CHỌN NGÀY GIỜ */}
        {!showDepositStep && (
          <>
            <CourtCalendar court={selectedCourt} bookings={bookingRequests} onDateSelect={handleDateSelect} />

            <div className="form-group">
              <label>Hoặc chọn ngày bằng ô bên dưới</label>
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
                        className={`time-btn ${disabled ? "disabled" : selectedHour === h ? "selected" : ""}`}
                      >
                        {h}:00
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {selectedHour && (
              <>
                <div className="duration-box">
                  <button onClick={() => setDuration(Math.max(1, duration - 1))}>−</button>
                  <span>{duration} giờ</span>
                  <button disabled={!canExtendDuration()} onClick={() => { if (canExtendDuration()) setDuration(duration + 1); }}>+</button>
                </div>
                <div className="total-box">Tổng tiền: <b>{totalPrice.toLocaleString()} VNĐ</b></div>
                <div className="deposit-info">(Đặt cọc 50%: <b>{depositAmount.toLocaleString()} VNĐ</b>)</div>
              </>
            )}

            <button className="main-btn" disabled={!selectedDate || !selectedHour} onClick={handleConfirmInfo}>
              XÁC NHẬN THÔNG TIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}