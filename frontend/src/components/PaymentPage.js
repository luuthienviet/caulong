import React, { useState } from 'react';

export default function PaymentPage({ bookingData, setPage, handleBooking }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transferContent, setTransferContent] = useState('');

  if (!bookingData) {
    setPage('home');
    return null;
  }

  const { selectedCourt, selectedDate, selectedHour, duration, totalPrice, depositAmount, user } = bookingData;
  const startHour = parseInt(selectedHour);
  const endHour = startHour + duration;

  const handlePaymentMethodSelect = async (method) => {
    setPaymentMethod(method);
    if (method === 'full_at_court') {
      setLoading(true);
      const newBooking = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        date: selectedDate,
        hour: selectedHour,
        duration: duration,
        total: totalPrice,
        paymentImage: null,
        status: "pending",
        paymentMethod: "tại sân"
      };
      await handleBooking(newBooking);
      setLoading(false);
      alert("✅ Yêu cầu đặt sân đã gửi! Vui lòng đến sân thanh toán đủ tiền.");
      setPage('home');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async () => {
    // Kiểm tra số điện thoại
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
      return;
    }
    if (!transferContent.trim()) {
      alert('Vui lòng nhập nội dung chuyển khoản');
      return;
    }
    if (!uploadedImage) {
      alert('Vui lòng tải ảnh chuyển khoản');
      return;
    }
    setLoading(true);
    const newBooking = {
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      date: selectedDate,
      hour: selectedHour,
      duration: duration,
      total: totalPrice,
      paymentImage: uploadedImage,
      status: "pending",
      paymentMethod: "chuyển khoản cọc",
      phone: phoneNumber,
      transferContent: transferContent
    };
    await handleBooking(newBooking);
    setLoading(false);
    alert("✅ Yêu cầu đặt sân đã gửi! Vui lòng chờ admin xác nhận.");
    setPage('home');
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">💳 THANH TOÁN ĐẶT SÂN</h1>

        <div className="booking-summary">
          <h2>📋 THÔNG TIN ĐẶT LỊCH</h2>
          <div className="summary-grid">
            <div className="summary-item"><strong>Khách hàng:</strong> {user?.name || user?.username}</div>
            <div className="summary-item"><strong>Sân:</strong> {selectedCourt.name}</div>
            <div className="summary-item"><strong>Ngày:</strong> {selectedDate}</div>
            <div className="summary-item"><strong>Giờ:</strong> {startHour}:00 - {endHour}:00</div>
            <div className="summary-item"><strong>Số giờ:</strong> {duration}</div>
            <div className="summary-item"><strong>Tổng tiền:</strong> {totalPrice.toLocaleString()} VNĐ</div>
            <div className="summary-item"><strong>Tiền cọc 50%:</strong> {depositAmount.toLocaleString()} VNĐ</div>
          </div>
        </div>

        <div className="payment-methods">
          <h2>💳 CHỌN PHƯƠNG THỨC THANH TOÁN</h2>
          <div className="methods-grid">
            <div 
              className={`method-card ${paymentMethod === 'deposit' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodSelect('deposit')}
            >
              <div className="method-icon">🏦</div>
              <h3>Chuyển khoản cọc 50%</h3>
              <p>Chuyển khoản {depositAmount.toLocaleString()} VNĐ để đặt cọc, số còn lại thanh toán tại sân.</p>
            </div>
            <div 
              className={`method-card ${paymentMethod === 'full_at_court' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodSelect('full_at_court')}
            >
              <div className="method-icon">💵</div>
              <h3>Thanh toán 100% tại sân</h3>
              <p>Đặt sân không cần cọc, thanh toán đủ tiền khi đến sân.</p>
            </div>
          </div>
        </div>

        {paymentMethod === 'deposit' && (
          <div className="deposit-section">
            <h2>🏦 THÔNG TIN CHUYỂN KHOẢN CỌC</h2>
            <div className="bank-info">
              <p><strong>Ngân hàng:</strong> Vietcombank</p>
              <p><strong>Số tài khoản:</strong> 0123456789</p>
              <p><strong>Chủ tài khoản:</strong> A CHEH VINH</p>
            </div>
            <div className="qr-code">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" />
              <p>Quét mã QR để chuyển khoản {depositAmount.toLocaleString()} VNĐ</p>
            </div>
            <div className="form-group">
              <label>📞 Số điện thoại (bắt buộc)</label>
              <input 
                type="tel" 
                placeholder="VD: 0987654321" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>📝 Nội dung chuyển khoản (bắt buộc)</label>
              <input 
                type="text" 
                placeholder="VD: DATCOC_SAN1_0987654321" 
                value={transferContent}
                onChange={(e) => setTransferContent(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>📸 Tải ảnh chuyển khoản</label>
              <div className="file-upload">
                <input type="file" accept="image/*" onChange={handleFileUpload} id="fileInput" />
                <label htmlFor="fileInput" className="file-label">Chọn ảnh</label>
              </div>
              {uploadedImage && <img src={uploadedImage} alt="preview" className="preview-img" />}
            </div>
            <button onClick={handleDepositSubmit} disabled={loading} className="btn-submit">
              {loading ? 'Đang xử lý...' : 'GỬI YÊU CẦU'}
            </button>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn-back" onClick={() => setPage('home')}>← Quay lại trang chủ</button>
        </div>
      </div>

      <style>{`
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          padding: 40px 20px;
        }
        .payment-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .payment-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
        }
        .booking-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
        }
        .booking-summary h2 {
          font-size: 20px;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .summary-item {
          font-size: 16px;
          padding: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .payment-methods {
          margin-bottom: 30px;
        }
        .payment-methods h2 {
          font-size: 20px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .method-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        .method-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          border-color: #007bff;
        }
        .method-card.active {
          border-color: #28a745;
          background: #f0fff4;
        }
        .method-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .method-card h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .method-card p {
          font-size: 14px;
          color: #6c757d;
        }
        .deposit-section {
          background: #fef9e6;
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
        }
        .deposit-section h2 {
          font-size: 20px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .bank-info {
          background: white;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .bank-info p {
          margin: 5px 0;
        }
        .qr-code {
          text-align: center;
          background: white;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .qr-code img {
          width: 150px;
          margin-bottom: 10px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        .file-upload {
          margin-top: 8px;
        }
        .file-label {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .file-label:hover {
          background: #0056b3;
        }
        input[type="file"] {
          display: none;
        }
        .preview-img {
          margin-top: 15px;
          width: 120px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .btn-submit {
          width: 100%;
          background: #28a745;
          color: white;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-submit:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-2px);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .action-buttons {
          margin-top: 30px;
          text-align: center;
        }
        .btn-back {
          background: #6c757d;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-back:hover {
          background: #5a6268;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .payment-container {
            padding: 20px;
          }
          .summary-grid {
            grid-template-columns: 1fr;
          }
          .methods-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}