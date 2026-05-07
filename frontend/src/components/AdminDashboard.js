import React, { useState, useEffect } from 'react';
import API from '../api';
import FooterSettings from "./FooterSettings";

export default function AdminDashboard({ 
  bookingRequests = [], 
  users = [],
  approveBooking, 
  rejectBooking, 
  deleteBooking, 
  clearOldBookings, 
  courts = [], 
  setCourts,
  refreshBookings
}) {
  const currentDate = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState('revenue');
  const [bookingSubTab, setBookingSubTab] = useState('walkin'); // 'walkin' | 'online'
  const [editingCourt, setEditingCourt] = useState(null);
  const [newCourt, setNewCourt] = useState({ name: '', price: 0, desc: '', image: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [detailBooking, setDetailBooking] = useState(null);
  const [quickBooking, setQuickBooking] = useState(null);
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickDuration, setQuickDuration] = useState(1);
  const [quickPaymentMethod, setQuickPaymentMethod] = useState('cash');
  const [revenueFilter, setRevenueFilter] = useState('week');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedOnlineId, setExpandedOnlineId] = useState(null);
  const [remainingCollected, setRemainingCollected] = useState(() => {
    const saved = localStorage.getItem('remainingCollected');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  const safeCourts = Array.isArray(courts) ? courts.filter(c => c && typeof c === 'object' && c.id) : [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('remainingCollected', JSON.stringify(remainingCollected));
  }, [remainingCollected]);

  const getBookingEndTime = (booking) => {
    if (!booking || !booking.date || !booking.hour) return new Date();
    const [year, month, day] = booking.date.split('-');
    const y = parseInt(year);
    if (isNaN(y) || y < 2020 || y > 2030) return new Date();
    const start = new Date(y, parseInt(month) - 1, parseInt(day), parseInt(booking.hour), 0, 0);
    return new Date(start.getTime() + (booking.duration || 1) * 60 * 60 * 1000);
  };

  const isBookingCompleted = (booking) => {
    if (booking.status !== 'approved') return false;
    return currentTime > getBookingEndTime(booking).getTime();
  };

  const getRemainingTime = (booking) => {
    if (booking.status !== 'approved') return '';
    const remainingMs = getBookingEndTime(booking).getTime() - currentTime;
    if (remainingMs <= 0) return 'Đã kết thúc';
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCourtPlaying = (booking) => {
    if (booking.status !== 'approved') return false;
    const [year, month, day] = booking.date.split('-');
    const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(booking.hour), 0, 0);
    const end = getBookingEndTime(booking);
    return currentTime >= start.getTime() && currentTime < end.getTime();
  };

  const today = currentDate;
  const bookingsToday = bookingRequests.filter(b => b.date === today);
  const approvedToday = bookingsToday.filter(b => b.status === 'approved');
  const revenueToday = approvedToday.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalBookingsToday = bookingsToday.length;
  const activeCourts = courts.filter(c => c.status === 'Đang sử dụng').length;
  const totalBookingsAll = bookingRequests.length;
  const pendingOnlineCount = bookingRequests.filter(b => b.status === 'pending').length;

  const getDeposit = (b) => Math.floor((b.total || 0) * 0.5);
  const getRemaining = (b) => (b.total || 0) - getDeposit(b);

  const pendingRemainingBookings = bookingRequests.filter(b => 
    b.status === 'approved' && isBookingCompleted(b) && !remainingCollected.includes(String(b._id || b.id))
  );

  const getCustomerName = (booking) => {
    if (booking.customerName) return booking.customerName;
    if (booking.userId) {
      if (typeof booking.userId === 'object' && booking.userId.username) return booking.userId.username;
      if (typeof booking.userId === 'string') return booking.userId;
    }
    return 'Khách';
  };

  const parseBookingDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getUserName = (user) => user?.username || user?.name || user?.email || 'Khách';
  const getUserId = (user) => String(user?._id || user?.id || '');
  const getBookingUserId = (booking) => {
    if (!booking) return '';
    if (booking.userId) {
      if (typeof booking.userId === 'object') return String(booking.userId._id || booking.userId.id || booking.userId);
      return String(booking.userId);
    }
    return '';
  };

  const getUserBookings = (user) => {
    const userId = getUserId(user);
    const userName = getUserName(user);
    return bookingRequests.filter(b => {
      const bookingUserId = getBookingUserId(b);
      if (bookingUserId && userId && bookingUserId === userId) return true;
      if ((!bookingUserId || bookingUserId === '') && b.customerName && userName && b.customerName.toLowerCase() === userName.toLowerCase()) return true;
      return false;
    });
  };

  const customerData = users.map(user => {
    const bookings = getUserBookings(user);
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const totalRev = approvedBookings.reduce((sum, b) => sum + (b.total || 0), 0);
    const lastBooking = bookings.reduce((latest, b) => {
      if (!b.date) return latest;
      const date = parseBookingDate(b.date);
      return !latest || date > latest ? date : latest;
    }, null);
    return { user, bookings, approvedBookings, totalRevenue: totalRev, totalBookings: bookings.length, lastBooking };
  });

  const filteredCustomers = customerData
    .filter(item => {
      const term = customerSearch.trim().toLowerCase();
      if (!term) return true;
      return getUserName(item.user).toLowerCase().includes(term) || (item.user.email || '').toLowerCase().includes(term);
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalBookings - a.totalBookings);

  const selectedCustomerData = selectedCustomer ? customerData.find(item => getUserId(item.user) === getUserId(selectedCustomer)) : null;
  const topCustomers = filteredCustomers.slice(0, 10);
  const formatDateLabel = (date) => date ? `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}` : 'Chưa đặt';
  const formatMoney = (value) => (value || 0).toLocaleString() + ' VNĐ';
  const getCustomerStatus = (item) => item.totalBookings === 0 ? 'Chưa đặt' : item.totalRevenue === 0 ? 'Đang xem' : 'Hoạt động';

  const getPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') return { start: new Date(end), end: new Date(end) };
    if (filter === 'month') return { start: new Date(end.getFullYear(), end.getMonth(), 1), end: new Date(end) };
    const start = new Date(end); start.setDate(start.getDate() - 6);
    return { start, end };
  };

  const getRevenueBookings = (filter) => {
    const { start, end } = getPeriodBounds(filter);
    return bookingRequests.filter(b => {
      if (b.status !== 'approved') return false;
      const d = parseBookingDate(b.date);
      return d >= start && d <= end;
    });
  };

  const getPreviousPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') { const prev = new Date(end); prev.setDate(prev.getDate()-1); return { start: new Date(prev), end: new Date(prev) }; }
    if (filter === 'month') { return { start: new Date(end.getFullYear(), end.getMonth()-1, 1), end: new Date(end.getFullYear(), end.getMonth(), 0) }; }
    const start = new Date(end); start.setDate(start.getDate()-13);
    const middle = new Date(end); middle.setDate(middle.getDate()-7);
    return { start, end: middle };
  };

  const getRevenueTotal = (bookings) => bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const currentPeriodBookings = getRevenueBookings(revenueFilter);
  const previousPeriodBookings = bookingRequests.filter(b => {
    if (b.status !== 'approved') return false;
    const d = parseBookingDate(b.date);
    const { start, end } = getPreviousPeriodBounds(revenueFilter);
    return d >= start && d <= end;
  });
  const revenueCurrent = getRevenueTotal(currentPeriodBookings);
  const revenuePrevious = getRevenueTotal(previousPeriodBookings);
  const growthPct = revenuePrevious === 0 ? (revenueCurrent === 0 ? 0 : 100) : Math.round(((revenueCurrent - revenuePrevious) / revenuePrevious) * 100);
  const growthLabel = revenueCurrent >= revenuePrevious ? `+${growthPct}%` : `${growthPct}%`;
  const growthColor = revenueCurrent >= revenuePrevious ? '#198754' : '#dc3545';

  const chartDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    const dayLabel = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}`;
    const amount = getRevenueTotal(bookingRequests.filter(b => b.status === 'approved' && parseBookingDate(b.date)?.getTime() === date.setHours(0,0,0,0)));
    return { dayLabel, amount };
  });
  const lineMax = Math.max(1, ...chartDates.map(item => item.amount));
  const linePoints = chartDates.map((item, index) => { const x = 20+index*80; const y = 140-Math.round((item.amount/lineMax)*120); return `${x},${y}`; }).join(' ');

  const courtRevenueData = safeCourts.map(court => ({
    court,
    value: getRevenueTotal(currentPeriodBookings.filter(b => String(b.courtId) === String(court.id || court._id)))
  }));
  const maxCourtRevenue = Math.max(1, ...courtRevenueData.map(item => item.value));

  const peakRevenue = getRevenueTotal(currentPeriodBookings.filter(b => { const h = Number(b.hour); return h >= 17 && h <= 21; }));
  const offPeakRevenue = getRevenueTotal(currentPeriodBookings.filter(b => { const h = Number(b.hour); return h < 17 || h > 21; }));
  const totalPeak = peakRevenue + offPeakRevenue || 1;
  const peakPercent = Math.round((peakRevenue / totalPeak) * 100);
  const offPeakPercent = 100 - peakPercent;

  // Schedule
  const scheduleHours = Array.from({ length: 17 }, (_, index) => 5 + index);
  const scheduleBookings = bookingRequests.filter(b => b.date === selectedDate);
  const getSlotBooking = (court, hour) => scheduleBookings.find(b => String(b.courtId) === String(court.id || court._id) && String(b.hour) === String(hour));
  const getSlotClass = (booking) => {
    if (!booking) return 'slot-free';
    if (booking.status === 'pending') return 'slot-pending';
    if (booking.status === 'approved') return isBookingCompleted(booking) ? 'slot-completed' : 'slot-approved';
    return 'slot-rejected';
  };
  const getSlotLabel = (booking) => {
    if (!booking) return 'Trống';
    if (booking.status === 'pending') return 'Chờ duyệt';
    if (booking.status === 'approved') return isBookingCompleted(booking) ? 'Kết thúc' : 'Đã đặt';
    return 'Từ chối';
  };

  const calculateQuickPrice = (court, hour, duration = 1) => {
    if (!court || hour == null) return 0;
    const h = Number(hour);
    let price = court.price || 0;
    if (h >= 17) price = Math.floor(price * 1.3);
    return price * duration;
  };

  const canBookDuration = (court, hour, duration) => {
    const start = Number(hour);
    for (let step = 0; step < duration; step++) {
      const targetHour = String(start + step).padStart(2, '0');
      const existing = bookingRequests.find(b =>
        String(b.courtId) === String(court.id || court._id) &&
        b.date === selectedDate &&
        String(b.hour) === String(targetHour) &&
        b.status === 'approved'
      );
      if (existing) return false;
    }
    return true;
  };

  const handleEmptySlotClick = (court, hour) => {
    setQuickBooking({ court, hour: String(hour).padStart(2, '0'), date: selectedDate });
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickDuration(1);
    setQuickPaymentMethod('cash');
    setDetailBooking(null);
  };

  const handleBookedSlotClick = (booking) => {
    setDetailBooking(booking);
    setQuickBooking(null);
  };

  const submitQuickBooking = async () => {
    if (!quickBooking) return;
    if (!quickCustomerName.trim()) return alert('Nhập tên khách hàng');
    if (!canBookDuration(quickBooking.court, quickBooking.hour, quickDuration)) return alert('Khung giờ này đã trùng với đơn đã duyệt');
    const total = calculateQuickPrice(quickBooking.court, quickBooking.hour, quickDuration);
    try {
      await API.post('/bookings/admin-booking', {
        courtId: quickBooking.court.id,
        courtName: quickBooking.court.name,
        date: quickBooking.date,
        hour: quickBooking.hour,
        duration: quickDuration,
        total,
        customerName: quickCustomerName,
        customerPhone: quickCustomerPhone,
        paymentMethod: quickPaymentMethod,
        status: 'approved'
      });
      alert(`✅ Đã đặt sân thành công!\n👤 Khách: ${quickCustomerName}\n🏸 Sân: ${quickBooking.court.name}\n⏰ ${quickBooking.hour}:00 - ${String(Number(quickBooking.hour)+quickDuration).padStart(2,'0')}:00\n💰 Tổng: ${total.toLocaleString()} VNĐ\n💳 TT: ${quickPaymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}`);
      setQuickBooking(null);
      refreshBookings && refreshBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Đặt sân thất bại');
    }
  };

  const handleConfirmRemaining = (booking) => {
    const id = String(booking._id || booking.id);
    if (!remainingCollected.includes(id)) {
      setRemainingCollected([...remainingCollected, id]);
      alert(`Đã thu ${getRemaining(booking).toLocaleString()} VNĐ từ ${getCustomerName(booking)}`);
    }
  };

  const handleApprove = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    setLoading(true);
    try { await approveBooking(id); } catch (e) { alert("Lỗi duyệt!"); }
    setLoading(false);
  };

  const handleReject = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!rejectReason.trim()) { alert('Nhập lý do từ chối'); return; }
    setLoading(true);
    try {
      await rejectBooking(id, rejectReason);
      setShowRejectModal(null); setRejectReason(''); setQrCode('');
    } catch (e) { alert("Lỗi từ chối!"); }
    setLoading(false);
  };

  const handleDelete = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!window.confirm('Xóa đơn này?')) return;
    setLoading(true);
    try { await deleteBooking(id); } catch (e) { alert("Lỗi xóa!"); }
    setLoading(false);
  };

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.price) { alert('Nhập đủ thông tin sân'); return; }
    setLoading(true);
    try {
      await API.post('/courts', { name: newCourt.name, price: newCourt.price, description: newCourt.desc, image: newCourt.image, status: 'Trống' });
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setNewCourt({ name: '', price: 0, desc: '', image: '' });
      alert('Thêm sân thành công!');
    } catch (error) { alert('Thêm sân thất bại!'); }
    setLoading(false);
  };

  const handleUpdateCourt = async () => {
    if (!editingCourt) return;
    setLoading(true);
    try {
      await API.put(`/courts/${editingCourt.id}`, { name: editingCourt.name, price: editingCourt.price, description: editingCourt.desc, image: editingCourt.image, status: editingCourt.status });
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setEditingCourt(null);
      alert('Cập nhật sân thành công!');
    } catch (error) { alert(error.response?.data?.message || 'Cập nhật sân thất bại!'); }
    setLoading(false);
  };

  const handleDeleteCourt = async (id) => {
    if (!window.confirm('Xóa sân này?')) return;
    setLoading(true);
    try {
      await API.delete(`/courts/${id}`);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      alert('Xóa sân thành công!');
    } catch (error) { alert('Xóa sân thất bại!'); }
    setLoading(false);
  };

  // Online bookings (từ khách đặt web)
  const onlineBookings = [...bookingRequests]
    .filter(b => !b.customerName || b.customerName === '') // đơn từ user thật, không phải admin đặt hộ
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  // Walk-in bookings (admin đặt hộ)
  const walkinBookings = [...bookingRequests]
    .filter(b => b.customerName && b.customerName !== '')
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div style={{ padding: '20px' }}>
      <h2>👑 BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h2>
      {loading && <div style={{ background: '#ffc107', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>⏳ Đang xử lý...</div>}

      <div className="dashboard-stats">
        <div className="stat-card"><h3>🏸 Sân đang hoạt động</h3><p>{activeCourts}</p></div>
        <div className="stat-card"><h3>📅 Lịch đặt hôm nay</h3><p>{totalBookingsToday}</p></div>
        <div className="stat-card"><h3>💰 Doanh thu hôm nay</h3><p>{revenueToday.toLocaleString()} VNĐ</p></div>
        <div className="stat-card"><h3>📊 Tổng lượt đặt</h3><p>{totalBookingsAll}</p></div>
      </div>

      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <button onClick={() => setShowFooterModal(true)} style={{ background: '#6c757d', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
          ⚙️ Cài đặt thông tin liên hệ
        </button>
      </div>

      {/* MAIN TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        {[
          { key: 'revenue', label: '💰 DOANH THU' },
          { key: 'courts', label: '🏸 QUẢN LÝ SÂN' },
          { key: 'bookings', label: `📋 LỊCH ĐẶT SÂN${pendingOnlineCount > 0 ? ` 🔴${pendingOnlineCount}` : ''}` },
          { key: 'customers', label: '👥 KHÁCH HÀNG' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '10px 20px', background: activeTab === tab.key ? '#00a651' : 'transparent', color: activeTab === tab.key ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0', fontWeight: activeTab === tab.key ? '700' : '400' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* REVENUE TAB */}
      {activeTab === 'revenue' && (
        <div>
          <div className="revenue-filter-bar">
            <div><h3>📈 Phân tích doanh thu</h3><p>Hiển thị dữ liệu theo bộ lọc và so sánh với kỳ trước.</p></div>
            <div className="revenue-filter-buttons">
              {['today','week','month'].map(option => (
                <button key={option} className={revenueFilter === option ? 'filter-btn active' : 'filter-btn'} onClick={() => setRevenueFilter(option)}>
                  {option === 'today' ? 'Hôm nay' : option === 'week' ? 'Tuần này' : 'Tháng này'}
                </button>
              ))}
            </div>
          </div>
          <div className="revenue-summary">
            <div className="stat-card"><h3>💰 Tổng doanh thu</h3><p>{revenueCurrent.toLocaleString()} VNĐ</p></div>
            <div className="stat-card"><h3>📊 Tăng trưởng</h3><p style={{ color: growthColor }}>{growthLabel} so với kỳ trước</p></div>
            <div className="stat-card"><h3>⏱ Giờ cao điểm</h3><p>{peakRevenue.toLocaleString()} VNĐ</p></div>
            <div className="stat-card"><h3>🌙 Giờ thấp điểm</h3><p>{offPeakRevenue.toLocaleString()} VNĐ</p></div>
          </div>
          <div className="chart-grid">
            <div className="chart-card">
              <h4>Doanh thu 7 ngày gần nhất</h4>
              <div className="line-chart">
                <svg viewBox="0 0 620 180" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#0d6efd" strokeWidth="3" points={linePoints} />
                  {chartDates.map((item, index) => { const x=20+index*80; const y=140-Math.round((item.amount/lineMax)*120); return (<g key={item.dayLabel}><circle cx={x} cy={y} r="5" fill="#0d6efd"/><text x={x} y={y-12} textAnchor="middle" fontSize="11" fill="#212529">{item.amount.toLocaleString()}</text><text x={x} y="165" textAnchor="middle" fontSize="12" fill="#6c757d">{item.dayLabel}</text></g>); })}
                </svg>
              </div>
            </div>
            <div className="chart-card">
              <h4>Doanh thu theo sân</h4>
              <div className="bar-chart">
                {courtRevenueData.map(item => (<div key={item.court.id} className="bar-row"><div className="bar-label">{item.court.name}</div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((item.value/maxCourtRevenue)*100)}%` }}/></div><div className="bar-value">{item.value.toLocaleString()} VNĐ</div></div>))}
              </div>
            </div>
            <div className="chart-card">
              <h4>Tỷ lệ giờ cao điểm vs thấp điểm</h4>
              <div className="pie-chart">
                <svg viewBox="0 0 160 160" className="pie-svg"><circle cx="80" cy="80" r="60" fill="#f8d7da"/><circle cx="80" cy="80" r="60" fill="none" stroke="#0d6efd" strokeWidth="120" strokeDasharray={`${peakPercent} ${100-peakPercent}`} strokeDashoffset="25" transform="rotate(-90 80 80)"/></svg>
                <div className="pie-legend"><div><span className="legend-dot" style={{background:'#0d6efd'}}></span> Cao điểm {peakPercent}%</div><div><span className="legend-dot" style={{background:'#f8d7da'}}></span> Thấp điểm {offPeakPercent}%</div></div>
              </div>
            </div>
          </div>
          <h3>📋 Chi tiết doanh thu từ cọc</h3>
          <table className="admin-table">
            <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ</th><th>Tổng</th><th>Cọc 50%</th><th>Còn lại</th><th>Trạng thái</th><th>TG còn lại</th></tr></thead>
            <tbody>
              {bookingRequests.filter(b => b.status === 'approved').map(b => {
                const completed = isBookingCompleted(b);
                const paid = remainingCollected.includes(String(b._id || b.id));
                return (<tr key={b._id||b.id}><td>{getCustomerName(b)}</td><td>{b.courtName}</td><td>{b.date}</td><td>{b.hour}:00</td><td>{(b.total||0).toLocaleString()} VNĐ</td><td>{getDeposit(b).toLocaleString()} VNĐ</td><td>{getRemaining(b).toLocaleString()} VNĐ</td><td style={{color: !completed?'blue':(paid?'green':'orange')}}>{!completed?'🟢 Đang hoạt động':(paid?'✅ Đã hoàn thành':'💰 Chờ thanh toán')}</td><td>{!completed?getRemainingTime(b):'Đã kết thúc'}</td></tr>);
              })}
              {!bookingRequests.some(b => b.status==='approved') && <tr><td colSpan="9">Chưa có đơn duyệt</td></tr>}
            </tbody>
          </table>
          {pendingRemainingBookings.length > 0 && (
            <>
              <h3>💸 Chờ thu tiền còn lại</h3>
              <table className="admin-table">
                <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ kết thúc</th><th>Tiền còn lại</th><th>Hành động</th></tr></thead>
                <tbody>
                  {pendingRemainingBookings.map(b => (<tr key={b._id||b.id}><td>{getCustomerName(b)}</td><td>{b.courtName}</td><td>{b.date}</td><td>{getBookingEndTime(b).toLocaleTimeString()}</td><td>{getRemaining(b).toLocaleString()} VNĐ</td><td><button onClick={() => handleConfirmRemaining(b)} className="btn-confirm">Xác nhận đã thu</button></td></tr>))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* COURTS TAB */}
      {activeTab === 'courts' && (
        <div>
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3>➕ THÊM SÂN MỚI</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Tên sân" value={newCourt.name} onChange={e => setNewCourt({...newCourt, name: e.target.value})} />
              <input type="number" placeholder="Giá / giờ" value={newCourt.price} onChange={e => setNewCourt({...newCourt, price: parseInt(e.target.value)})} />
              <input type="text" placeholder="Mô tả" value={newCourt.desc} onChange={e => setNewCourt({...newCourt, desc: e.target.value})} />
              <input type="text" placeholder="URL hình ảnh" value={newCourt.image} onChange={e => setNewCourt({...newCourt, image: e.target.value})} />
            </div>
            <button onClick={handleAddCourt} style={{ marginTop: '15px', background: '#00a651', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>THÊM SÂN</button>
          </div>
          <h3>✏️ DANH SÁCH SÂN HIỆN CÓ</h3>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Tên sân</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {safeCourts.length > 0 ? safeCourts.map(court => (
                <tr key={court.id}>
                  <td>{court.id}</td>
                  <td>{editingCourt?.id === court.id ? <input value={editingCourt.name||''} onChange={e => setEditingCourt({...editingCourt, name: e.target.value})} /> : court.name||'N/A'}</td>
                  <td>{editingCourt?.id === court.id ? <input type="number" value={editingCourt.price||0} onChange={e => setEditingCourt({...editingCourt, price: parseInt(e.target.value)})} /> : (court.price||0).toLocaleString()+' VNĐ'}</td>
                  <td>{court.status||'Trống'}</td>
                  <td>
                    {editingCourt?.id === court.id ? (<><button onClick={handleUpdateCourt} style={{background:'#28a745',color:'white',marginRight:'5px'}}>Lưu</button><button onClick={() => setEditingCourt(null)}>Hủy</button></>) : (<><button onClick={() => setEditingCourt(court)} style={{background:'#ffc107',marginRight:'5px'}}>Sửa</button><button onClick={() => handleDeleteCourt(court.id)} style={{background:'#dc3545',color:'white'}}>Xóa</button></>)}
                  </td>
                </tr>
              )) : <tr><td colSpan="5">Chưa có sân nào</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div>
          {/* SUB TABS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setBookingSubTab('walkin')}
              style={{ padding: '10px 24px', borderRadius: '10px', border: '2px solid', borderColor: bookingSubTab === 'walkin' ? '#00a651' : '#ddd', background: bookingSubTab === 'walkin' ? '#00a651' : 'white', color: bookingSubTab === 'walkin' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
            >
              🏸 Đặt sân tại chỗ
            </button>
            <button
              onClick={() => setBookingSubTab('online')}
              style={{ padding: '10px 24px', borderRadius: '10px', border: '2px solid', borderColor: bookingSubTab === 'online' ? '#0d6efd' : '#ddd', background: bookingSubTab === 'online' ? '#0d6efd' : 'white', color: bookingSubTab === 'online' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer', fontSize: '15px', position: 'relative' }}
            >
              📱 Đơn đặt online
              {pendingOnlineCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  {pendingOnlineCount}
                </span>
              )}
            </button>
          </div>

          {/* WALK-IN: Bảng lịch + đặt nhanh */}
          {bookingSubTab === 'walkin' && (
            <div className="schedule-section">
              <div className="schedule-header">
                <div>
                  <h3>🏸 ĐẶT SÂN TẠI CHỖ</h3>
                  <p>Bấm vào ô <strong>Trống</strong> để đặt nhanh cho khách lên sân trực tiếp.</p>
                </div>
                <div className="date-picker">
                  <label>Chọn ngày</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
              </div>

              <div className="schedule-legend">
                <div className="legend-item"><span className="legend-dot" style={{background:'#dff7e0'}}></span>Còn trống — bấm để đặt</div>
                <div className="legend-item"><span className="legend-dot" style={{background:'#f8d7da'}}></span>Đã đặt & duyệt</div>
                <div className="legend-item"><span className="legend-dot" style={{background:'#fff5cc'}}></span>Chờ duyệt (online)</div>
                <div className="legend-item"><span className="legend-dot" style={{background:'#e2e3e5'}}></span>Đã hoàn thành</div>
              </div>

              {safeCourts.length === 0 ? (
                <p>Không có sân để hiển thị lịch.</p>
              ) : (
                <div className="schedule-grid" style={{ gridTemplateColumns: `160px repeat(${safeCourts.length}, minmax(140px, 1fr))` }}>
                  <div className="schedule-court-header schedule-corner">Giờ / Sân</div>
                  {safeCourts.map(court => <div key={court.id} className="schedule-court-header">{court.name}</div>)}
                  {scheduleHours.map(hour => (
                    <React.Fragment key={hour}>
                      <div className="schedule-time-cell">{String(hour).padStart(2,'0')}:00</div>
                      {safeCourts.map(court => {
                        const booking = getSlotBooking(court, String(hour).padStart(2,'0'));
                        return (
                          <button type="button" key={`${court.id}-${hour}`}
                            className={`slot-cell ${getSlotClass(booking)}`}
                            onClick={() => booking ? handleBookedSlotClick(booking) : handleEmptySlotClick(court, hour)}
                          >
                            <span>{getSlotLabel(booking)}</span>
                            {booking && <span className="slot-subtext">{getCustomerName(booking)}</span>}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Walk-in history */}
              {walkinBookings.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4>📋 Lịch sử đặt tại chỗ</h4>
                  <table className="admin-table">
                    <thead><tr><th>Khách</th><th>SĐT</th><th>Sân</th><th>Ngày</th><th>Giờ</th><th>Thời lượng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {walkinBookings.slice(0,20).map(b => (
                        <tr key={b._id||b.id}>
                          <td>{b.customerName}</td>
                          <td>{b.customerPhone || '—'}</td>
                          <td>{b.courtName}</td>
                          <td>{b.date}</td>
                          <td>{b.hour}:00</td>
                          <td>{b.duration||1} giờ</td>
                          <td>{(b.total||0).toLocaleString()} VNĐ</td>
                          <td style={{color: isCourtPlaying(b)?'#00a651':isBookingCompleted(b)?'#666':'#0d6efd'}}>
                            {isCourtPlaying(b)?'🟢 Đang chơi':isBookingCompleted(b)?'✅ Xong':'🔵 Sắp tới'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ONLINE: Đơn đặt từ web */}
          {bookingSubTab === 'online' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>📱 ĐƠN ĐẶT ONLINE</h3>
                  <p>Danh sách đơn khách đặt qua website. Kiểm tra ảnh chuyển khoản rồi duyệt hoặc từ chối.</p>
                </div>
                <button onClick={() => { if(window.confirm('Dọn các đơn cũ đã xử lý?')) clearOldBookings&&clearOldBookings(); }} style={{ background:'#6c757d', color:'white', padding:'8px 16px', border:'none', borderRadius:'8px', cursor:'pointer' }}>🗑 Dọn lịch cũ</button>
              </div>

              {/* Đơn chờ duyệt */}
              {pendingOnlineCount > 0 && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#856404' }}>⏳ {pendingOnlineCount} đơn đang chờ duyệt</h4>
                  {bookingRequests.filter(b => b.status === 'pending').map(req => (
                    <div key={req._id||req.id} style={{ background: 'white', borderRadius: '10px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px' }}>👤 {getCustomerName(req)}</div>
                          <div style={{ color: '#555', marginTop: '4px' }}>🏸 {req.courtName} &nbsp;|&nbsp; 📅 {req.date} &nbsp;|&nbsp; ⏰ {req.hour}:00 &nbsp;|&nbsp; ⏱ {req.duration||1}h</div>
                          <div style={{ color: '#00a651', fontWeight: '700', marginTop: '4px' }}>💰 Tổng: {(req.total||0).toLocaleString()} VNĐ &nbsp;|&nbsp; Cọc 50%: {getDeposit(req).toLocaleString()} VNĐ</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => setExpandedOnlineId(expandedOnlineId === (req._id||req.id) ? null : (req._id||req.id))} style={{ background: '#e9ecef', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                            {expandedOnlineId === (req._id||req.id) ? '🔼 Ẩn' : '🔽 Xem ảnh'}
                          </button>
                          <button onClick={() => handleApprove(req)} style={{ background: '#00a651', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✅ Duyệt</button>
                          <button onClick={() => setShowRejectModal(req)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>❌ Từ chối</button>
                        </div>
                      </div>
                      {expandedOnlineId === (req._id||req.id) && req.paymentImage && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontWeight: '600', marginBottom: '8px' }}>🧾 Ảnh chuyển khoản cọc:</div>
                          <img src={req.paymentImage} alt="payment" style={{ maxWidth: '300px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => window.open(req.paymentImage)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tất cả đơn online */}
              <h4>📋 Tất cả đơn đặt online</h4>
              <table className="admin-table">
                <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ảnh CK</th><th>Hành động</th></tr></thead>
                <tbody>
                  {bookingRequests.filter(b => !b.customerName || b.customerName === '').length === 0
                    ? <tr><td colSpan="8">📭 Chưa có đơn đặt online nào</td></tr>
                    : bookingRequests.filter(b => !b.customerName || b.customerName === '').map(req => (
                      <tr key={req._id||req.id}>
                        <td>{getCustomerName(req)}</td>
                        <td>{req.courtName}</td>
                        <td>{req.date}</td>
                        <td>{req.hour}:00</td>
                        <td>{(req.total||0).toLocaleString()} VNĐ</td>
                        <td style={{ color: req.status==='approved'?'#00a651':req.status==='pending'?'#ffc107':'#dc3545', fontWeight:'600' }}>
                          {req.status==='approved'?'✅ Đã duyệt':req.status==='pending'?'⏳ Chờ duyệt':'❌ Từ chối'}
                        </td>
                        <td>{req.paymentImage ? <img src={req.paymentImage} alt="ck" style={{width:'50px',height:'50px',objectFit:'cover',borderRadius:'6px',cursor:'pointer'}} onClick={() => window.open(req.paymentImage)} /> : '—'}</td>
                        <td>
                          {req.status==='pending' && <><button onClick={() => handleApprove(req)} style={{background:'#00a651',color:'white',border:'none',padding:'5px 10px',borderRadius:'6px',cursor:'pointer',marginRight:'5px'}}>✅</button><button onClick={() => setShowRejectModal(req)} style={{background:'#dc3545',color:'white',border:'none',padding:'5px 10px',borderRadius:'6px',cursor:'pointer',marginRight:'5px'}}>❌</button></>}
                          <button onClick={() => handleDelete(req)} style={{background:'#6c757d',color:'white',border:'none',padding:'5px 10px',borderRadius:'6px',cursor:'pointer'}}>🗑</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Modal chi tiết booking đã đặt */}
          {detailBooking && (
            <div className="modal-overlay">
              <div className="modal-box admin-schedule-modal">
                <h3>Chi tiết đơn đặt sân</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'12px' }}>
                  <div><strong>Sân:</strong> {detailBooking.courtName}</div>
                  <div><strong>Ngày:</strong> {detailBooking.date}</div>
                  <div><strong>Giờ:</strong> {detailBooking.hour}:00</div>
                  <div><strong>Thời lượng:</strong> {detailBooking.duration||1} giờ</div>
                  <div><strong>Khách hàng:</strong> {getCustomerName(detailBooking)}</div>
                  <div><strong>Nguồn:</strong> {detailBooking.customerName ? '🏸 Tại chỗ' : '📱 Online'}</div>
                  <div><strong>Trạng thái:</strong> {detailBooking.status==='approved'?'✅ Đã duyệt':detailBooking.status==='pending'?'⏳ Chờ duyệt':'❌ Từ chối'}</div>
                  <div><strong>Thời gian còn lại:</strong> {isBookingCompleted(detailBooking)?'Đã kết thúc':getRemainingTime(detailBooking)}</div>
                </div>
                <div className="total-box">Tổng tiền: <strong>{(detailBooking.total||0).toLocaleString()} VNĐ</strong></div>
                {detailBooking.paymentImage && (
                  <div style={{marginTop:'12px'}}><strong>Ảnh cọc:</strong><img src={detailBooking.paymentImage} alt="payment" style={{width:'100%',borderRadius:'12px',marginTop:'8px'}} /></div>
                )}
                <div className="modal-actions">
                  {detailBooking.status==='pending' && (
                    <>
                      <button className="btn-confirm" onClick={() => { handleApprove(detailBooking); setDetailBooking(null); }}>✅ Duyệt</button>
                      <button className="btn-reject" onClick={() => { setShowRejectModal(detailBooking); setDetailBooking(null); }}>❌ Từ chối</button>
                    </>
                  )}
                  <button className="btn-cancel" onClick={() => setDetailBooking(null)}>Đóng</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal đặt nhanh walk-in */}
          {quickBooking && (
            <div className="modal-overlay">
              <div className="modal-box admin-schedule-modal">
                <h3>🏸 Đặt sân tại chỗ</h3>
                <p style={{color:'#666',margin:'4px 0 16px'}}>Khách lên sân trực tiếp — đặt và duyệt luôn.</p>
                <div style={{background:'#f0f9f4',borderRadius:'10px',padding:'12px',marginBottom:'16px'}}>
                  <div><strong>🏸 Sân:</strong> {quickBooking.court.name}</div>
                  <div><strong>📅 Ngày:</strong> {quickBooking.date}</div>
                  <div><strong>⏰ Giờ bắt đầu:</strong> {quickBooking.hour}:00</div>
                </div>
                <div className="form-group">
                  <label>👤 Tên khách hàng *</label>
                  <input value={quickCustomerName} onChange={e => setQuickCustomerName(e.target.value)} placeholder="Nhập tên khách" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}} />
                </div>
                <div className="form-group">
                  <label>📞 Số điện thoại</label>
                  <input value={quickCustomerPhone} onChange={e => setQuickCustomerPhone(e.target.value)} placeholder="0xxxxxxxxx (không bắt buộc)" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}} />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div className="form-group">
                    <label>⏱ Số giờ</label>
                    <input type="number" min="1" max="8" value={quickDuration} onChange={e => setQuickDuration(Math.max(1,Number(e.target.value)||1))} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}} />
                  </div>
                  <div className="form-group">
                    <label>💳 Thanh toán</label>
                    <select value={quickPaymentMethod} onChange={e => setQuickPaymentMethod(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}}>
                      <option value="cash">💵 Tiền mặt</option>
                      <option value="transfer">🏦 Chuyển khoản</option>
                    </select>
                  </div>
                </div>
                <div style={{background:'#fff3cd',borderRadius:'10px',padding:'12px',margin:'12px 0',fontWeight:'700',fontSize:'16px'}}>
                  💰 Tổng tiền: {calculateQuickPrice(quickBooking.court, quickBooking.hour, quickDuration).toLocaleString()} VNĐ
                  <div style={{fontSize:'13px',fontWeight:'400',color:'#666',marginTop:'4px'}}>
                    Giờ kết thúc: {String(Number(quickBooking.hour)+quickDuration).padStart(2,'0')}:00
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setQuickBooking(null)}>Hủy</button>
                  <button className="btn-confirm" onClick={submitQuickBooking} style={{background:'#00a651',fontWeight:'700'}}>✅ Xác nhận đặt sân</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
            <div><h3>👥 QUẢN LÝ KHÁCH HÀNG</h3><p>Tìm kiếm và xem thống kê khách hàng.</p></div>
            <input type="text" placeholder="Tìm theo tên hoặc email" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #ccc',width:'280px'}} />
          </div>
          <table className="admin-table">
            <thead><tr><th>Khách hàng</th><th>Email</th><th>Đơn đã đặt</th><th>Doanh thu</th><th>Lần đặt gần nhất</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {topCustomers.length > 0 ? topCustomers.map(item => (
                <tr key={getUserId(item.user)}>
                  <td>{getUserName(item.user)}</td>
                  <td>{item.user.email||'—'}</td>
                  <td>{item.totalBookings}</td>
                  <td>{formatMoney(item.totalRevenue)}</td>
                  <td>{formatDateLabel(item.lastBooking)}</td>
                  <td>{getCustomerStatus(item)}</td>
                  <td><button onClick={() => setSelectedCustomer(item.user)} style={{background:'#0d6efd',color:'white',padding:'6px 10px',border:'none',borderRadius:'8px',cursor:'pointer'}}>Xem</button></td>
                </tr>
              )) : <tr><td colSpan="7">Không tìm thấy khách hàng.</td></tr>}
            </tbody>
          </table>
          {selectedCustomerData && (
            <div style={{marginTop:'24px',padding:'20px',borderRadius:'16px',background:'#f8f9fa'}}>
              <h4>Thông tin chi tiết</h4>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginTop:'16px'}}>
                <div><strong>Họ tên:</strong> {getUserName(selectedCustomerData.user)}</div>
                <div><strong>Email:</strong> {selectedCustomerData.user.email||'—'}</div>
                <div><strong>Tổng đơn:</strong> {selectedCustomerData.totalBookings}</div>
                <div><strong>Doanh thu:</strong> {formatMoney(selectedCustomerData.totalRevenue)}</div>
                <div><strong>Lần đặt gần nhất:</strong> {formatDateLabel(selectedCustomerData.lastBooking)}</div>
                <div><strong>Trạng thái:</strong> {getCustomerStatus(selectedCustomerData)}</div>
              </div>
              <div style={{marginTop:'20px'}}>
                <h5>Đơn đặt của khách</h5>
                <table className="admin-table">
                  <thead><tr><th>Ngày</th><th>Giờ</th><th>Sân</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    {selectedCustomerData.bookings.length > 0 ? selectedCustomerData.bookings.map(booking => (
                      <tr key={booking._id||booking.id}><td>{booking.date}</td><td>{booking.hour}:00</td><td>{booking.courtName}</td><td>{formatMoney(booking.total)}</td><td>{booking.status==='approved'?'Đã duyệt':booking.status==='pending'?'Chờ duyệt':'Từ chối'}</td></tr>
                    )) : <tr><td colSpan="5">Chưa có đơn.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal từ chối */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width:'400px'}}>
            <h3>❌ TỪ CHỐI ĐƠN ĐẶT SÂN</h3>
            <p>Khách: <strong>{getCustomerName(showRejectModal)}</strong></p>
            <p>Sân: <strong>{showRejectModal.courtName}</strong> - {showRejectModal.date} {showRejectModal.hour}:00</p>
            <label>Lý do từ chối:</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows="3" style={{width:'100%',margin:'10px 0',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} placeholder="Nhập lý do..." />
            {qrCode && <div><p>📱 Mã QR hoàn tiền:</p><img src={qrCode} alt="QR" style={{width:'120px'}} /></div>}
            <div style={{display:'flex',gap:'10px',marginTop:'15px',justifyContent:'flex-end'}}>
              <button onClick={() => handleReject(showRejectModal)} style={{background:'#dc3545',color:'white',padding:'8px 16px',border:'none',borderRadius:'6px',cursor:'pointer'}}>Xác nhận từ chối</button>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); setQrCode(''); }} style={{background:'#6c757d',color:'white',padding:'8px 16px',border:'none',borderRadius:'6px',cursor:'pointer'}}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showFooterModal && (
        <FooterSettings onClose={() => setShowFooterModal(false)} onSave={(settings) => console.log('Saved', settings)} />
      )}
    </div>
  );
}