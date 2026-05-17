import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import API from '../../api';

const scheduleHours = Array.from({ length: 17 }, (_, i) => i + 5);

const getSlotBooking = (court, hour, selectedDate, bookingRequests) => {
  if (!selectedDate) return null;
  return bookingRequests.find((b) => {
    if (b.status === 'rejected' || b.status === 'cancelled') return false;
    const courtMatch =
      String(b.courtId) === String(court.id || court._id) ||
      String(b.courtName) === String(court.name);
    if (!courtMatch || b.date !== selectedDate) return false;

    const startH = parseInt(b.hour, 10);
    const dur = b.duration || 1;
    const endH = startH + dur;
    return hour >= startH && hour < endH;
  });
};

const getSlotStatus = (court, hour, selectedDate, bookingRequests) => {
  const today = new Date().toISOString().split('T')[0];
  if (selectedDate === today && hour < new Date().getHours()) return 'past';

  const booking = getSlotBooking(court, hour, selectedDate, bookingRequests);
  if (!booking) {
    if (court.status === 'Đang bảo trì') return 'maintenance';
    return 'available';
  }
  if (booking.status === 'approved') return 'approved';
  if (booking.status === 'pending') return 'pending';
  if (booking.status === 'done' || booking.status === 'completed') return 'done';
  return 'available';
};

