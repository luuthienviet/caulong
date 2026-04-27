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
  const [quickDuration, setQuickDuration] = useState(1);
  const [quickStatus, setQuickStatus] = useState('approved');
  const [revenueFilter, setRevenueFilter] = useState('week');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
    if (isNaN(y) || y < 2020 || y > 2030) {
      console.warn('Năm không hợp lệ:', booking.date);
      return new Date();
    }
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

  const getDeposit = (b) => Math.floor((b.total || 0) * 0.5);
  const getRemaining = (b) => (b.total || 0) - getDeposit(b);

  const totalDepositRevenue = bookingRequests.filter(b => b.status === 'approved').reduce((s, b) => s + getDeposit(b), 0);
  const totalRemainingCollected = remainingCollected.reduce((sum, id) => {
    const booking = bookingRequests.find(b => String(b._id || b.id) === String(id));
    return sum + (booking ? getRemaining(booking) : 0);
  }, 0);
  // eslint-disable-next-line
  const totalRevenue = totalDepositRevenue + totalRemainingCollected;
  const pendingRemainingBookings = bookingRequests.filter(b => 
    b.status === 'approved' && isBookingCompleted(b) && !remainingCollected.includes(String(b._id || b.id))
  );
  const pendingCount = bookingRequests.filter(b => b.status === 'pending').length;
  const approvedCount = bookingRequests.filter(b => b.status === 'approved').length;

  const getCustomerName = (booking) => {
    if (booking.userId) {
      if (typeof booking.userId === 'object' && booking.userId.username) return booking.userId.username;
      if (typeof booking.userId === 'string') return booking.userId;
    }
    return booking.customerName || 'Khách';
  };

  const parseBookingDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getUserName = (user) => {
    if (!user) return 'Khách';
    return user.username || user.name || user.email || 'Khách';
  };

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
      if (user.email && b.customerName && b.customerName.toLowerCase() === user.email.toLowerCase()) return true;
      return false;
    });
  };

  const customerData = users.map(user => {
    const bookings = getUserBookings(user);
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    // eslint-disable-next-line
    const totalRevenue = approvedBookings.reduce((sum, b) => sum + (b.total || 0), 0);
    const lastBooking = bookings.reduce((latest, b) => {
      if (!b.date) return latest;
      const date = parseBookingDate(b.date);
      return !latest || date > latest ? date : latest;
    }, null);
    return {
      user,
      bookings,
      approvedBookings,
      totalRevenue,
      totalBookings: bookings.length,
      lastBooking,
    };
  });

  const filteredCustomers = customerData
    .filter(item => {
      const term = customerSearch.trim().toLowerCase();
      if (!term) return true;
      const name = getUserName(item.user).toLowerCase();
      const email = (item.user.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalBookings - a.totalBookings);

  const selectedCustomerData = selectedCustomer ? customerData.find(item => getUserId(item.user) === getUserId(selectedCustomer)) : null;

  const topCustomers = filteredCustomers.slice(0, 10);

  const formatDateLabel = (date) => {
    if (!date) return 'Chưa đặt';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatMoney = (value) => (value || 0).toLocaleString() + ' VNĐ';

  const getCustomerStatus = (item) => {
    if (item.totalBookings === 0) return 'Chưa đặt';
    if (item.totalRevenue === 0) return 'Đang xem';
    return 'Hoạt động';
  };

  const handleSelectCustomer = (user) => {
    setSelectedCustomer(user);
  };

  const getPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') {
      return { start: new Date(end), end: new Date(end) };
    }
    if (filter === 'month') {
      return { start: new Date(end.getFullYear(), end.getMonth(), 1), end: new Date(end) };
    }
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { start, end };
  };

  const formatDayLabel = (date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getRevenueBookings = (filter) => {
    const { start, end } = getPeriodBounds(filter);
    return bookingRequests.filter(b => {
      if (b.status !== 'approved') return false;
      const bookingDate = parseBookingDate(b.date);
      return bookingDate >= start && bookingDate <= end;
    });
  };

  const getPreviousPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') {
      const prev = new Date(end);
      prev.setDate(prev.getDate() - 1);
      return { start: new Date(prev), end: new Date(prev) };
    }
    if (filter === 'month') {
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const prevEnd = new Date(end.getFullYear(), end.getMonth(), 0);
      return { start, end: prevEnd };
    }
    const start = new Date(end);
    start.setDate(start.getDate() - 13);
    const middle = new Date(end);
    middle.setDate(middle.getDate() - 7);
    return { start, end: middle };
  };

  const getRevenueTotal = (bookings) => bookings.reduce((sum, b) => sum + (b.total || 0), 0);

  const currentPeriodBookings = getRevenueBookings(revenueFilter);
  const previousPeriodBookings = bookingRequests.filter(b => {
    if (b.status !== 'approved') return false;
    const bookingDate = parseBookingDate(b.date);
    const { start, end } = getPreviousPeriodBounds(revenueFilter);
    return bookingDate >= start && bookingDate <= end;
  });
  const revenueCurrent = getRevenueTotal(currentPeriodBookings);
  const revenuePrevious = getRevenueTotal(previousPeriodBookings);
  const growthPct = revenuePrevious === 0 ? (revenueCurrent === 0 ? 0 : 100) : Math.round(((revenueCurrent - revenuePrevious) / revenuePrevious) * 100);
  const growthLabel = revenueCurrent >= revenuePrevious ? `+${growthPct}%` : `${growthPct}%`;
  const growthColor = revenueCurrent >= revenuePrevious ? '#198754' : '#dc3545';

  const chartDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayLabel = formatDayLabel(date);
    const amount = getRevenueTotal(bookingRequests.filter(b => b.status === 'approved' && parseBookingDate(b.date).getTime() === date.getTime()));
    return { dayLabel, amount };
  });
  const lineMax = Math.max(1, ...chartDates.map(item => item.amount));
  const linePoints = chartDates.map((item, index) => {
    const x = 20 + index * 80;
    const y = 140 - Math.round((item.amount / lineMax) * 120);
    return `${x},${y}`;
  }).join(' ');

  const courtRevenueData = safeCourts.map(court => ({
    court,
    value: getRevenueTotal(currentPeriodBookings.filter(b => String(b.courtId) === String(court.id || court._id)))
  }));
  const maxCourtRevenue = Math.max(1, ...courtRevenueData.map(item => item.value));

  const peakRevenue = getRevenueTotal(currentPeriodBookings.filter(b => {
    const hour = Number(b.hour);
    return hour >= 17 && hour <= 21;
  }));
  const offPeakRevenue = getRevenueTotal(currentPeriodBookings.filter(b => {
    const hour = Number(b.hour);
    return hour < 17 || hour > 21;
  }));
  const totalPeak = peakRevenue + offPeakRevenue || 1;
  const peakPercent = Math.round((peakRevenue / totalPeak) * 100);
  const offPeakPercent = 100 - peakPercent;

  const scheduleHours = Array.from({ length: 17 }, (_, index) => 5 + index);
  const scheduleBookings = bookingRequests.filter(b => b.date === selectedDate);
  const getSlotBooking = (court, hour) => {
    return scheduleBookings.find(b => String(b.courtId) === String(court.id || court._id) && String(b.hour) === String(hour));
  };
  const getSlotClass = (booking) => {
    if (!booking) return 'slot-free';
    if (booking.status === 'pending') return 'slot-pending';
    if (booking.status === 'approved') {
      return isBookingCompleted(booking) ? 'slot-completed' : 'slot-approved';
    }
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
    const hourNumber = Number(hour);
    let pricePerHour = court.price || 0;
    if (hourNumber >= 17) pricePerHour = Math.floor(pricePerHour * 1.3);
    return pricePerHour * duration;
  };
  const canBookDuration = (court, hour, duration) => {
    const start = Number(hour);
    for (let step = 0; step < duration; step += 1) {
      const targetHour = String(start + step).padStart(2, '0');
      const existing = bookingRequests.find(b => String(b.courtId) === String(court.id || court._id) && b.date === selectedDate && String(b.hour) === String(targetHour) && b.status === 'approved');
      if (existing) return false;
    }
    return true;
  };
  const handleEmptySlotClick = (court, hour) => {
    setQuickBooking({ court, hour: String(hour).padStart(2, '0'), date: selectedDate });
    setQuickCustomerName('');
    setQuickDuration(1);
    setQuickStatus('approved');
    setDetailBooking(null);
  };
  const handleBookedSlotClick = (booking) => {
    setDetailBooking(booking);
    setQuickBooking(null);
  };
  const submitQuickBooking = async () => {
    if (!quickBooking) return;
    if (!quickCustomerName.trim()) {
      return alert('Nhập tên khách hàng');
    }
    if (!canBookDuration(quickBooking.court, quickBooking.hour, quickDuration)) {
      return alert('Khung giờ này đã trùng lặp với đơn đã duyệt');
    }
    const total = calculateQuickPrice(quickBooking.court, quickBooking.hour, quickDuration);
    try {
      await API.post('/bookings', {
        courtId: quickBooking.court.id,
        courtName: quickBooking.court.name,
        date: quickBooking.date,
        hour: quickBooking.hour,
        duration: quickDuration,
        total,
        status: quickStatus
      });
      alert('Đặt sân nhanh thành công');
      setQuickBooking(null);
      refreshBookings && refreshBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Đặt sân nhanh thất bại');
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
    try {
      await approveBooking(id);
    } catch (e) {
      alert("Lỗi duyệt!");
    }
    setLoading(false);
  };

  const handleReject = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!rejectReason.trim()) {
      alert('Nhập lý do từ chối');
      return;
    }
    setLoading(true);
    try {
      const fakeQR = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=REFUND_${id}_${booking.total}`;
      setQrCode(fakeQR);
      alert(`Đã từ chối!\nMã QR hoàn tiền:\n${fakeQR}`);
      await rejectBooking(id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      setQrCode('');
    } catch (e) {
      alert("Lỗi từ chối!");
    }
    setLoading(false);
  };

  const handleDelete = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!window.confirm('Xóa đơn này?')) return;
    setLoading(true);
    try {
      await deleteBooking(id);
    } catch (e) {
      alert("Lỗi xóa!");
    }
    setLoading(false);
  };

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.price) {
      alert('Nhập đủ thông tin sân');
      return;
    }
    setLoading(true);
    try {
      const courtData = {
        name: newCourt.name,
        price: newCourt.price,
        description: newCourt.desc,
        image: newCourt.image,
        status: 'Trống'
      };
      await API.post('/courts', courtData);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setNewCourt({ name: '', price: 0, desc: '', image: '' });
      alert('Thêm sân thành công!');
    } catch (error) {
      console.error('Lỗi thêm sân:', error);
      alert('Thêm sân thất bại!');
    }
    setLoading(false);
  };

  const handleUpdateCourt = async () => {
    if (!editingCourt) return;
    setLoading(true);
    try {
      const courtData = {
        name: editingCourt.name,
        price: editingCourt.price,
        description: editingCourt.desc,
        image: editingCourt.image,
        status: editingCourt.status
      };
      await API.put(`/courts/${editingCourt.id}`, courtData);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setEditingCourt(null);
      alert('Cập nhật sân thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật sân:', error);
      alert(error.response?.data?.message || 'Cập nhật sân thất bại!');
    }
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
    } catch (error) {
      console.error('Lỗi xóa sân:', error);
      alert('Xóa sân thất bại!');
    }
    setLoading(false);
  };

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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button onClick={() => setActiveTab('revenue')} style={{ padding: '10px 20px', background: activeTab === 'revenue' ? '#00a651' : 'transparent', color: activeTab === 'revenue' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>💰 DOANH THU</button>
        <button onClick={() => setActiveTab('courts')} style={{ padding: '10px 20px', background: activeTab === 'courts' ? '#00a651' : 'transparent', color: activeTab === 'courts' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>🏸 QUẢN LÝ SÂN</button>
        <button onClick={() => setActiveTab('bookings')} style={{ padding: '10px 20px', background: activeTab === 'bookings' ? '#00a651' : 'transparent', color: activeTab === 'bookings' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>📋 LỊCH ĐẶT SÂN</button>
        <button onClick={() => setActiveTab('customers')} style={{ padding: '10px 20px', background: activeTab === 'customers' ? '#00a651' : 'transparent', color: activeTab === 'customers' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>👥 KHÁCH HÀNG</button>
      </div>

      {activeTab === 'revenue' && (
        <div>
          <div className="revenue-filter-bar">
            <div>
              <h3>📈 Phân tích doanh thu</h3>
              <p>Hiển thị dữ liệu theo bộ lọc và so sánh với kỳ trước.</p>
            </div>
            <div className="revenue-filter-buttons">
              {['today', 'week', 'month'].map(option => (
                <button
                  key={option}
                  className={revenueFilter === option ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setRevenueFilter(option)}
                >
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
                  {chartDates.map((item, index) => {
                    const x = 20 + index * 80;
                    const y = 140 - Math.round((item.amount / lineMax) * 120);
                    return (
                      <g key={item.dayLabel}>
                        <circle cx={x} cy={y} r="5" fill="#0d6efd" />
                        <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fill="#212529">{item.amount.toLocaleString()}</text>
                        <text x={x} y="165" textAnchor="middle" fontSize="12" fill="#6c757d">{item.dayLabel}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="chart-card">
              <h4>Doanh thu theo sân</h4>
              <div className="bar-chart">
                {courtRevenueData.map(item => (
                  <div key={item.court.id} className="bar-row">
                    <div className="bar-label">{item.court.name}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.round((item.value / maxCourtRevenue) * 100)}%` }} />
                    </div>
                    <div className="bar-value">{item.value.toLocaleString()} VNĐ</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h4>Tỷ lệ giờ cao điểm vs thấp điểm</h4>
              <div className="pie-chart">
                <svg viewBox="0 0 160 160" className="pie-svg">
                  <circle cx="80" cy="80" r="60" fill="#f8d7da" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#0d6efd" strokeWidth="120" strokeDasharray={`${peakPercent} ${100 - peakPercent}`} strokeDashoffset="25" transform="rotate(-90 80 80)" />
                </svg>
                <div className="pie-legend">
                  <div><span className="legend-dot" style={{ background: '#0d6efd' }}></span> Cao điểm {peakPercent}%</div>
                  <div><span className="legend-dot" style={{ background: '#f8d7da' }}></span> Thấp điểm {offPeakPercent}%</div>
                </div>
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
                return (
                  <tr key={b._id || b.id}>
                    <td>{getCustomerName(b)}</td>
                    <td>{b.courtName}</td>
                    <td>{b.date}</td>
                    <td>{b.hour}:00</td>
                    <td>{(b.total || 0).toLocaleString()} VNĐ</td>
                    <td>{getDeposit(b).toLocaleString()} VNĐ</td>
                    <td>{getRemaining(b).toLocaleString()} VNĐ</td>
                    <td style={{ color: !completed ? 'blue' : (paid ? 'green' : 'orange') }}>
                      {!completed ? '🟢 Đang hoạt động' : (paid ? '✅ Đã hoàn thành' : '💰 Chờ thanh toán')}
                    </td>
                    <td>{!completed ? getRemainingTime(b) : 'Đã kết thúc'}</td>
                  </tr>
                );
              })}
              {!bookingRequests.some(b => b.status === 'approved') && (
                <tr><td colSpan="9">Chưa có đơn duyệt</td></tr>
              )}
            </tbody>
          </table>
          <h3>💸 Chờ thu tiền còn lại</h3>
          {pendingRemainingBookings.length === 0 ? <p>Không có đơn nào.</p> : (
            <table className="admin-table">
              <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ kết thúc</th><th>Tiền còn lại</th><th>Hành động</th></tr></thead>
              <tbody>
                {pendingRemainingBookings.map(b => (
                  <tr key={b._id || b.id}>
                    <td>{getCustomerName(b)}</td>
                    <td>{b.courtName}</td>
                    <td>{b.date}</td>
                    <td>{getBookingEndTime(b).toLocaleTimeString()}</td>
                    <td>{getRemaining(b).toLocaleString()} VNĐ</td>
                    <td><button onClick={() => handleConfirmRemaining(b)} className="btn-confirm">Xác nhận đã thu</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'customers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>👥 QUẢN LÝ KHÁCH HÀNG</h3>
              <p>Tìm kiếm và xem thống kê khách hàng theo đơn đặt sân.</p>
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #ccc', width: '280px' }}
            />
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Đơn đã đặt</th>
                <th>Doanh thu</th>
                <th>Lần đặt gần nhất</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length > 0 ? topCustomers.map(item => (
                <tr key={getUserId(item.user)}>
                  <td>{getUserName(item.user)}</td>
                  <td>{item.user.email || '—'}</td>
                  <td>{item.totalBookings}</td>
                  <td>{formatMoney(item.totalRevenue)}</td>
                  <td>{formatDateLabel(item.lastBooking)}</td>
                  <td>{getCustomerStatus(item)}</td>
                  <td>
                    <button
                      onClick={() => handleSelectCustomer(item.user)}
                      style={{ background: '#0d6efd', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >Xem</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7">Không tìm thấy khách hàng phù hợp.</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '24px' }}>
            {selectedCustomerData ? (
              <div style={{ padding: '20px', borderRadius: '16px', background: '#f8f9fa' }}>
                <h4>Thông tin chi tiết khách hàng</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div><strong>Họ tên:</strong> {getUserName(selectedCustomerData.user)}</div>
                  <div><strong>Email:</strong> {selectedCustomerData.user.email || '—'}</div>
                  <div><strong>Tổng đơn:</strong> {selectedCustomerData.totalBookings}</div>
                  <div><strong>Doanh thu:</strong> {formatMoney(selectedCustomerData.totalRevenue)}</div>
                  <div><strong>Lần đặt gần nhất:</strong> {formatDateLabel(selectedCustomerData.lastBooking)}</div>
                  <div><strong>Trạng thái:</strong> {getCustomerStatus(selectedCustomerData)}</div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h5>Đơn đặt của khách</h5>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Ngày</th><th>Giờ</th><th>Sân</th><th>Tổng</th><th>Trạng thái</th></tr>
                    </thead>
                    <tbody>
                      {selectedCustomerData.bookings.length > 0 ? selectedCustomerData.bookings.map(booking => (
                        <tr key={booking._id || booking.id}>
                          <td>{booking.date}</td>
                          <td>{booking.hour}:00</td>
                          <td>{booking.courtName}</td>
                          <td>{formatMoney(booking.total)}</td>
                          <td>{booking.status === 'approved' ? 'Đã duyệt' : booking.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5">Chưa có đơn đặt.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>Chọn khách hàng để xem chi tiết.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'courts' && (
        <div>
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3>➕ THÊM SÂN MỚI</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Tên sân" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })} />
              <input type="number" placeholder="Giá / giờ" value={newCourt.price} onChange={e => setNewCourt({ ...newCourt, price: parseInt(e.target.value) })} />
              <input type="text" placeholder="Mô tả" value={newCourt.desc} onChange={e => setNewCourt({ ...newCourt, desc: e.target.value })} />
              <input type="text" placeholder="URL hình ảnh" value={newCourt.image} onChange={e => setNewCourt({ ...newCourt, image: e.target.value })} />
            </div>
            <button onClick={handleAddCourt} style={{ marginTop: '15px', background: '#00a651', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>THÊM SÂN</button>
          </div>
          <h3>✏️ DANH SÁCH SÂN HIỆN CÓ</h3>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Tên sân</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {safeCourts.length > 0 ? (
                safeCourts.map(court => (
                  <tr key={court.id}>
                    <td>{court.id}</td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <input value={editingCourt.name || ''} onChange={e => setEditingCourt({ ...editingCourt, name: e.target.value })} />
                      ) : (
                        court.name || 'N/A'
                      )}
                    </td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <input type="number" value={editingCourt.price || 0} onChange={e => setEditingCourt({ ...editingCourt, price: parseInt(e.target.value) })} />
                      ) : (
                        (court.price || 0).toLocaleString() + ' VNĐ'
                      )}
                    </td>
                    <td>{court.status || 'Trống'}</td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <>
                          <button onClick={handleUpdateCourt} style={{ background: '#28a745', color: 'white', marginRight: '5px' }}>Lưu</button>
                          <button onClick={() => setEditingCourt(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingCourt(court)} style={{ background: '#ffc107', marginRight: '5px' }}>Sửa</button>
                          <button onClick={() => handleDeleteCourt(court.id)} style={{ background: '#dc3545', color: 'white' }}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">Chưa có sân nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="schedule-section">
          <div className="schedule-header">
            <div>
              <h3>📋 LỊCH ĐẶT SÂN</h3>
              <p>Chọn ngày để xem lịch của các sân và đặt nhanh cho admin.</p>
            </div>
            <div className="date-picker">
              <label>Chọn ngày</label>
              <input
                type="date"
                value={selectedDate}
                min={currentDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="schedule-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: '#dff7e0' }}></span>Còn trống</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#f8d7da' }}></span>Đã đặt & duyệt</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#fff5cc' }}></span>Chờ duyệt</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#e2e3e5' }}></span>Đã hoàn thành / Kết thúc</div>
          </div>

          {safeCourts.length === 0 ? (
            <p>Không có sân để hiển thị lịch.</p>
          ) : (
            <div className="schedule-grid" style={{ gridTemplateColumns: `160px repeat(${safeCourts.length}, minmax(140px, 1fr))` }}>
              <div className="schedule-court-header schedule-corner">Giờ / Sân</div>
              {safeCourts.map(court => (
                <div key={court.id} className="schedule-court-header">{court.name}</div>
              ))}

              {scheduleHours.map(hour => (
                <React.Fragment key={hour}>
                  <div className="schedule-time-cell">{String(hour).padStart(2, '0')}:00</div>
                  {safeCourts.map(court => {
                    const booking = getSlotBooking(court, String(hour).padStart(2, '0'));
                    return (
                      <button
                        type="button"
                        key={`${court.id}-${hour}`}
                        className={`slot-cell ${getSlotClass(booking)}`}
                        onClick={() => booking ? handleBookedSlotClick(booking) : handleEmptySlotClick(court, hour)}
                      >
                        <span>{getSlotLabel(booking)}</span>
                        {booking && <span className="slot-subtext">{booking.courtName}</span>}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}

          {detailBooking && (
            <div className="modal-overlay">
              <div className="modal-box admin-schedule-modal">
                <h3>Chi tiết đơn đặt sân</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div><strong>Sân:</strong> {detailBooking.courtName}</div>
                  <div><strong>Ngày:</strong> {detailBooking.date}</div>
                  <div><strong>Giờ:</strong> {detailBooking.hour}:00</div>
                  <div><strong>Thời lượng:</strong> {detailBooking.duration || 1} giờ</div>
                  <div><strong>Khách hàng:</strong> {getCustomerName(detailBooking)}</div>
                  <div><strong>Trạng thái:</strong> {detailBooking.status === 'approved' ? 'Đã duyệt' : detailBooking.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}</div>
                </div>
                <div className="total-box">Tổng tiền: <strong>{(detailBooking.total || 0).toLocaleString()} VNĐ</strong></div>
                {detailBooking.paymentImage && (
                  <div style={{ marginTop: '12px' }}>
                    <strong>Ảnh cọc:</strong>
                    <img src={detailBooking.paymentImage} alt="payment" style={{ width: '100%', borderRadius: '12px', marginTop: '8px' }} />
                  </div>
                )}
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setDetailBooking(null)}>Đóng</button>
                </div>
              </div>
            </div>
          )}

          {quickBooking && (
            <div className="modal-overlay">
              <div className="modal-box admin-schedule-modal">
                <h3>Đặt sân nhanh</h3>
                <p>Hãy điền thông tin để tạo đơn mới ngay cho slot trống.</p>
                <div className="form-group">
                  <label>Sân</label>
                  <input type="text" value={quickBooking.court.name} disabled />
                </div>
                <div className="form-group">
                  <label>Ngày</label>
                  <input type="text" value={quickBooking.date} disabled />
                </div>
                <div className="form-group">
                  <label>Giờ</label>
                  <input type="text" value={`${quickBooking.hour}:00`} disabled />
                </div>
                <div className="form-group">
                  <label>Tên khách hàng</label>
                  <input value={quickCustomerName} onChange={e => setQuickCustomerName(e.target.value)} placeholder="Nhập tên khách" />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label>Số giờ</label>
                    <input type="number" min="1" max="5" value={quickDuration} onChange={e => setQuickDuration(Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                  <div>
                    <label>Trạng thái</label>
                    <select value={quickStatus} onChange={e => setQuickStatus(e.target.value)}>
                      <option value="approved">Đã duyệt</option>
                      <option value="pending">Chờ duyệt</option>
                    </select>
                  </div>
                </div>
                <div className="total-box">Tổng tiền: <strong>{calculateQuickPrice(quickBooking.court, quickBooking.hour, quickDuration).toLocaleString()} VNĐ</strong></div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setQuickBooking(null)}>Hủy</button>
                  <button className="btn-confirm" onClick={submitQuickBooking}>Đặt nhanh</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '400px' }}>
            <h3>❌ TỪ CHỐI ĐƠN ĐẶT SÂN</h3>
            <p>Khách: <strong>{getCustomerName(showRejectModal)}</strong></p>
            <p>Sân: <strong>{showRejectModal.courtName}</strong> - {showRejectModal.date} {showRejectModal.hour}:00</p>
            <label>Lý do từ chối:</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows="3" style={{ width: '100%', margin: '10px 0', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Nhập lý do..." />
            {qrCode && <div><p>📱 Mã QR hoàn tiền:</p><img src={qrCode} alt="QR" style={{ width: '120px' }} /></div>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
              <button onClick={() => handleReject(showRejectModal)} style={{ background: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Xác nhận từ chối</button>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); setQrCode(''); }} style={{ background: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
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