import { useState, useEffect, useContext } from 'react';
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthContext } from './AuthContext';
import CourtCard from "./components/CourtCard";
import CourtDetail from "./components/CourtDetail";
import BookingModal from "./components/BookingModal";
import SuccessPopup from "./components/SuccessPopup";
import BookingHistory from "./components/BookingHistory";
import ScheduleViewer from "./components/ScheduleViewer";
import AdminDashboard from "./components/AdminDashboard";
import API from './api';
import './App.css';
import NotificationsPage from "./components/NotificationsPage";
import OrderLookupPage from "./components/OrderLookupPage";
import CourtEditModal from "./components/CourtEditModal";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import FavoritesPage from "./components/FavoritesPage";
import MapPage from "./components/MapPage";
import PaymentPage from "./components/PaymentPage";

const defaultCourts = [
  { id: 1, name: "SÂN SỐ 01 - VIP", price: 200000, desc: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", status: "Trống", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png" },
  { id: 2, name: "SÂN SỐ 02 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", status: "Trống", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg" },
  { id: 3, name: "SÂN SỐ 03 - THƯỜNG", price: 100000, desc: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", status: "Trống", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg" },
  { id: 4, name: "SÂN SỐ 04 - VIP", price: 200000, desc: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", status: "Trống", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg" }
];

const formatCourtData = (items) => {
  const source = Array.isArray(items) ? items : [];
  const uniqueMap = new Map();
  const formattedSource = source
    .filter(c => c && typeof c === 'object')
    .map(c => ({
      id: c._id || c.id,
      name: c.name,
      price: c.price,
      desc: c.description || c.desc,
      status: c.status,
      image: c.image
    }))
    .filter((court) => {
      const key = court.id || court.name;
      if (uniqueMap.has(key)) return false;
      uniqueMap.set(key, true);
      return true;
    });

  const sourceByName = new Map(formattedSource.map(court => [court.name, court]));
  const sortedDefault = defaultCourts.map(defaultCourt => ({
    ...defaultCourt,
    ...sourceByName.get(defaultCourt.name)
  }));

  const extras = formattedSource
    .filter(court => !sourceByName.has(court.name))
    .sort((a, b) => {
      const extractNumber = (text) => {
        const match = String(text || '').match(/(\d+)/);
        return match ? Number(match[1]) : 0;
      };
      return extractNumber(a.name) - extractNumber(b.name);
    });

  return [...sortedDefault, ...extras];
};

function App() {
  // === STATES ===
  const [page, setPage] = useState('home');
  const [courts, setCourts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentProof, setPaymentProof] = useState({});
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [duration, setDuration] = useState(1);
  const [showDepositStep, setShowDepositStep] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const { user, login, logout } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [notifications, setNotifications] = useState([]); // chỉ dùng cho admin
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // eslint-disable-next-line
  const [, setTotalRevenue] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]); // dành cho khách hàng
  const [footerSettings, setFooterSettings] = useState({
    address: "704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam",
    hotline: "0339 310 915",
    email: "kontumbadminton@gmail.com",
    hours: "05:00 - 22:00 (Tất cả các ngày trong tuần)"
  });

  // Banner data
  const bannerData = [
    { image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070", title: "NÂNG TẦM <span style='color: #fdb913;'>TRẢI NGHIỆM</span>", desc: "Hệ thống sân bãi đạt chuẩn thi đấu quốc tế BWF." },
    { image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=2070", title: "SÂN CHƠI <span style='color: #fdb913;'>ĐẲNG CẤP</span>", desc: "Ánh sáng chống chói, thảm Yonex cao cấp bảo vệ khớp gối." },
    { image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2070", title: "DỊCH VỤ <span style='color: #fdb913;'>CHUYÊN NGHIỆP</span>", desc: "Đặt sân trực tuyến dễ dàng, phục vụ 24/7." }
  ];

  // === KHỞI TẠO SÂN TỪ API, FALLBACK NẾU CẦN ===

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await API.get('/courts');
        console.log('Dữ liệu sân từ API:', res.data);
        const rawCourts = res.data.data ?? res.data;
        const formattedCourts = formatCourtData(rawCourts);
        setCourts(formattedCourts.length > 0 ? formattedCourts : defaultCourts);
      } catch (err) {
        console.error('Lỗi lấy sân từ API:', err);
        setCourts(defaultCourts);
      }
    };
    fetchCourts();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/')[2];
      setResetToken(token);
      setPage('reset');
    }
  }, []);

  const goToPayment = (data) => {
    setSelectedCourt(null);
    setSelectedDate('');
    setSelectedHour('');
    setDuration(1);
    setShowDepositStep(false);
    setPaymentData(data);
    setPage('payment');
  };

  const isAdmin = Boolean(user?.role === 'admin');
  const isUser = Boolean(user?.role === 'user');

  const headerItems = [
    { label: '🏠 TRANG CHỦ', page: 'home', visible: true },
    { label: '🔎 TRA CỨU ĐƠN', page: 'order-lookup', visible: true },
    { label: '📋 LỊCH ĐẶT SÂN', page: 'my-bookings', visible: !isAdmin },
    { label: '🗺️ BẢN ĐỒ', page: 'map', visible: true },
    { label: '📞 LIÊN HỆ', page: 'contact', visible: !isAdmin },
    { label: '👑 QUẢN TRỊ', page: 'admin', visible: isAdmin, className: 'admin-link' },
  ];

  const handleLogoClick = () => {
    if (isAdmin) {
      handleOpenAdminProfile();
      return;
    }
    setPage('home');
  };

  const fetchUserNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setUserNotifications(res.data.data);
    } catch (err) {
      console.error('Lỗi lấy thông báo:', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('footerSettings');
    if (saved) {
      setFooterSettings(JSON.parse(saved));
    }
  }, []);

  const markNotificationAsRead = async (id) => {
    if (!id) return;
    const isLocal = String(id).startsWith('local-');
    if (!isLocal) {
      try {
        await API.put(`/notifications/${id}/read`);
      } catch (err) {
        console.error(err);
      }
    }
    setUserNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    const unreadIds = userNotifications.filter(n => !n.read).map(n => n._id || n.id);
    const serverIds = unreadIds.filter(id => !String(id).startsWith('local-'));
    try {
      await Promise.all(serverIds.map(id => API.put(`/notifications/${id}/read`)));
    } catch (err) {
      console.error('Không thể đánh dấu tất cả đã đọc:', err);
    }
    setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const pushUserNotification = ({ message, type = 'booking_created', bookingId = null }) => {
    const timestamp = Date.now();
    const newNoti = {
      _id: `local-${timestamp}`,
      id: timestamp,
      bookingId,
      type,
      message,
      read: false,
      time: new Date().toLocaleString(),
      createdAt: new Date().toISOString()
    };
    setUserNotifications(prev => [newNoti, ...prev]);
  };

  const hasUserNotification = (bookingId, type, messageMatch) => {
    return userNotifications.some(n => {
      const sameBooking = bookingId ? String(n.bookingId) === String(bookingId) : true;
      const sameType = type ? n.type === type : true;
      const sameMessage = messageMatch ? n.message.includes(messageMatch) : true;
      return sameBooking && sameType && sameMessage;
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;
    await markNotificationAsRead(notification._id || notification.id);
    setShowNotification(false);
    if (notification.bookingId) {
      setSelectedBookingId(notification.bookingId);
      setPage('my-bookings');
    } else {
      setPage('notifications');
    }
  };

  const handleOpenAdminProfile = () => {
    if (!user) return;
    setAdminDisplayName(user.name || user.username || '');
    setAdminEmail(user.email || '');
    setShowAdminProfile(true);
  };

  const handleOpenUserProfile = () => {
    if (!user) return;
    setUserDisplayName(user.name || user.username || '');
    setUserEmail(user.email || '');
    setUserPhone(user.phone || '');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowUserProfile(true);
  };

  const handleUserAvatarUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      localStorage.setItem('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isValidVietnamPhone = (phone) => {
    return /^0(3|5|7|8|9)\d{8}$/.test(phone);
  };

  const handleUserProfileSave = async () => {
    if (!user) return;
    if (!userDisplayName || userDisplayName.trim().length === 0) {
      return alert('Vui lòng nhập tên hiển thị hợp lệ');
    }
    if (userPhone && !isValidVietnamPhone(userPhone)) {
      return alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 số, bắt đầu bằng 03/05/07/08/09');
    }
    try {
      const updatedProfile = { name: userDisplayName, email: userEmail, phone: userPhone };
      const res = await API.put('/auth/profile', updatedProfile);
      const updatedUser = { ...user, name: res.data.user.name || userDisplayName, email: res.data.user.email || userEmail, phone: res.data.user.phone || userPhone };
      login(updatedUser);
      setShowUserProfile(false);
      setShowChangePassword(false);
      alert('Cập nhật thông tin khách hàng thành công!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert('Vui lòng nhập đầy đủ các trường mật khẩu');
    }
    if (newPassword !== confirmPassword) {
      return alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }
    try {
      await API.put('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const handleAdminProfileSave = () => {
    if (!user) return;
    const updatedUser = { ...user, name: adminDisplayName, email: adminEmail };
    login(updatedUser);
    setShowAdminProfile(false);
    alert('Cập nhật thông tin quản trị viên thành công!');
  };

  const handleLogout = () => {
    logout();
    setAvatar(null);
    setShowUserMenu(false);
    setShowNotification(false);
    setShowUserProfile(false);
    setShowAdminProfile(false);
    setShowChangePassword(false);
    setShowLoginNotice(false);
    setSelectedBookingId(null);
    setShowCourtModal(false);
    setEditingCourt(null);
    setPage('home');
    setNotifications([]);
    setUserNotifications([]);
  };

  const handleAdminLogout = handleLogout;
  const handleUserLogout = handleLogout;

  // === HÀM LƯU SÂN (THÊM/SỬA) ===
  const handleSaveCourt = async (updatedCourt) => {
    try {
      const courtData = {
        name: updatedCourt.name,
        price: updatedCourt.price,
        description: updatedCourt.desc,
        image: updatedCourt.image,
        status: updatedCourt.status
      };
      if (updatedCourt.id) {
        await API.put(`/courts/${updatedCourt.id}`, courtData);
      } else {
        await API.post('/courts', courtData);
      }
      const res = await API.get('/courts');
      const validCourts = formatCourtData(res.data.data ?? res.data);
      setCourts(validCourts);
      setShowCourtModal(false);
      setEditingCourt(null);
      alert('Cập nhật sân thành công!');
    } catch (error) {
      console.error('Lỗi lưu sân:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sân!');
    }
  };

  const clearAllNotifications = async () => {
    const serverIds = userNotifications.filter(n => !(String(n._id || n.id).startsWith('local-'))).map(n => n._id || n.id);
    try {
      await Promise.all(serverIds.map(id => API.delete(`/notifications/${id}`)));
    } catch (err) {
      console.error('Không thể xóa tất cả thông báo:', err);
    }
    setUserNotifications([]);
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setUserNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleOpenEditCourt = (court) => {
    setEditingCourt(court);
    setShowCourtModal(true);
  };

  const handleAddNewCourt = () => {
    setEditingCourt(null);
    setShowCourtModal(true);
  };

  // === API CALLS ===
  const fetchAllBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookingRequests(res.data.data);
      const revenue = res.data.data.filter(b => b.status === 'approved').reduce((sum, b) => sum + (b.total || 0), 0);
      // eslint-disable-next-line
      setTotalRevenue(revenue);
    } catch (err) {
      console.error('Lỗi lấy tất cả booking:', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await API.get('/bookings/my-bookings');
      setBookingRequests(res.data.data);
    } catch (err) {
      console.error('Lỗi lấy lịch sử:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách người dùng:', err);
    }
  };

  const submitBookingRequest = async (booking) => {
    try {
      const res = await API.post('/bookings', booking);
      console.log('Đặt sân thành công:', res.data);
      if (user?.role === 'admin') fetchAllBookings();
      else fetchMyBookings();
      setShowSuccessPopup(true);
      const adminMessage = `🆕 Khách hàng ${user?.name || user?.username} vừa đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 (chờ duyệt)`;
      addNotification(adminMessage);
      console.log('🔔 Đã thêm thông báo:', adminMessage);
    } catch (err) {
      console.error('Lỗi đặt sân:', err);
      alert(err.response?.data?.message || 'Đặt sân thất bại');
    }
  };

  const approveBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'approved' });
      await fetchAllBookings();
      const booking = bookingRequests.find(b => b._id === id || b.id === id);
      if (booking) {
        const customerName = booking.userId?.username || booking.customerName || 'Khách hàng';
        addNotification(`✅ Đã duyệt đơn đặt sân của ${customerName} - Sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00`);
        // Cập nhật trạng thái sân thành "Đang sử dụng"
        setCourts(prevCourts => prevCourts.map(court =>
          court.id === booking.courtId ? { ...court, status: "Đang sử dụng" } : court
        ));
      } else {
        addNotification(`✅ Đã duyệt một đơn đặt sân thành công`);
      }
    } catch (err) {
      console.error('Lỗi duyệt:', err);
      alert('Duyệt thất bại!');
    }
  };

  const rejectBooking = async (id, reason) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'rejected' });
      await fetchAllBookings();
      const booking = bookingRequests.find(b => b._id === id || b.id === id);
      if (booking) {
        const customerName = booking.userId?.username || booking.customerName || 'Khách hàng';
        addNotification(`❌ Đã từ chối đơn đặt sân của ${customerName} - Sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00. Lý do: ${reason || 'Không rõ'}`);
      } else {
        addNotification(`❌ Đã từ chối một đơn đặt sân`);
      }
    } catch (err) {
      console.error('Lỗi từ chối:', err);
      alert('Từ chối thất bại!');
    }
  };

  const cancelBooking = async (id) => {
    try {
      await API.delete(`/bookings/${id}`);
      if (user?.role === 'admin') await fetchAllBookings();
      else await fetchMyBookings();
    } catch (err) {
      console.error('Lỗi hủy:', err);
    }
  };

  const clearOldBookings = () => {
    fetchAllBookings();
  };

  const calculatePrice = (court, hour, duration = 1) => {
    if (!court || !hour) return 0;
    const h = Number(hour);
    let pricePerHour = court.price;
    if (h >= 17) pricePerHour = Math.floor(court.price * 1.3);
    return pricePerHour * duration;
  };

  const getUserBookings = () => {
    if (!user || user?.role !== 'user') return [];
    return bookingRequests.filter(req => {
      const bookingUserId = req.userId?._id || req.userId;
      const currentUserId = user?.id || user?._id;
      return String(bookingUserId) === String(currentUserId);
    });
  };

  const profileUser = user;
  const isAuthenticated = Boolean(profileUser);
  const userBookings = getUserBookings();
  const successfulBookings = userBookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').length;
  const bookingCount = successfulBookings;
  const getRankInfo = (count) => {
    if (count >= 20) return { name: 'Kim Cương', emoji: '💎', color: 'linear-gradient(135deg, #22d3ee, #0ea5e9)', nextLabel: null, nextTarget: null, label: 'Kim Cương' };
    if (count >= 10) return { name: 'VIP', emoji: '🥇', color: 'linear-gradient(135deg, #fbbf24, #f59e0b)', nextLabel: 'Kim Cương', nextTarget: 20, label: 'VIP' };
    if (count >= 5) return { name: 'Thân thiết', emoji: '🥈', color: 'linear-gradient(135deg, #cbd5e1, #94a3b8)', nextLabel: 'VIP', nextTarget: 10, label: 'Thân Thiết' };
    return { name: 'Mới', emoji: '🥉', color: 'linear-gradient(135deg, #6b7280, #4b5563)', nextLabel: 'Thân thiết', nextTarget: 5, label: 'Mới' };
  };
  const rankInfo = getRankInfo(bookingCount);
  const rankText = rankInfo.label;
  const avatarLetter = profileUser?.name ? profileUser.name.trim().charAt(0).toUpperCase() : (profileUser?.username ? profileUser.username.charAt(0).toUpperCase() : 'U');
  const rawName = profileUser?.name || profileUser?.username || 'Khách hàng';
  const shortName = rawName.length > 10 ? `${rawName.slice(0, 7)}...` : rawName;
  const phoneNumberLabel = profileUser?.phone || '';
  const hasPhone = Boolean(profileUser?.phone);
  const nextTarget = rankInfo.nextTarget;
  const progressValue = nextTarget ? Math.min(100, Math.round((bookingCount / nextTarget) * 100)) : 100;
  const nextRankText = nextTarget ? `Còn ${Math.max(0, nextTarget - bookingCount)} lần nữa lên ${rankInfo.nextLabel} ${rankInfo.nextLabel === 'VIP' ? '🥇' : rankInfo.nextLabel === 'Kim Cương' ? '💎' : '🥈'}` : 'Bạn đang ở hạng cao nhất! 🎉';
  const totalSpent = userBookings.reduce((sum, booking) => sum + (booking.total || 0), 0);
  const totalSpentLabel = totalSpent ? `${Math.round(totalSpent / 1000).toLocaleString('vi-VN')}k` : '0đ';
  const upcomingCount = userBookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T${String(booking.hour).padStart(2, '0')}:00:00`);
    return bookingDate > new Date() && booking.status !== 'rejected' && booking.status !== 'cancelled';
  }).length;
  const avatarRankClass = `rank-${rankInfo.name.toLowerCase().replace(' ', '-')}`;

  const smartFavoriteCourt = userBookings.reduce((acc, booking) => {
    const courtKey = booking.courtName || booking.courtId || 'Sân yêu thích';
    acc[courtKey] = (acc[courtKey] || 0) + 1;
    return acc;
  }, {});
  const favoriteCourtName = Object.keys(smartFavoriteCourt).reduce((best, key) => {
    return !best || smartFavoriteCourt[key] > smartFavoriteCourt[best] ? key : best;
  }, null);
  const smartFavoriteHour = userBookings.reduce((acc, booking) => {
    const hourKey = booking.hour || '19';
    acc[hourKey] = (acc[hourKey] || 0) + 1;
    return acc;
  }, {});
  const favoriteHour = Object.keys(smartFavoriteHour).reduce((best, key) => {
    return !best || smartFavoriteHour[key] > smartFavoriteHour[best] ? key : best;
  }, null);
  const quickCourt = favoriteCourtName
    ? courts.find(c => String(c.id) === String(userBookings.find(b => b.courtName === favoriteCourtName)?.courtId) || c.name === favoriteCourtName) || courts[0]
    : courts[0];
  const quickHour = favoriteHour ? Number(favoriteHour) : 19;
  const quickDate = new Date().toISOString().split('T')[0];
  const quickSlotsLeft = Math.max(1, 2 - userBookings.filter(b => b.courtName === favoriteCourtName).length + 1);

  const addNotification = (message) => {
    const newNoti = { id: Date.now(), message, time: new Date().toLocaleString(), read: false };
    const updated = [newNoti, ...notifications];
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
    console.log("💾 Đã lưu thông báo vào localStorage:", updated);
  };

  // === EFFECTS ===
  useEffect(() => {
    const savedNoti = localStorage.getItem('notifications');
    if (savedNoti) {
      try {
        setNotifications(JSON.parse(savedNoti));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      fetchAllBookings();
      fetchUsers();
    } else if (user.role === 'user' && (user.id || user._id) && localStorage.getItem('token')) {
      fetchMyBookings();
      fetchUserNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    const currentKtbJson = localStorage.getItem('ktb_user');
    const loginTime = currentKtbJson ? (() => {
      try {
        return JSON.parse(currentKtbJson).loginTime || new Date().toISOString();
      } catch {
        return new Date().toISOString();
      }
    })() : new Date().toISOString();
    const savedUser = {
      name: user.name || user.username,
      phone: user.phone || '',
      loginTime,
      role: user.role || 'user'
    };
    localStorage.setItem('ktb_user', JSON.stringify(savedUser));
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === bannerData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerData.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-avatar-wrapper")) setShowUserMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!isUser) return;

    const checkReminders = () => {
      const now = new Date();
      userBookings
        .filter(booking => booking.status === 'approved')
        .forEach((booking) => {
          const bookingStart = new Date(`${booking.date}T${String(booking.hour).padStart(2, '0')}:00:00`);
          const diffMinutes = Math.round((bookingStart.getTime() - now.getTime()) / 60000);
          if (diffMinutes <= 120 && diffMinutes > 115 && !hasUserNotification(booking._id || booking.id, 'schedule_reminder', 'Sắp đến giờ chơi rồi')) {
            pushUserNotification({
              bookingId: booking._id || booking.id,
              type: 'schedule_reminder',
              message: `⏰ Sắp đến giờ chơi rồi! ${booking.courtName} lúc ${String(booking.hour).padStart(2, '0')}:00`
            });
          }
          if (diffMinutes <= 30 && diffMinutes > 25 && !hasUserNotification(booking._id || booking.id, 'schedule_reminder', 'Chuẩn bị đến sân nhé')) {
            pushUserNotification({
              bookingId: booking._id || booking.id,
              type: 'schedule_reminder',
              message: `⏰ Chuẩn bị đến sân nhé! ${booking.courtName} lúc ${String(booking.hour).padStart(2, '0')}:00`
            });
          }
        });

      const today = new Date().getDay();
      if (today === 5 && !hasUserNotification(null, 'promotion', 'Thứ 6 này giảm 20% sân VIP')) {
        pushUserNotification({
          type: 'promotion',
          message: '🎁 Thứ 6 này giảm 20% sân VIP',
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [isUser, userBookings, userNotifications]);

  // === RENDER HERO ===
  const renderHero = () => (
    <section className="hero-slider">
      {bannerData.map((slide, index) => (
        <div className={`slide-item ${index === currentSlide ? 'active' : ''}`} key={index}
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${slide.image})` }}>
          <div className="hero-overlay">
            <h1 style={{ color: '#fff' }} dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
            <p style={{ color: '#eee', fontSize: '1.2rem' }}>{slide.desc}</p>
            <button className="btn-primary pulse">ĐẶT SÂN NGAY</button>
          </div>
        </div>
      ))}
      <button className="slide-arrow prev" onClick={() => setCurrentSlide(prev => prev === 0 ? bannerData.length - 1 : prev - 1)}>&#10094;</button>
      <button className="slide-arrow next" onClick={() => setCurrentSlide(prev => prev === bannerData.length - 1 ? 0 : prev + 1)}>&#10095;</button>
    </section>
  );

  if (page === 'forgot') {
    return <ForgotPassword setPage={setPage} />;
  }
  if (page === 'reset' && resetToken) {
    return <ResetPassword token={resetToken} setPage={setPage} />;
  }
  if (page === 'auth') {
    return (
      <div className="auth-full-page">
        <div className="auth-background-overlay"></div>
        <div className="auth-container">
          <div className="auth-card fade-in">
            <div className="auth-info-side">
              <div className="auth-logo">KONTUM <span>BADMINTON</span></div>
              <h3>GIA NHẬP CỘNG ĐỒNG</h3>
              <p>Hệ thống quản lý và đặt sân chuyên nghiệp.</p>
              <button className="btn-back-home" onClick={() => setPage('home')}>QUAY LẠI</button>
            </div>
            <div className="auth-form-side">
              {authMode === 'login' ? (
  <Login 
    setPage={setPage} 
    setAuthMode={setAuthMode}
  />
) : (
  <Register setPage={setPage} setAuthMode={setAuthMode} />
)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={handleLogoClick}>
          KONTUM <span>BADMINTON</span>
        </div>
        <nav className="main-nav">
          <ul>
            {headerItems.filter(item => item.visible).map(item => (
              <li
                key={item.page}
                onClick={() => setPage(item.page)}
                className={page === item.page ? `active ${item.className || ''}`.trim() : ''}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-auth-section">
          <div className="notification-wrapper">
            <div className="notification-icon" onClick={() => {
              if (!isAuthenticated) {
                setPage('auth');
                setAuthMode('login');
                return;
              }
              setShowNotification(prev => !prev);
            }}>
              🔔
              {userNotifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">{userNotifications.filter(n => !n.read).length}</span>
              )}
            </div>
            {showNotification && isAuthenticated && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <span>Thông báo</span>
                  <button className="btn-mark-all" onClick={markAllNotificationsAsRead}>
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
                {userNotifications.length === 0 ? (
                  <div className="notification-item">Không có thông báo</div>
                ) : (
                  <>
                    {userNotifications.slice(0, 5).map(n => (
                      <div
                        key={n._id || n.id}
                        className={`notification-item ${n.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="notification-item-icon">{n.type === 'booking_approved' ? '🟢' : n.type === 'schedule_reminder' ? '⏰' : n.type === 'promotion' ? '🎁' : n.type === 'booking_rejected' || n.type === 'booking_cancelled' ? '❌' : '🔔'}</div>
                        <div className="notification-item-content">
                          <div className="notification-item-text">{n.message}</div>
                          <small>{n.time || new Date(n.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                    {userNotifications.length > 5 && (
                      <div className="notification-item view-all-row">
                        <button onClick={() => { setShowNotification(false); setPage('notifications'); }} className="btn-view-all">
                          Xem tất cả ({userNotifications.length})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {isAuthenticated && !isAdmin ? (
            <div className="user-avatar-wrapper logged-in-avatar">
              <div className={`user-avatar ${avatarRankClass}`} onClick={() => setShowUserMenu(prev => !prev)}>
                {avatar ? <img src={avatar} className="avatar" alt="avatar" /> : <span>{avatarLetter}</span>}
              </div>
              <div className="user-name-label">{shortName}</div>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className={`user-menu-avatar ${avatarRankClass}`}><span>{avatarLetter}</span></div>
                    <div>
                      <div className="user-menu-name">{rawName}</div>
                      <div className="user-menu-field phone-row">
                        {hasPhone ? `📞 ${phoneNumberLabel}` : '📞 Chưa có SĐT'}
                        {!hasPhone && (
                          <button className="btn-update-phone" onClick={() => { setShowUserMenu(false); handleOpenUserProfile(); }}>➕ Cập nhật SĐT</button>
                        )}
                      </div>
                      <div className="user-menu-field">{rankInfo.emoji} Hạng {rankText}</div>
                    </div>
                  </div>
                  <div className="rank-progress">
                    <div className="rank-progress-bar">
                      <div className="rank-progress-fill" style={{ width: `${progressValue}%`, background: rankInfo.color }} />
                    </div>
                    <div className="rank-progress-text">{bookingCount}/{nextTarget || bookingCount} lần</div>
                    <div className="rank-progress-note">{nextRankText}</div>
                  </div>
                  <div className="user-menu-stats">
                    <div className="stat-card">
                      <strong>{bookingCount}</strong>
                      <span>Lượt đặt</span>
                    </div>
                    <div className="stat-card">
                      <strong>{totalSpentLabel}</strong>
                      <span>Đã chi</span>
                    </div>
                    <div className="stat-card">
                      <strong>{upcomingCount}</strong>
                      <span>Sắp tới</span>
                    </div>
                  </div>
                  <div className="user-menu-separator" />
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); setPage('my-bookings'); }}>📋 Lịch đặt sân</div>
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); setPage('favorites'); }}>❤️ Yêu thích</div>
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); setPage('notifications'); }}>🔔 Thông báo</div>
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); handleOpenUserProfile(); }}>⚙️ Cập nhật thông tin</div>
                  <div className="user-menu-separator" />
                  <div className="menu-item logout" onClick={handleUserLogout}>🚪 Đăng xuất</div>
                </div>
              )}
            </div>
          ) : !isAdmin ? (
            <div className="auth-buttons auth-lookup-buttons">
              <button className="btn-login-lookup" onClick={() => { setPage('auth'); setAuthMode('login'); }}>ĐĂNG NHẬP / TRA CỨU</button>
            </div>
          ) : null}

          {isAdmin && (
            <div className="admin-logo-badge admin-top-right-badge" onClick={handleOpenAdminProfile}>
              <div className="admin-logo-avatar">
                {avatar ? <img src={avatar} alt="admin avatar" /> : <span>👤</span>}
              </div>
              <div className="admin-logo-text">
                <strong>{user?.name || user?.username}</strong>
                <small>Quản trị viên</small>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="main-content fade-in">
        {page === 'home' && (
          <>
            {renderHero()}
            {isUser && userBookings.length > 0 && quickCourt && (
              <section className="returning-user-section">
                <div className="returning-banner">
                  <div>
                    <p>Chào mừng trở lại!</p>
                    <h2>Sân yêu thích của bạn <span>{quickCourt.name}</span> còn trống tối nay {String(quickHour).padStart(2, '0')}:00</h2>
                  </div>
                  <div className="scarcity-box">
                    <span>⏳ Khẩn cấp</span>
                    <p>{quickCourt.name} còn {quickSlotsLeft} slot hôm nay</p>
                  </div>
                </div>
                <div className="quick-booking-card">
                  <div>
                    <h3>Đặt nhanh</h3>
                    <p>Sân hay đặt nhất của bạn hôm nay.</p>
                    <ul>
                      <li><strong>Sân:</strong> {quickCourt.name}</li>
                      <li><strong>Giờ đề xuất:</strong> {String(quickHour).padStart(2, '0')}:00</li>
                      <li><strong>Ngày:</strong> {quickDate}</li>
                    </ul>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedCourt(quickCourt);
                      setSelectedDate(quickDate);
                      setSelectedHour(String(quickHour));
                      setDuration(1);
                      setPage('court-detail');
                    }}
                  >
                    Đặt nhanh ngay
                  </button>
                </div>
              </section>
            )}
            <section className="court-section">
              {isAuthenticated && user?.role === 'admin' && (
                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                  <button onClick={handleAddNewCourt} style={{ background: '#00a651', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ➕ Thêm sân mới
                  </button>
                </div>
              )}
              <div className="court-grid">
                {courts.map(court => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    favorites={favorites}
                    toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])}
                    onViewCourt={(court) => {
                      if (!isAuthenticated) { setShowLoginNotice(true); return; }
                      setSelectedCourt(court);
                      setPage('court-detail');
                    }}
                    onManageCourt={handleOpenEditCourt}
                    userRole={user?.role}
                  />
                ))}
              </div>
            </section>
            {showCourtModal && (
              <CourtEditModal court={editingCourt} onSave={handleSaveCourt} onClose={() => setShowCourtModal(false)} />
            )}
          </>
        )}
{page === 'my-bookings' && (
  isUser ? (
    <BookingHistory bookingRequests={bookingRequests} user={user} cancelBooking={cancelBooking} adminPhone="0339310915" highlightBookingId={selectedBookingId} />
  ) : !isAdmin ? (
    <div className="guest-login-prompt" style={{ padding: '40px 10%', textAlign: 'center' }}>
      <h2>🔒 Vui lòng đăng nhập để xem lịch đặt sân</h2>
      <p>Bạn cần đăng nhập để truy cập trang lịch đặt sân và xem chi tiết booking.</p>
      <button className="btn-primary" onClick={() => { setPage('auth'); setAuthMode('login'); }}>
        ĐĂNG NHẬP NGAY
      </button>
    </div>
  ) : null
)}
        {page === 'notifications' && isAuthenticated && (
          <NotificationsPage
            notifications={userNotifications}
            onBack={() => setPage(user?.role === 'admin' ? 'admin' : 'home')}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllRead={markAllNotificationsAsRead}
            onClear={clearAllNotifications}
            onNotificationClick={handleNotificationClick}
          />
        )}
        {page === 'order-lookup' && (
          <OrderLookupPage
            courts={courts}
            user={user}
            cancelBooking={cancelBooking}
            onRebook={(booking) => {
              const court = courts.find(c => String(c.id) === String(booking.courtId) || c.name === booking.courtName) || {
                id: booking.courtId,
                name: booking.courtName,
                price: booking.duration ? Math.round((booking.total || 0) / booking.duration) : booking.total || 0,
                desc: booking.courtName,
                status: 'Trống',
                image: ''
              };
              setSelectedCourt(court);
              setSelectedDate(booking.date);
              setSelectedHour(booking.hour);
              setDuration(booking.duration || 1);
              setPage('court-detail');
            }}
          />
        )}
        {page === 'admin' && isAuthenticated && user?.role === 'admin' && (
          <AdminDashboard
            bookingRequests={bookingRequests}
            users={users}
            approveBooking={approveBooking}
            rejectBooking={rejectBooking}
            deleteBooking={cancelBooking}
            clearOldBookings={clearOldBookings}
            courts={courts}
            setCourts={setCourts}
            refreshBookings={fetchAllBookings}
          />
        )}
        {page === 'payment' && (
          <PaymentPage
            bookingData={paymentData}
            setPage={setPage}
            handleBooking={submitBookingRequest}
          />
        )}
        {page === 'court-detail' && selectedCourt && (
          <CourtDetail
            selectedCourt={selectedCourt}
            courts={courts}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedHour={selectedHour}
            setSelectedHour={setSelectedHour}
            duration={duration}
            setDuration={setDuration}
            bookingRequests={bookingRequests}
            onGoToPayment={goToPayment}
            setPage={setPage}
            setSelectedCourt={setSelectedCourt}
            user={user}
          />
        )}
        {page === 'favorites' && (
          <FavoritesPage
            courts={courts}
            favorites={favorites}
            toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])}
            onViewCourt={(court) => { if (!isAuthenticated) { setShowLoginNotice(true); return; } setSelectedCourt(court); setPage('court-detail'); }}
            userRole={user?.role}
          />
        )}
        {page === 'map' && <MapPage />}
      </main>

      {page !== 'admin' && (
        <footer className="footer">
          <div className="f-logo">KONTUM <span>BADMINTON GROUP</span></div>
          <p>🏢 Địa chỉ: {footerSettings.address}</p>
          <p>📞 Hotline: {footerSettings.hotline}</p>
          <p>📧 Email: {footerSettings.email}</p>
          <p>🕒 Giờ hoạt động: {footerSettings.hours}</p>
        </footer>
      )}

      {showLoginNotice && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🔒 Yêu cầu đăng nhập</h3>
            <p>Vui lòng đăng nhập để đặt sân.</p>
            <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowLoginNotice(false)}>Đóng</button><button className="btn-confirm" onClick={() => { setShowLoginNotice(false); setPage('auth'); setAuthMode('login'); }}>Đăng nhập ngay</button></div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <div className="modal-overlay">
          <div className="admin-profile-modal user-update-modal">
            <div className="admin-profile-header">
              <div>
                <h3>👤 Cập nhật thông tin</h3>
                <p style={{ margin: 0, color: '#555' }}>Tên hiển thị và số điện thoại</p>
              </div>
              <button className="close-btn" onClick={() => setShowUserProfile(false)}>✕</button>
            </div>

            <div className="admin-profile-body">
              <div className="input-field">
                <label>Họ tên</label>
                <input type="text" value={userDisplayName} onChange={e => setUserDisplayName(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Số điện thoại</label>
                <input type="text" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="0xxxxxxxxx" />
              </div>
              <div className="input-field">
                <label>Tên đăng nhập</label>
                <input type="text" value={user?.username || ''} disabled />
              </div>
              <div className="admin-profile-info-row">
                <span>Vai trò:</span> <strong>{user?.role === 'user' ? 'Khách hàng' : user?.role}</strong>
              </div>
            </div>

            <div className="admin-profile-actions">
              <button className="btn-secondary" onClick={() => setShowUserProfile(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleUserProfileSave}>💾 Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

      {showAdminProfile && (
        <div className="modal-overlay">
          <div className="admin-profile-modal">
            <div className="admin-profile-header">
              <div>
                <h3>👑 Thông tin Admin</h3>
                <p style={{ margin: 0, color: '#555' }}>Quản lý tài khoản và bảo mật</p>
              </div>
              <button className="close-btn" onClick={() => setShowAdminProfile(false)}>✕</button>
            </div>

            <div className="admin-profile-body">
              <div className="admin-profile-avatar">
                {avatar ? <img src={avatar} alt="avatar" /> : <div className="avatar-placeholder">👤</div>}
              </div>
              <div className="input-field">
                <label>Họ tên</label>
                <input type="text" value={adminDisplayName} onChange={e => setAdminDisplayName(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Email</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Tên đăng nhập</label>
                <input type="text" value={user?.username || ''} disabled />
              </div>
              <div className="admin-profile-info-row">
                <span>Vai trò:</span> <strong>{user?.role === 'admin' ? 'Quản trị viên' : user?.role}</strong>
              </div>
            </div>

            <div className="admin-profile-actions">
              <button className="btn-secondary" onClick={handleAdminLogout}>🚪 Đăng xuất</button>
              <button className="btn-secondary" onClick={() => { setShowAdminProfile(false); setPage('forgot'); }}>🔑 Đổi mật khẩu</button>
              <button className="btn-primary" onClick={handleAdminProfileSave}>💾 Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && <SuccessPopup onClose={() => setShowSuccessPopup(false)} />}
    </div>
  );
}

export default App;