export default function ScheduleViewer({
  courts = [],
  bookingRequests = [],
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate,
  onSelectSlot,
  selectedCourt,
  selectedHour,
  refreshBookings
}) {
  const today = new Date().toISOString().split('T')[0];
  const [localDate, setLocalDate] = useState(today);
  
  const date = propSelectedDate || localDate;
  const setSelectedDate = propSetSelectedDate || setLocalDate;

  const [dateList, setDateList] = useState([]);
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);
  const [showQuickBook, setShowQuickBook] = useState(null); // { court, hour }
  const [quickBookName, setQuickBookName] = useState('');
  const [quickBookPhone, setQuickBookPhone] = useState('');
  const [quickBookPaid, setQuickBookPaid] = useState(true);
  const [submittingQuickBook, setSubmittingQuickBook] = useState(false);

  // Generate 7 days navigation starting from today
  useEffect(() => {
    const list = [];
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      list.push({
        formatted,
        dayNum: dd,
        weekday: weekdays[d.getDay()],
        label: i === 0 ? 'Hôm nay' : `${weekdays[d.getDay()]} ${dd}`
      });
    }
    setDateList(list);
  }, []);

  const handleQuickBookSubmit = async (e) => {
    e.preventDefault();
    if (!showQuickBook) return;
    if (!quickBookName.trim()) return alert('Vui lòng nhập tên khách hàng');
    if (!/^0\d{9}$/.test(quickBookPhone.replace(/\s+/g, ''))) {
      return alert('Số điện thoại không hợp lệ (cần gồm 10 chữ số bắt đầu bằng số 0)');
    }

    setSubmittingQuickBook(true);
    const { court, hour } = showQuickBook;
    const hourStr = String(hour).padStart(2, '0');

    const newBooking = {
      courtId: court.id || court._id,
      courtName: court.name,
      date: date,
      hour: hourStr,
      duration: 1,
      total: court.price || 150000,
      customerName: quickBookName.trim(),
      customerPhone: quickBookPhone.trim(),
      customerNote: 'Đặt trực tiếp tại quầy (Walk-in)',
      paymentImage: null,
      status: 'approved',
      paymentMethod: 'tại sân',
      paymentStatus: quickBookPaid ? 'paid' : 'pending'
    };

    try {
      await API.post('/bookings', newBooking);
      alert('🎉 Đặt sân trực tiếp thành công!');
      setQuickBookName('');
      setQuickBookPhone('');
      setShowQuickBook(null);
      if (refreshBookings) {
        await refreshBookings();
      } else {
        // Fallback refresh
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt sân.');
    } finally {
      setSubmittingQuickBook(false);
    }
  };

  return (
    <div className="modern-scheduler-container">
      {/* ── HEADER & SEARCH NAVIGATOR ── */}
      <div className="scheduler-header">
        <div className="header-meta">
          <div className="icon-badge">🏸</div>
          <div>
            <h2>Lịch Đặt Sân Hôm Nay</h2>
            <p>Trực quan hóa trạng thái sân, bấm vào ô <strong>Trống</strong> để đặt nhanh hoặc xem thông tin.</p>
          </div>
        </div>

        {/* Date Selector input fallback */}
        <div className="date-input-picker">
          <Calendar size={18} className="text-blue-500" />
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── SLICK WEEKDAY CARDS NAVIGATOR ── */}
      <div className="weekday-navigator">
        {dateList.map((item) => {
          const isActive = item.formatted === date;
          return (
            <button
              key={item.formatted}
              onClick={() => setSelectedDate(item.formatted)}
              className={`day-card ${isActive ? 'active' : ''}`}
            >
              <span className="weekday">{item.weekday}</span>
              <span className="day-number">{item.dayNum}</span>
              {item.formatted === today && <span className="today-dot" />}
            </button>
          );
        })}
      </div>

      {/* ── STATUS LEGENDS ── */}
      <div className="status-legend-bar">
        <div className="legend-item"><span className="dot available" /> Còn trống</div>
        <div className="legend-item"><span className="dot pending pulsing" /> Đang chờ duyệt</div>
        <div className="legend-item"><span className="dot approved" /> Đã duyệt</div>
        <div className="legend-item"><span className="dot maintenance" /> Bảo trì</div>
        <div className="legend-item"><span className="dot past" /> Lịch sử / Quá giờ</div>
      </div>

      {/* ── TIMELINE TIMELINE TIMELINE GRID ── */}
      {courts.length === 0 ? (
        <div className="empty-scheduler-state">
          <p>⚠️ Không tìm thấy sân nào khả dụng. Vui lòng thêm sân mới trong tab Quản lý sân.</p>
        </div>
      ) : (
        <div className="timeline-scroll-wrapper">
          <div className="timeline-container">
            {/* Timeline Header Row (Hours list) */}
            <div className="timeline-hours-row">
              <div className="court-header-cell-corner">Sân / Giờ</div>
              <div className="hours-timeline">
                {scheduleHours.map((hour) => (
                  <div key={hour} className="hour-header-cell">
                    <Clock size={12} className="inline mr-1" />
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Row for each Court */}
            {courts.map((court) => (
              <div key={court.id || court._id} className="court-timeline-row">
                {/* Court Meta Card on Left */}
                <div className="court-info-card">
                  <div className="court-name">{court.name}</div>
                  <div className="court-price">{court.price?.toLocaleString()}đ/h</div>
                  <span className={`court-status-badge ${court.status === 'Đang bảo trì' ? 'maintenance' : 'active'}`}>
                    {court.status === 'Đang bảo trì' ? 'Bảo trì' : 'Đang hoạt động'}
                  </span>
                </div>

                {/* Slots Timeline Cells on Right */}
                <div className="slots-timeline">
                  {scheduleHours.map((hour) => {
                    const status = getSlotStatus(court, hour, date, bookingRequests);
                    const booking = getSlotBooking(court, hour, date, bookingRequests);
                    const hourStr = String(hour).padStart(2, '0');

                    return (
                      <div
                        key={hour}
                        className={`timeline-cell-slot ${status}`}
                        onClick={() => {
                          if (status === 'available') {
                            setShowQuickBook({ court, hour });
                          } else if (booking) {
                            setActiveBookingDetails(booking);
                          }
                        }}
                      >
                        {status === 'available' && (
                          <div className="slot-btn-inner">
                            <Plus size={14} className="plus-icon" />
                            <span>Trống</span>
                          </div>
                        )}
                        {status === 'approved' && (
                          <div className="slot-badge approved">
                            👤 {booking?.customerName || 'Đã đặt'}
                          </div>
                        )}
                        {status === 'pending' && (
                          <div className="slot-badge pending pulsing">
                            ⏳ Chờ duyệt
                          </div>
                        )}
                        {status === 'maintenance' && (
                          <div className="slot-badge maintenance">
                            ⚙️ Bảo trì
                          </div>
                        )}
                        {status === 'past' && (
                          <div className="slot-badge past">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE BOOKING DETAILS DRAWER / MODAL ── */}
      {activeBookingDetails && (
        <div className="scheduler-modal-overlay" onClick={() => setActiveBookingDetails(null)}>
          <div className="scheduler-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3>📋 Chi tiết đơn đặt sân</h3>
              <button className="close-btn" onClick={() => setActiveBookingDetails(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="info-row">
                <span className="label">🎾 Sân:</span>
                <strong className="value">{activeBookingDetails.courtName}</strong>
              </div>
              <div className="info-row">
                <span className="label">📅 Ngày chơi:</span>
                <strong className="value">{activeBookingDetails.date}</strong>
              </div>
              <div className="info-row">
                <span className="label">⏰ Khung giờ:</span>
                <strong className="value">{activeBookingDetails.hour}:00 ({activeBookingDetails.duration} giờ)</strong>
              </div>
              <div className="info-row">
                <span className="label">👤 Khách hàng:</span>
                <strong className="value">{activeBookingDetails.customerName}</strong>
              </div>
              <div className="info-row">
                <span className="label">📞 Số điện thoại:</span>
                <strong className="value">{activeBookingDetails.customerPhone || activeBookingDetails.phone || 'Không có'}</strong>
              </div>
              <div className="info-row">
                <span className="label">💰 Tổng chi phí:</span>
                <strong className="value text-emerald-600 font-bold">{(activeBookingDetails.total || 0).toLocaleString()} VNĐ</strong>
              </div>
              <div className="info-row">
                <span className="label">💳 Trạng thái đơn:</span>
                <span className={`status-badge-inline ${activeBookingDetails.status}`}>
                  {activeBookingDetails.status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">💬 Ghi chú:</span>
                <p className="value text-slate-500 italic">{activeBookingDetails.customerNote || 'Không có ghi chú'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setActiveBookingDetails(null)} className="btn-close">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK WALK-IN BOOKING MODAL ── */}
      {showQuickBook && (
        <div className="scheduler-modal-overlay" onClick={() => setShowQuickBook(null)}>
          <div className="scheduler-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <h3>⚡ Đặt nhanh khách trực tiếp (Walk-in)</h3>
              <button className="close-btn" onClick={() => setShowQuickBook(null)}>✕</button>
            </div>
            <form onSubmit={handleQuickBookSubmit}>
              <div className="modal-body space-y-4">
                <div className="quick-summary-box">
                  <div className="item">
                    <span>🏟️ Sân:</span>
                    <strong>{showQuickBook.court.name}</strong>
                  </div>
                  <div className="item">
                    <span>📅 Ngày:</span>
                    <strong>{date}</strong>
                  </div>
                  <div className="item">
                    <span>⏰ Giờ chơi:</span>
                    <strong>{String(showQuickBook.hour).padStart(2, '0')}:00</strong>
                  </div>
                  <div className="item">
                    <span>💵 Giá sân:</span>
                    <strong className="text-teal-600">{(showQuickBook.court.price || 150000).toLocaleString()}đ</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tên khách hàng *</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="VD: Anh Minh"
                      value={quickBookName}
                      onChange={(e) => setQuickBookName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      type="tel"
                      placeholder="VD: 0987654321"
                      value={quickBookPhone}
                      onChange={(e) => setQuickBookPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="paid-counter"
                    checked={quickBookPaid}
                    onChange={(e) => setQuickBookPaid(e.target.checked)}
                  />
                  <label htmlFor="paid-counter">💵 Khách đã thanh toán tiền mặt tại quầy</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowQuickBook(null)} className="btn-close">Hủy</button>
                <button type="submit" disabled={submittingQuickBook} className="btn-quick-save">
                  {submittingQuickBook ? 'Đang lưu...' : '💾 Đặt sân & Duyệt ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPONENT STYLING ── */}
      <style>{`
        .modern-scheduler-container {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 32px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }

        .scheduler-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-meta .icon-badge {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .header-meta h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .header-meta p {
          margin: 4px 0 0;
          font-size: 0.87rem;
          color: #64748b;
        }

        .date-input-picker {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          border-radius: 16px;
          padding: 10px 16px;
          transition: border-color 0.2s;
        }

        .date-input-picker:focus-within {
          border-color: #3b82f6;
        }

        .date-input-picker input {
          border: none;
          outline: none;
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 600;
          cursor: pointer;
        }

        /* Day card navigator */
        .weekday-navigator {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 24px;
          scrollbar-width: none;
        }

        .weekday-navigator::-webkit-scrollbar {
          display: none;
        }

        .day-card {
          flex: 0 0 76px;
          height: 86px;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .day-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .day-card.active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: #2563eb;
          color: #fff;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
        }

        .day-card .weekday {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .day-card.active .weekday {
          color: rgba(255,255,255,0.7);
        }

        .day-card .day-number {
          font-size: 1.4rem;
          font-weight: 900;
          color: #0f172a;
          margin-top: 4px;
          line-height: 1;
        }

        .day-card.active .day-number {
          color: #fff;
        }

        .today-dot {
          position: absolute;
          bottom: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3b82f6;
        }

        .day-card.active .today-dot {
          background: #fff;
        }

        /* Legends */
        .status-legend-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 28px;
          padding: 14px 20px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px dashed #e2e8f0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #475569;
          font-weight: 500;
        }

        .legend-item .dot {
          width: 14px;
          height: 14px;
          border-radius: 6px;
          display: inline-block;
        }

        .dot.available { background: #d1fae5; border: 1.5px solid #34d399; }
        .dot.pending { background: #fef3c7; border: 1.5px solid #fbbf24; }
        .dot.approved { background: #eff6ff; border: 1.5px solid #60a5fa; }
        .dot.maintenance { background: #fef2f2; border: 1.5px solid #f87171; }
        .dot.past { background: #f1f5f9; border: 1.5px solid #cbd5e1; }

        /* Pulsing animation */
        @keyframes pulseBg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulsing {
          animation: pulseBg 2s infinite ease-in-out;
        }

        /* Timeline grid scroll */
        .timeline-scroll-wrapper {
          overflow-x: auto;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 18px rgba(0,0,0,0.02);
          background: #fff;
        }

        .timeline-container {
          width: max-content;
          display: flex;
          flex-direction: column;
        }

        /* Hours header row */
        .timeline-hours-row {
          display: flex;
          background: #f8fafc;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .court-header-cell-corner {
          width: 200px;
          flex-shrink: 0;
          padding: 16px 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-right: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .hours-timeline {
          display: flex;
        }

        .hour-header-cell {
          width: 80px;
          flex-shrink: 0;
          padding: 16px 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #475569;
          text-align: center;
          border-right: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        /* Court rows */
        .court-timeline-row {
          display: flex;
          border-bottom: 1px solid #f1f5f9;
        }

        .court-timeline-row:last-child {
          border-bottom: none;
        }

        .court-info-card {
          width: 200px;
          padding: 18px 20px;
          border-right: 1.5px solid #e2e8f0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .court-info-card .court-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }

        .court-info-card .court-price {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 3px;
          font-weight: 600;
        }

        .court-status-badge {
          display: inline-block;
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          margin-top: 8px;
          text-transform: uppercase;
        }

        .court-status-badge.active { background: #d1fae5; color: #065f46; }
        .court-status-badge.maintenance { background: #fef2f2; color: #991b1b; }

        /* Timeline Slots block */
        .slots-timeline {
          display: flex;
        }

        .timeline-cell-slot {
          width: 80px;
          flex-shrink: 0;
          height: 72px;
          border-right: 1px solid #f1f5f9;
          position: relative;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          box-sizing: border-box;
        }

        .timeline-cell-slot:hover {
          background: #f8fafc;
        }

        /* Styles by slot status */
        .timeline-cell-slot.available {
          background: #fff;
        }

        .timeline-cell-slot.available:hover {
          background: #f0fdf4;
          box-shadow: inset 0 0 0 2px #86efac;
        }

        .slot-btn-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          color: #cbd5e1;
          transition: all 0.15s;
        }

        .timeline-cell-slot.available:hover .slot-btn-inner {
          color: #16a34a;
          transform: scale(1.06);
        }

        .slot-btn-inner span {
          font-size: 0.72rem;
          font-weight: 700;
        }

        .slot-badge {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 6px;
          box-sizing: border-box;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: transform 0.18s;
        }

        .slot-badge:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .slot-badge.approved {
          background: #eff6ff;
          border: 1px solid #93c5fd;
          color: #1d4ed8;
        }

        .slot-badge.pending {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #b45309;
        }

        .slot-badge.maintenance {
          background: #fef2f2;
          border: 1.5px dashed #fca5a5;
          color: #b91c1c;
          font-size: 0.7rem;
        }

        .slot-badge.past {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
        }

        /* Modal / Overlays */
        .scheduler-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
          box-sizing: border-box;
        }

        .scheduler-modal-card {
          width: 100%;
          maxWidth: 480px;
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalIntro 0.22s ease-out;
        }

        @keyframes modalIntro {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .scheduler-modal-card .modal-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .scheduler-modal-card .modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          font-size: 16px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .scheduler-modal-card .modal-body {
          padding: 24px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          color: #64748b;
          font-weight: 600;
        }

        .info-row .value {
          color: #1e293b;
          font-weight: 700;
          text-align: right;
        }

        .status-badge-inline {
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-badge-inline.approved { background: #d1fae5; color: #065f46; }
        .status-badge-inline.pending { background: #fef3c7; color: #92400e; }

        .modal-footer {
          padding: 16px 24px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-close {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-close:hover {
          background: #e2e8f0;
        }

        /* Quick Book specific styles */
        .quick-summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        .quick-summary-box .item {
          display: flex;
          justify-content: space-between;
        }

        .quick-summary-box .item span { color: #64748b; font-weight: 500; }
        .quick-summary-box .item strong { color: #0f172a; font-weight: 700; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 10px 14px;
          background: #fff;
          transition: border-color 0.2s;
        }

        .input-with-icon:focus-within {
          border-color: #059669;
        }

        .input-with-icon input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .form-group-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          font-size: 0.9rem;
          color: #334155;
          font-weight: 600;
        }

        .form-group-checkbox input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .btn-quick-save {
          background: linear-gradient(135deg, #059669, #047857);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 10px 24px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
          transition: all 0.15s;
        }

        .btn-quick-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
        }

        @media(max-width: 768px) {
          .modern-scheduler-container {
            padding: 16px;
          }
          .scheduler-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .date-input-picker {
            width: 100%;
            box-sizing: border-box;
            justify-content: center;
          }
          .court-info-card {
            width: 140px;
            padding: 12px 14px;
          }
          .court-header-cell-corner {
            width: 140px;
          }
        }
      `}</style>
    </div>
  );
}