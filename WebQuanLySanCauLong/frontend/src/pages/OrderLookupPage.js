import { useState, useEffect } from "react";
import API from "../api";

export default function OrderLookupPage({ courts, user, onRebook, cancelBooking }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const formatTimeRange = (hour, duration) => {
    const start = String(hour).padStart(2, '0');
    const end = String(Number(hour) + Number(duration || 1)).padStart(2, '0');
    return `${start}:00 - ${end}:00`;
  };

  const parseBookingStart = (booking) => {
    const rawDate = String(booking.date || '');
    const hour = String(booking.hour || '0').padStart(2, '0');
    const combined = `${rawDate}T${hour}:00:00`;
    const dateObj = new Date(combined);
    if (!isNaN(dateObj.getTime())) return dateObj;
    const segments = rawDate.split('/');
    if (segments.length === 3) {
      const [dd, mm, yyyy] = segments;
      const fallback = new Date(`${yyyy}-${mm}-${dd}T${hour}:00:00`);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
    return null;
  };

  const formatCountdown = (target) => {
    if (!target) return '';
    const diffMs = target.getTime() - Date.now();
    if (diffMs <= 0) return 'Đang diễn ra hoặc đã kết thúc';
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `Còn ${hours} giờ ${remaining} phút nữa`;
  };

  const isArchivedBooking = (booking) => {
    const start = parseBookingStart(booking);
    if (!start) return false;
    const diffDays = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  };

  const getOrderStatusLabel = (booking) => {
    const start = parseBookingStart(booking);
    if (booking.status === 'rejected') return 'Đã hủy';
    if (start && start < new Date() && booking.status === 'approved') return 'Đã chơi';
    return 'Sắp tới';
  };

  const canCancel = (booking) => {
    const bookingUserId = booking.userId?._id || booking.userId;
    const currentUserId = user?.id || user?._id;
    const start = parseBookingStart(booking);
    if (!start || booking.status === 'rejected') return false;
    const hoursRemaining = (start.getTime() - Date.now()) / (1000 * 60 * 60);
    return bookingUserId && currentUserId && String(bookingUserId) === String(currentUserId) && hoursRemaining > 2;
  };

  const handleSearch = async (phoneInput) => {
    const trimmed = (phoneInput || phone).trim();
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(trimmed)) {
      setMessage('Vui lòng nhập số điện thoại 10 chữ số, bắt đầu bằng 0.');
      setOrders([]);
      return;
    }

    setLoading(true);
    setMessage('Đang tìm kiếm đơn...');
    try {
      const res = await API.get(`/bookings/search?phone=${encodeURIComponent(trimmed)}`);
      const bookings = Array.isArray(res.data.data) ? res.data.data : [];
      setOrders(bookings);
      setLastQuery(trimmed);
      localStorage.setItem('orderLookupPhone', trimmed);
      setMessage(bookings.length ? '' : 'Không tìm thấy đơn nào với số này.');
    } catch (err) {
      console.error('Lỗi tra cứu đơn:', err);
      setMessage('Có lỗi khi tra cứu đơn. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getCourt = (booking) => {
    return courts.find(c => String(c.id) === String(booking.courtId) || c.name === booking.courtName) || {
      id: booking.courtId,
      name: booking.courtName,
      desc: booking.courtName,
      price: booking.duration ? Math.round((booking.total || 0) / booking.duration) : booking.total || 0,
      status: 'Trống',
      image: ''
    };
  };

  const filteredOrders = orders.filter((order) => !isArchivedBooking(order));
  const archivedCount = orders.length - filteredOrders.length;
  const now = new Date();

  const upcomingOrders = filteredOrders.filter((booking) => {
    const start = parseBookingStart(booking);
    return booking.status !== 'rejected' && start && start >= now;
  });
  const completedOrders = filteredOrders.filter((booking) => {
    const start = parseBookingStart(booking);
    return booking.status === 'approved' && start && start < now;
  });
  const cancelledOrders = filteredOrders.filter((booking) => booking.status === 'rejected');

  useEffect(() => {
    if (user?.phone && user.phone !== phone) {
      setPhone(user.phone);
      handleSearch(user.phone);
    }
  }, [user?.phone]);

  useEffect(() => {
    if (!phone) {
      const saved = localStorage.getItem('orderLookupPhone');
      if (saved) {
        setPhone(saved);
        handleSearch(saved);
      }
    }
  }, []);

  const tabDefinitions = [
    { key: 'upcoming', label: 'Sắp tới', items: upcomingOrders },
    { key: 'completed', label: 'Đã chơi', items: completedOrders },
    { key: 'cancelled', label: 'Đã hủy', items: cancelledOrders }
  ];

  const activeOrders = tabDefinitions.find((tab) => tab.key === activeTab)?.items || [];

  return (
    <section className="order-lookup-page">
      <div className="lookup-header">
        <div>
          <h2>🔎 Tra cứu đơn đặt sân</h2>
          <p>Hệ thống tự nhận diện số điện thoại đã dùng trước đó và hiển thị đơn theo tab thông minh.</p>
        </div>
      </div>

      <div className="lookup-panel">
        <div className="lookup-input-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            placeholder="VD: 0987654321"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => handleSearch()} disabled={loading}>
          {loading ? 'Đang tìm kiếm...' : 'Tra cứu đơn'}
        </button>
      </div>

      {message && <div className="lookup-message">{message}</div>}
      {archivedCount > 0 && <div className="lookup-message">Đã lưu trữ tự động {archivedCount} đơn cũ hơn 30 ngày.</div>}

      {orders.length > 0 && (
        <>
          <div className="order-tabs">
            {tabDefinitions.map((tab) => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({tab.items.length})
              </button>
            ))}
          </div>

          <div className="order-results">
            {activeOrders.length === 0 ? (
              <div className="order-empty-state">Không có đơn trong mục này.</div>
            ) : (
              activeOrders.map((booking) => {
                const court = getCourt(booking);
                const start = parseBookingStart(booking);
                const countdown = start ? formatCountdown(start) : '';
                return (
                  <div key={booking._id || booking.id} className="order-card">
                    <div className="order-card-main">
                      <div className="order-card-title">
                        <div>
                          <h3>{court.name}</h3>
                          <div className="order-flag">{getOrderStatusLabel(booking)}</div>
                        </div>
                        <span className={`status-badge status-${booking.status}`}>{booking.status === 'pending' ? 'Chờ duyệt' : booking.status === 'approved' ? 'Đã duyệt' : 'Đã hủy'}</span>
                      </div>
                      <p><strong>Ngày:</strong> {booking.date}</p>
                      <p><strong>Giờ:</strong> {formatTimeRange(booking.hour, booking.duration)}</p>
                      <p><strong>Số giờ:</strong> {booking.duration || 1} giờ</p>
                      <p><strong>Tổng:</strong> {(booking.total || 0).toLocaleString()} VNĐ</p>
                      <p><strong>Khách hàng:</strong> {booking.userId?.name || booking.userId?.username || 'Không rõ'}</p>
                      {countdown && activeTab === 'upcoming' && (
                        <div className="order-countdown">{countdown}</div>
                      )}
                    </div>

                    <div className="order-card-actions">
                      {activeTab === 'completed' && (
                        <button className="btn-secondary" onClick={() => onRebook(booking)}>
                          Đặt lại sân này
                        </button>
                      )}
                      {activeTab === 'upcoming' && canCancel(booking) && (
                        <button className="btn-cancel" onClick={() => cancelBooking(booking._id || booking.id)}>
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <style>{`
        .order-lookup-page {
          padding: 40px 10%;
          min-height: 100vh;
          background: #f4f7ff;
        }
        .lookup-header h2 {
          margin: 0 0 8px;
          color: #0b5ed7;
        }
        .lookup-header p {
          margin: 0;
          color: #444;
          max-width: 620px;
        }
        .lookup-panel {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 15px;
          margin: 25px 0 20px;
        }
        .lookup-input-group {
          flex: 1 1 320px;
          display: flex;
          flex-direction: column;
        }
        .lookup-input-group label {
          font-weight: 600;
          margin-bottom: 8px;
        }
        .lookup-input-group input {
          padding: 14px 16px;
          border: 1px solid #d7e3ff;
          border-radius: 16px;
          font-size: 16px;
          background: white;
        }
        .btn-primary {
          background: #0b5ed7;
          color: white;
          padding: 14px 28px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 700;
          min-width: 180px;
          box-shadow: 0 14px 30px rgba(11,94,215,0.18);
        }
        .lookup-message {
          margin-bottom: 16px;
          color: #333;
          font-weight: 500;
        }
        .order-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
        }
        .tab-button {
          border: 1px solid #d9e3ff;
          background: white;
          color: #35469c;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }
        .tab-button.active {
          background: #0b5ed7;
          color: white;
          border-color: #0b5ed7;
          box-shadow: 0 10px 24px rgba(11,94,215,0.18);
        }
        .order-results {
          display: grid;
          gap: 20px;
        }
        .order-empty-state {
          padding: 30px;
          border-radius: 20px;
          background: white;
          color: #555;
          text-align: center;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
        }
        .order-card {
          background: white;
          border-radius: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.08);
          overflow: hidden;
          border: 1px solid #e3ebff;
        }
        .order-card-main {
          padding: 26px;
        }
        .order-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .order-card-title h3 {
          margin: 0;
          font-size: 22px;
          color: #111;
        }
        .order-flag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: #eef5ff;
          border-radius: 999px;
          color: #0b5ed7;
          font-weight: 700;
          font-size: 14px;
        }
        .status-badge {
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 13px;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-approved { background: #d4edda; color: #155724; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        .order-card-main p {
          margin: 8px 0;
          color: #444;
        }
        .order-countdown {
          margin-top: 12px;
          display: inline-block;
          background: #e7f3ff;
          color: #0b5ed7;
          padding: 10px 14px;
          border-radius: 14px;
          font-weight: 600;
        }
        .order-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 0 26px 24px;
          flex-wrap: wrap;
        }
        .btn-secondary,
        .btn-cancel {
          border: none;
          border-radius: 14px;
          padding: 14px 22px;
          cursor: pointer;
          font-weight: 700;
        }
        .btn-secondary { background: #0b5ed7; color: white; }
        .btn-cancel { background: #dc3545; color: white; }
        @media (max-width: 820px) {
          .order-lookup-page { padding: 24px 16px; }
          .lookup-panel { flex-direction: column; align-items: stretch; }
          .order-card-actions { justify-content: stretch; }
        }
      `}</style>
    </section>
  );
}
