import React, { useEffect, useState, useRef } from 'react';
import API from '../api';

const BANK_BIN = '970436'; // Vietcombank BIN
const ACCOUNT_NO = '0123456789';
const ACCOUNT_NAME = 'LUU THIEN VIET';

const PAYMENT_METHODS = [
  { id: 'visa', name: 'Thẻ Quốc tế', icon: '💳', desc: 'Visa, Mastercard, JCB' },
  { id: 'momo', name: 'Ví MoMo', icon: '🌸', desc: 'Quét mã qua MoMo' },
];

export default function PaymentPage({ bookingData, setPage, refreshBookings }) {
  const [loading, setLoading] = useState(false);
  const [transferContent, setTransferContent] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [billImage, setBillImage] = useState(null); // base64
  const [billPreview, setBillPreview] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('visa');
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
    duration, totalPrice, customerName, user,
  } = bookingData;
  const startHour = parseInt(selectedHour, 10);
  const endHour = startHour + duration;

  // MoMo: tạo mã QR chất lượng cao từ đúng dữ liệu gốc của chủ sân
  const MOMO_QR_DATA = '00020101021138620010A00000072701320006970454011899MM24170M266382310208QRIBFTTA53037045802VN62190515MOMOW2W2663823163042359';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(MOMO_QR_DATA)}`;

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
        paymentMethod: paymentMethod === 'visa' ? 'thẻ quốc tế' : (paymentMethod === 'bank' ? 'chuyển khoản' : paymentMethod),
        paymentStatus: 'deposit_sent',
      });
      alert('✅ Thanh toán thành công! Admin sẽ duyệt yêu cầu của bạn.');
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
          <div className="payment-icon">🌐</div>
          <h1 className="payment-title">Cổng Thanh Toán LTV</h1>
          <p className="payment-subtitle">An toàn - Nhanh chóng - Tiện lợi</p>
        </div>

        <div className="payment-layout">
          {/* Left Column: Summary & Methods */}
          <div className="payment-left">
            {/* 1. Bill Details */}
            <div className="booking-summary-card">
              <h2 className="section-title">1. Chi tiết hóa đơn</h2>
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
                  <span className="summary-label">Tên sân</span>
                  <span className="summary-value highlight">{selectedCourt.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Thời gian</span>
                  <span className="summary-value">{selectedDate} • {startHour}:00 - {endHour}:00</span>
                </div>
              </div>
              <div className="payment-divider"></div>
              <div className="price-breakdown">
                <div className="price-row highlight-row">
                  <span>Tổng thanh toán</span>
                  <strong className="deposit-price">{(totalPrice || 0).toLocaleString()} VNĐ</strong>
                </div>
              </div>
            </div>

            {/* 2. Payment Methods */}
            <h2 className="section-title" style={{ marginTop: '30px' }}>2. Phương thức thanh toán</h2>
            <div className="payment-methods-list">
              {PAYMENT_METHODS.map(method => (
                <div 
                  key={method.id} 
                  className={`method-row ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setBillImage(null);
                    setBillPreview(null);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="method-radio">
                      <div className="method-radio-inner"></div>
                    </div>
                    <span className="method-name">{method.name}</span>
                  </div>
                  <div className="method-icon">{method.icon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form & Actions */}
          <div className="payment-right">

            <div className="payment-form-container">
              {paymentMethod === 'visa' ? (
                <div className="visa-form fade-in">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Chi tiết thẻ tín dụng/ghi nợ</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1f71', fontStyle: 'italic' }}>VISA</span>
                        <div style={{ display: 'flex' }}>
                           <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#eb001b', marginRight: -6 }}></div>
                           <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f79e1b', opacity: 0.8 }}></div>
                        </div>
                      </div>
                   </div>
                   <div className="input-group">
                      <label>Số thẻ</label>
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" />
                   </div>
                   <div style={{ display: 'flex', gap: 16 }}>
                      <div className="input-group" style={{flex: 1}}>
                        <label>Ngày hết hạn</label>
                        <input type="text" placeholder="MM/YY" maxLength="5" />
                      </div>
                      <div className="input-group" style={{flex: 1}}>
                        <label>Mã bảo mật (CVV)</label>
                        <input type="password" placeholder="123" maxLength="4" />
                      </div>
                   </div>
                   <div className="input-group">
                      <label>Tên in trên thẻ</label>
                      <input type="text" placeholder="NGUYEN VAN A" style={{ textTransform: 'uppercase' }} />
                   </div>
                </div>
              ) : (
                <div className="manual-transfer-form fade-in">
                   <div className="qr-container" style={{ marginBottom: 0 }}>
                     <div className="qr-title">📲 Mở app MoMo, quét mã bên dưới để thanh toán</div>
                     <img src={qrUrl} alt="QR MoMo" className="qr-image" style={{ width: 240, height: 240 }} />
                     <div className="qr-amount">Số tiền cần chuyển: {(totalPrice || 0).toLocaleString()}đ</div>
                     <div style={{ marginTop: 12, padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: '0.85rem', color: '#92400e', textAlign: 'center' }}>
                       ⚠️ Vui lòng chuyển <strong>đúng số tiền {(totalPrice || 0).toLocaleString()}đ</strong> và ghi nội dung: <strong style={{ color: '#0f172a' }}>{transferContent}</strong>
                     </div>
                   </div>
                   <div style={{ marginTop: 20, textAlign: 'center' }}>
                     <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12 }}>Sau khi chuyển khoản xong, nhấn nút bên dưới:</p>
                     <button onClick={handlePaymentSubmit} disabled={loading} className="btn-confirm-payment" style={{ maxWidth: 400, margin: '0 auto' }}>
                       {loading ? '⏳ Đang xử lý...' : '✅ Tôi đã chuyển khoản thành công'}
                     </button>
                   </div>
                </div>
              )}
          </div>

            <div className="payment-actions">
              <button onClick={handlePaymentSubmit} disabled={loading} className="btn-confirm-payment">
                {loading ? '⏳ Đang xử lý...' : paymentMethod === 'visa' ? `💳 Thanh toán ${(totalPrice || 0).toLocaleString()}đ` : '✅ Xác nhận đã chuyển khoản'}
              </button>
              <button className="btn-cancel-payment" onClick={() => setPage('my-bookings')}>
                Quay lại lịch đặt sân
              </button>
            </div>
          </div>
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
          max-width: 1050px;
          width: 100%;
          background: #ffffff;
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .payment-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
        }
        @media (max-width: 850px) {
          .payment-layout { grid-template-columns: 1fr; gap: 24px; }
        }
        .payment-header { text-align: center; margin-bottom: 35px; }
        .payment-icon { font-size: 54px; margin-bottom: 12px; display: inline-block; animation: float 3s ease-in-out infinite; }
        .payment-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
        .payment-subtitle { font-size: 15px; color: #64748b; margin: 6px 0 0 0; font-weight: 500; }
        .booking-summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .section-title { font-size: 16px; font-weight: 700; color: #334155; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
        .summary-item { display: flex; flex-direction: column; }
        .summary-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .summary-value { font-size: 15px; color: #1e293b; font-weight: 700; }
        .highlight { color: #4f46e5; }
        .font-mono { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; width: fit-content; }
        .payment-divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
        .price-breakdown { display: flex; flex-direction: column; gap: 8px; }
        .price-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; }
        .highlight-row { color: #4f46e5; font-size: 18px; font-weight: 800; }
        .deposit-price { color: #10b981; font-size: 22px; font-weight: 900; }
        
        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }
        .method-row {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 24px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
        }
        .method-row:hover { border-color: #a5b4fc; background: #fff; }
        .method-row.active { border-color: #4f46e5; background: #fff; box-shadow: 0 4px 12px rgba(79,70,229,0.08); }
        .method-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .method-radio-inner { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: all 0.2s; }
        .method-row.active .method-radio { border-color: #4f46e5; }
        .method-row.active .method-radio-inner { background: #4f46e5; }
        .method-icon { font-size: 26px; }
        .method-name { font-weight: 700; color: #1e293b; font-size: 16px; }
        
        .payment-form-container {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        
        /* Visa Form Styles */
        .visa-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 13px; font-weight: 700; color: #475569; }
        .input-group input { padding: 14px 16px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 15px; outline: none; transition: border 0.2s; background: #f8fafc; font-family: 'Outfit', sans-serif; font-weight: 500; }
        .input-group input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        
        .bank-instructions-card { margin-bottom: 24px; }
        .btn-toggle-qr { display: flex; align-items: center; background: #0f172a; color: #fff; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 700; font-size: 13px; cursor: pointer; }
        .btn-toggle-qr:hover { background: #1e293b; }
        .qr-container { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border-radius: 18px; padding: 20px 16px; margin-bottom: 20px; border: 2px solid #e0e7ff; box-shadow: 0 4px 24px rgba(67,97,238,.1); text-align: center; }
        .qr-title { font-size: 13px; color: #6366f1; font-weight: 800; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; }
        .qr-image { width: 220px; height: 220px; border-radius: 12px; border: 1px solid #e2e8f0; object-fit: contain; image-rendering: pixelated; }
        .qr-amount { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 8px 16px; margin-top: 15px; font-size: 15px; font-weight: 800; color: #16a34a; display: inline-block; }
        .bank-info-grid { display: grid; grid-template-columns: 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .bank-info-item { display: flex; flex-direction: column; }
        .bank-label { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .bank-value { font-size: 14px; color: #1e293b; font-weight: 700; }
        .code-box { font-family: monospace; background: #e0f2fe; color: #0369a1; padding: 8px 12px; border-radius: 8px; font-size: 14px; border: 1px dashed #bae6fd; word-break: break-all; margin-top: 4px; }
        
        .bill-upload-card { background: #fafbff; border: 2px dashed #c7d2fe; border-radius: 18px; padding: 20px; transition: all 0.2s; }
        .bill-upload-card.success { background: #f0fdf4; border-color: #86efac; }
        .bill-preview-img { max-width: 100%; max-height: 240px; border-radius: 12px; border: 2px solid #86efac; display: block; }
        .btn-remove-bill { position: absolute; top: -8px; right: -8px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; font-weight: 900; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
        .btn-upload-bill { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#4361ee,#3a0ca3); color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 14px rgba(67,97,238,.3); transition: all 0.2s; }
        .btn-upload-bill:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(67,97,238,.4); }
        .bill-success-msg { display: flex; align-items: center; gap: 6px; margin-top: 12px; color: #16a34a; font-weight: 700; font-size: 13px; }
        
        .payment-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
        .btn-confirm-payment { width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 800; font-size: 16px; padding: 16px; border: none; border-radius: 14px; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3); transition: all 0.2s ease; }
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