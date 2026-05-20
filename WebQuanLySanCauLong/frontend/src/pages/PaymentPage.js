import React, { useEffect, useState } from 'react';
import API from '../api';

export default function PaymentPage({ bookingData, setPage, refreshBookings }) {
  const [loading, setLoading] = useState(false);
  const [transferContent, setTransferContent] = useState('');

  useEffect(() => {
    if (!bookingData) return;
    const courtNameClean = bookingData.selectedCourt?.name ? bookingData.selectedCourt.name.replace(/\s+/g, '_') : 'SAN';
    setTransferContent(`THANHTOAN_${courtNameClean}_${bookingData.selectedDate}_${bookingData.customerPhone || ''}`);
  }, [bookingData]);

  if (!bookingData) {
    setPage('home');
    return null;
  }

  const {
    bookingId,
    selectedCourt,
    selectedDate,
    selectedHour,
    duration,
    totalPrice,
    customerName,
    customerPhone,
    customerNote,
    user,
  } = bookingData;
  const startHour = parseInt(selectedHour, 10);
  const endHour = startHour + duration;

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      await API.put(`/bookings/${bookingId}/pay`);
      alert("✅ Yêu cầu thanh toán đã được gửi thành công! Admin sẽ duyệt thanh toán của bạn sớm nhất.");
      if (refreshBookings) {
        await refreshBookings(); 
      }
      setPage('my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || "Gửi yêu cầu thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container fade-in">
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h1 className="payment-title">Xác nhận thanh toán</h1>
          <p className="payment-subtitle">Bạn đang thanh toán 100% để hoàn tất thuê sân</p>
        </div>

        {/* Bill Details */}
        <div className="booking-summary-card">
          <h2 className="section-title">📋 Chi tiết hóa đơn</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Mã đặt sân</span>
              <span className="summary-value font-mono">{bookingId}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Khách hàng</span>
              <span className="summary-value">{customerName || user?.name || user?.username}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Sân cầu lông</span>
              <span className="summary-value highlight">{selectedCourt.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ngày chơi</span>
              <span className="summary-value">{selectedDate}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Khung giờ</span>
              <span className="summary-value">{startHour}:00 - {endHour}:00 ({duration} giờ)</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tổng tiền sân</span>
              <span className="summary-value font-bold">{(totalPrice || 0).toLocaleString()} VNĐ</span>
            </div>
          </div>

          <div className="payment-divider"></div>

          <div className="price-breakdown">
            <div className="price-row highlight-row">
              <span>Tổng số tiền cần chuyển (100%)</span>
              <strong className="deposit-price">{(totalPrice || 0).toLocaleString()} VNĐ</strong>
            </div>
          </div>
        </div>

        {/* Bank Instructions */}
        <div className="bank-instructions-card">
          <h2 className="section-title">🏦 Thông tin chuyển khoản thanh toán</h2>
          <div className="bank-info-grid">
            <div className="bank-info-item">
              <span className="bank-label">Ngân hàng</span>
              <span className="bank-value">Vietcombank (Chi nhánh Kon Tum)</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Số tài khoản</span>
              <span className="bank-value copyable">0123456789</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Chủ tài khoản</span>
              <span className="bank-value">LUU THIEN VIET</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Nội dung chuyển khoản</span>
              <span className="bank-value code-box">{transferContent}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="payment-actions">
          <button onClick={handlePaymentSubmit} disabled={loading} className="btn-confirm-payment">
            {loading ? '⏳ Đang ghi nhận...' : '✅ Thanh Toán'}
          </button>
          <button className="btn-cancel-payment" onClick={() => setPage('my-bookings')}>
            Quay lại lịch đặt sân
          </button>
        </div>
      </div>

      <style>{`
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 60px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', 'Inter', sans-serif;
        }
        .payment-container {
          max-width: 680px;
          width: 100%;
          background: #ffffff;
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .payment-header {
          text-align: center;
          margin-bottom: 35px;
        }
        .payment-icon {
          font-size: 54px;
          margin-bottom: 12px;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }
        .payment-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .payment-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 6px 0 0 0;
          font-weight: 500;
        }
        .booking-summary-card, .bank-instructions-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #334155;
          margin: 0 0 18px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .summary-grid, .bank-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
        }
        @media (max-width: 500px) {
          .summary-grid, .bank-info-grid {
            grid-template-columns: 1fr;
          }
        }
        .summary-item, .bank-info-item {
          display: flex;
          flex-direction: column;
        }
        .summary-label, .bank-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .summary-value, .bank-value {
          font-size: 15px;
          color: #1e293b;
          font-weight: 700;
        }
        .highlight {
          color: #4f46e5;
        }
        .font-mono {
          font-family: monospace;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 6px;
          width: fit-content;
        }
        .font-bold {
          font-weight: 800;
        }
        .payment-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 20px 0;
        }
        .price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 600;
        }
        .highlight-row {
          color: #4f46e5;
          font-size: 17px;
          font-weight: 800;
        }
        .deposit-price {
          color: #10b981;
          font-size: 20px;
          font-weight: 800;
        }
        .text-muted {
          color: #64748b;
          font-size: 14px;
        }
        .code-box {
          font-family: monospace;
          background: #e0f2fe;
          color: #0369a1;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 14px;
          border: 1px dashed #bae6fd;
          word-break: break-all;
        }
        .payment-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 30px;
        }
        .btn-confirm-payment {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          padding: 15px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
        }
        .btn-confirm-payment:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -5px rgba(16, 185, 129, 0.4);
        }
        .btn-confirm-payment:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-cancel-payment {
          background: transparent;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          padding: 10px;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .btn-cancel-payment:hover {
          color: #0f172a;
          text-decoration: underline;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}