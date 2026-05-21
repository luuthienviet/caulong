import React, { useEffect, useState, useRef } from 'react';
import API from '../api';

const BANK_BIN = '970436'; // Vietcombank BIN
const ACCOUNT_NO = '0123456789';
const ACCOUNT_NAME = 'LUU THIEN VIET';

export default function PaymentPage({ bookingData, setPage, refreshBookings }) {
  const [loading, setLoading] = useState(false);
  const [transferContent, setTransferContent] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [billImage, setBillImage] = useState(null); // base64
  const [billPreview, setBillPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!bookingData) return;
    const courtNameClean = bookingData.selectedCourt?.name
      ? bookingData.selectedCourt.name.replace(/\s+/g, '_')
      : 'SAN';
    setTransferContent(`THANHTOAN_${courtNameClean}_${bookingData.selectedDate}_${bookingData.customerPhone || ''}`);
  }, [bookingData]);

  if (!bookingData) { setPage('home'); return null; }

  const {
    bookingId, selectedCourt, selectedDate, selectedHour,
    duration, totalPrice, customerName, customerPhone, user,
  } = bookingData;
  const startHour = parseInt(selectedHour, 10);
  const endHour = startHour + duration;

  const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  const handleBillUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ảnh phải nhỏ hơn 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBillImage(reader.result);
      setBillPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      await API.put(`/bookings/${bookingId}/pay`, {
        paymentImage: billImage || undefined,
        paymentMethod: billImage ? 'chuyển khoản' : 'tại sân',
        paymentStatus: billImage ? 'deposit_sent' : 'pending',
      });
      alert('✅ Yêu cầu thanh toán đã được gửi thành công! Admin sẽ duyệt thanh toán của bạn sớm nhất.');
      if (refreshBookings) await refreshBookings();
      setPage('my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi yêu cầu thanh toán thất bại!');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 className="section-title" style={{ margin: 0 }}>🏦 Thông tin chuyển khoản</h2>
            <button
              onClick={() => setShowQR(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showQR ? '#0f172a' : 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(67,97,238,.3)',
                transition: 'all .2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <path d="M14 14h3v3M17 17h3v3M14 20h3"/>
              </svg>
              {showQR ? 'Ẩn QR' : 'Hiện mã QR'}
            </button>
          </div>

          {/* QR Code Panel */}
          {showQR && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: '#fff', borderRadius: 18, padding: '20px 16px',
              marginBottom: 20, border: '2px solid #e0e7ff',
              boxShadow: '0 4px 24px rgba(67,97,238,.1)',
              animation: 'fadeIn .25s ease-out',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📲 Quét để chuyển khoản tự động
              </div>
              <img
                src={qrUrl}
                alt="QR chuyển khoản"
                style={{ width: 220, height: 220, borderRadius: 12, border: '1px solid #e2e8f0' }}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
              />
              <div style={{ display:'none', color:'#ef4444', fontSize:'0.82rem', marginTop:8 }}>
                Không tải được QR, vui lòng nhập tay thông tin bên dưới
              </div>
              <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
                Vietcombank • {ACCOUNT_NO} • {ACCOUNT_NAME}
              </div>
              <div style={{
                background: '#f0fdf4', border: '1px solid #86efac',
                borderRadius: 10, padding: '6px 14px', marginTop: 8,
                fontSize: '0.8rem', fontWeight: 700, color: '#16a34a'
              }}>
                Số tiền: {(totalPrice || 0).toLocaleString()}đ
              </div>
            </div>
          )}

          <div className="bank-info-grid">
            <div className="bank-info-item">
              <span className="bank-label">Ngân hàng</span>
              <span className="bank-value">Vietcombank (Chi nhánh Kon Tum)</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Số tài khoản</span>
              <span className="bank-value copyable">{ACCOUNT_NO}</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Chủ tài khoản</span>
              <span className="bank-value">{ACCOUNT_NAME}</span>
            </div>
            <div className="bank-info-item">
              <span className="bank-label">Nội dung chuyển khoản</span>
              <span className="bank-value code-box">{transferContent}</span>
            </div>
          </div>
        </div>

        {/* Bill Upload */}
        <div style={{
          background: billImage ? '#f0fdf4' : '#fafbff',
          border: `2px dashed ${billImage ? '#86efac' : '#c7d2fe'}`,
          borderRadius: 18, padding: '20px 24px', marginBottom: 24,
          transition: 'all .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.3rem' }}>🧾</span>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                Đính kèm biên lai thanh toán
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                Tải ảnh bill chuyển khoản để admin xác nhận nhanh hơn
              </div>
            </div>
          </div>

          {billPreview ? (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <img
                src={billPreview}
                alt="Biên lai"
                style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 12, border: '2px solid #86efac', display: 'block' }}
              />
              <button
                onClick={() => { setBillImage(null); setBillPreview(null); fileInputRef.current.value = ''; }}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '50%', width: 26, height: 26,
                  fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                }}
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '10px 22px', fontWeight: 700, fontSize: '0.88rem',
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(67,97,238,.3)',
                transition: 'all .2s',
              }}
            >
              📤 Chọn ảnh biên lai
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBillUpload}
            style={{ display: 'none' }}
          />

          {billImage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
              color: '#16a34a', fontWeight: 700, fontSize: '0.82rem'
            }}>
              ✅ Biên lai đã được đính kèm — Admin sẽ xem xét để duyệt thanh toán
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="payment-actions">
          <button onClick={handlePaymentSubmit} disabled={loading} className="btn-confirm-payment">
            {loading ? '⏳ Đang ghi nhận...' : billImage ? '✅ Gửi biên lai & Xác nhận thanh toán' : '✅ Xác nhận đã thanh toán'}
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
        .payment-header { text-align: center; margin-bottom: 35px; }
        .payment-icon { font-size: 54px; margin-bottom: 12px; display: inline-block; animation: float 3s ease-in-out infinite; }
        .payment-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
        .payment-subtitle { font-size: 15px; color: #64748b; margin: 6px 0 0 0; font-weight: 500; }
        .booking-summary-card, .bank-instructions-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .section-title { font-size: 16px; font-weight: 700; color: #334155; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-grid, .bank-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
        @media (max-width: 500px) { .summary-grid, .bank-info-grid { grid-template-columns: 1fr; } }
        .summary-item, .bank-info-item { display: flex; flex-direction: column; }
        .summary-label, .bank-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .summary-value, .bank-value { font-size: 15px; color: #1e293b; font-weight: 700; }
        .highlight { color: #4f46e5; }
        .font-mono { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; width: fit-content; }
        .font-bold { font-weight: 800; }
        .payment-divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
        .price-breakdown { display: flex; flex-direction: column; gap: 8px; }
        .price-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; }
        .highlight-row { color: #4f46e5; font-size: 17px; font-weight: 800; }
        .deposit-price { color: #10b981; font-size: 20px; font-weight: 800; }
        .code-box { font-family: monospace; background: #e0f2fe; color: #0369a1; padding: 8px 12px; border-radius: 10px; font-size: 14px; border: 1px dashed #bae6fd; word-break: break-all; }
        .payment-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 30px; }
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
        .btn-confirm-payment:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px -5px rgba(16, 185, 129, 0.4); }
        .btn-confirm-payment:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-cancel-payment { background: transparent; color: #64748b; font-weight: 600; font-size: 14px; padding: 10px; border: none; cursor: pointer; transition: color 0.2s; }
        .btn-cancel-payment:hover { color: #0f172a; text-decoration: underline; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}