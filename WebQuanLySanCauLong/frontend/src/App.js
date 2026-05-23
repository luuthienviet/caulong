import { useState, useEffect, useContext } from 'react';
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { AuthContext } from './AuthContext';
import CourtCard from "./components/courts/CourtCard";
import CourtDetail from "./components/courts/CourtDetail";
import SuccessPopup from "./components/common/SuccessPopup";
import BookingHistory from "./pages/BookingHistory";
import API from './api';
import './App.css';
import NotificationsPage from "./pages/NotificationsPage";
import OrderLookupPage from "./pages/OrderLookupPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import FavoritesPage from "./pages/FavoritesPage";
import MapPage from "./pages/MapPage";
import PaymentPage from "./pages/PaymentPage";
import ContactPage from "./pages/ContactPage";
import ChatBot from "./components/chatbot/ChatBot";
import UtilityShop from "./components/shop/UtilityShop";
import MembershipPage from "./pages/MembershipPage";

const defaultCourts = [
  { id: 1, name: "SÂN SỐ 01 - VIP", price: 200000, desc: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", status: "Trống", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png" },
  { id: 2, name: "SÂN SỐ 02 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", status: "Trống", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg" },
  { id: 3, name: "SÂN SỐ 03 - THƯỜNG", price: 100000, desc: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", status: "Trống", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg" },
  { id: 4, name: "SÂN SỐ 04 - VIP", price: 200000, desc: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", status: "Trống", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg" },
  { id: 5, name: "SÂN SỐ 05 - VIP", price: 200000, desc: "Sân VIP đạt tiêu chuẩn quốc tế BWF, thảm Yonex dày 5mm, khán đài mini chuyên nghiệp.", status: "Trống", image: "https://plurysports.com/wp-content/uploads/2021/11/badminton-court-construction.jpg" },
  { id: 6, name: "SÂN SỐ 06 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu, không gian thoáng mát, hệ thống thông gió hiện đại.", status: "Trống", image: "https://onsport.vn/images/badminton-court.jpg" },
  { id: 7, name: "SÂN SỐ 07 - THƯỜNG", price: 100000, desc: "Sân tập luyện phổ thông, ánh sáng tốt, phù hợp cho học sinh/sinh viên rèn luyện sức khỏe.", status: "Trống", image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2070" },
  { id: 8, name: "SÂN SỐ 08 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu chuyên nghiệp, hệ thống đèn chống lóa mắt tốt cho sức khỏe thị lực.", status: "Trống", image: "https://thethaodonga.com/wp-content/uploads/2022/10/kich-thuoc-san-cau-long-1.jpeg" }
];

const formatCourtData = (items) => {
  const source = Array.isArray(items) ? items : [];
  if (source.length === 0) {
    // Nếu database trống, trả về các sân mặc định với ObjectId giả lập hợp lệ
    return defaultCourts.map((c, index) => ({
      ...c,
      id: `507f1f77bcf86cd79943901${index + 1}` // 24 ký tự hex hợp lệ làm Mongoose ObjectId
    }));
  }

  // Nếu database có sân, chỉ hiển thị đúng các sân từ database
  const uniqueMap = new Map();
  return source
    .filter(c => c && typeof c === 'object')
    .map(c => ({
      id: c._id || c.id,
      name: typeof c.name === 'string' ? c.name : 'Unknown Court',
      price: typeof c.price === 'number' ? c.price : Number(c.price) || 0,
      desc: typeof c.description === 'string' ? c.description : (typeof c.desc === 'string' ? c.desc : ''),
      status: typeof c.status === 'string' ? c.status : 'Trống',
      image: typeof c.image === 'string' ? c.image : '',
      avgRating: typeof c.avgRating === 'number' ? c.avgRating : 0,
      reviewCount: typeof c.reviewCount === 'number' ? c.reviewCount : 0,
      bookingCount: typeof c.bookingCount === 'number' ? c.bookingCount : 0
    }))
    .filter((court) => {
      const key = court.id || court.name;
      if (uniqueMap.has(key)) return false;
      uniqueMap.set(key, true);
      return court.id && court.id.length === 24; // Chỉ lấy các sân có ID hợp lệ 24 ký tự
    });
};

function App() {
  // === STATES ===
  const [page, setPage] = useState(() => localStorage.getItem('user_current_page') || 'home');
  const [courts, setCourts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentProof, setPaymentProof] = useState({});
  const [selectedCourt, setSelectedCourt] = useState(() => {
    try {
      const stored = localStorage.getItem('user_selected_court');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [selectedDate, setSelectedDate] = useState(() => localStorage.getItem('user_selected_date') || "");
  const [selectedHour, setSelectedHour] = useState(() => localStorage.getItem('user_selected_hour') || "");
  const [duration, setDuration] = useState(() => Number(localStorage.getItem('user_booking_duration')) || 1);
  const [showDepositStep, setShowDepositStep] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const { user, login, logout } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(() => localStorage.getItem('user_selected_booking_id') || null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [resetToken, setResetToken] = useState(null);
  const [paymentData, setPaymentData] = useState(() => {
    try {
      const stored = localStorage.getItem('user_payment_data');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [userNotifications, setUserNotifications] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
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

  // === REFRESH POINTS FROM SERVER ===
  const refreshUserPoints = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await API.get('/auth/me');
      if (res.data.success && res.data.user) {
        login({ ...res.data.user, token: localStorage.getItem('token') });
      }
    } catch (err) {
      // Token possibly expired, ignore
    }
  };

  useEffect(() => {
    fetchCourts();
    fetchSchedules();
    refreshUserPoints(); // sync fresh points from DB on page load
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/')[2];
      setResetToken(token);
      setPage('reset');
    }
  }, []);

  const goToPayment = async (data) => {
    const newBooking = {
      courtId: data.selectedCourt.id || data.selectedCourt._id,
      courtName: data.selectedCourt.name,
      date: data.selectedDate,
      hour: data.selectedHour,
      duration: data.duration,
      total: data.totalPrice,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerNote: data.customerNote,
      paymentImage: null,
      status: "pending",
      paymentMethod: "tại sân",
      paymentStatus: "pending",
      pointsRedeemed: data.pointsRedeemed || 0
    };
    try {
      await API.post('/bookings', newBooking);
      alert("✅ Đăng ký sân thành công! Vui lòng chờ admin duyệt yêu cầu.");
      
      // Cập nhật điểm tích lũy trong client
      if (data.pointsRedeemed > 0 && user) {
        const updatedUser = { ...user, points: Math.max(0, (user.points || 0) - data.pointsRedeemed) };
        login(updatedUser);
      }

      fetchMyBookings();
      setSelectedCourt(null);
      setSelectedDate('');
      setSelectedHour('');
      setDuration(1);
      setShowDepositStep(false);
      setPage('my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký sân thất bại!");
    }
  };

  const handlePayForBooking = (booking) => {
    setPaymentData({
      bookingId: booking._id || booking.id,
      selectedCourt: { name: booking.courtName, id: booking.courtId },
      selectedDate: booking.date,
      selectedHour: booking.hour,
      duration: booking.duration,
      totalPrice: booking.total,
      depositAmount: Math.floor(booking.total * 0.5),
      customerName: booking.customerName,
      customerPhone: booking.customerPhone || booking.phone,
      customerNote: booking.customerNote,
      isExistingBooking: true
    });
    setPage('payment');
  };

  const isUser = Boolean(user && ['user', 'admin', 'manager', 'staff'].includes(user.role));

  const headerItems = [
    { label: '🏠 TRANG CHỦ', page: 'home', visible: true },
    { label: '🔎 TRA CỨU ĐƠN', page: 'order-lookup', visible: !user },
    { label: '📋 LỊCH ĐẶT SÂN', page: 'my-bookings', visible: true },
    { label: '🛒 CỬA HÀNG', page: 'shop', visible: true },
    { label: '🗺️ BẢN ĐỒ', page: 'map', visible: true },
    { label: '📞 LIÊN HỆ', page: 'contact', visible: true },
  ];

  const handleLogoClick = () => {
    setPage('home');
  };

  const fetchUserNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      const newNotifs = res.data.data || [];
      // If any new booking_approved notification exists, refresh user points from server
      const prevIds = new Set((userNotifications || []).map(n => String(n._id || n.id)));
      const hasNewApproved = newNotifs.some(n => n.type === 'booking_approved' && !prevIds.has(String(n._id || n.id)));
      if (hasNewApproved) {
        refreshUserPoints();
      }
      setUserNotifications(newNotifs);
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
    return /^0\d{9}$/.test(phone);
  };

  const handleUserProfileSave = async () => {
    if (!user) return;
    if (!userDisplayName || userDisplayName.trim().length === 0) {
      return alert('Vui lòng nhập tên hiển thị hợp lệ');
    }
    if (userPhone && !isValidVietnamPhone(userPhone)) {
      return alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số, bắt đầu bằng 0');
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

  const handleLogout = () => {
    logout();
    setAvatar(null);
    setShowUserMenu(false);
    setShowNotification(false);
    setShowUserProfile(false);
    setShowChangePassword(false);
    setShowLoginNotice(false);
    setSelectedBookingId(null);
    setPage('home');
    setUserNotifications([]);
  };

  const handleUserLogout = handleLogout;

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

  const fetchAIRecommendation = async () => {
    try {
      const res = await API.get('/bookings/ai-recommendations');
      if (res.data.success && res.data.type !== 'none') {
        setAiRecommendation(res.data);
      } else {
        setAiRecommendation(null);
      }
    } catch (err) {
      console.error('Lỗi lấy gợi ý AI:', err);
      setAiRecommendation(null);
    }
  };

  // === API CALLS ===
  const fetchSchedules = async () => {
    try {
      const res = await API.get('/bookings/all-schedules');
      setAllSchedules(res.data.data || []);
    } catch (err) {
      console.error('Lỗi lấy tất cả lịch đặt sân:', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await API.get('/bookings/my-bookings');
      setBookingRequests(res.data.data);
      fetchSchedules();
    } catch (err) {
      console.error('Lỗi lấy lịch sử:', err);
    }
  };

  const submitBookingRequest = async (booking) => {
    try {
      const res = await API.post('/bookings', booking);
      console.log('Đặt sân thành công:', res.data);
      
      try {
        const localBookings = JSON.parse(localStorage.getItem('localCourtBookings') || '{}');
        const cId = booking.courtId;
        if (cId) {
          localBookings[cId] = (localBookings[cId] || 0) + 1;
          localStorage.setItem('localCourtBookings', JSON.stringify(localBookings));
        }
      } catch (err) {}

      fetchMyBookings();
      fetchAIRecommendation();
      fetchCourts();
      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Lỗi đặt sân:', err);
      alert(err.response?.data?.message || 'Đặt sân thất bại');
    }
  };


  const cancelBooking = async (id) => {
    try {
      await API.delete(`/bookings/${id}`);
      await fetchMyBookings();
      fetchAIRecommendation();
      fetchCourts();
    } catch (err) {
      console.error('Lỗi hủy:', err);
    }
  };

  const calculatePrice = (court, hour, duration = 1) => {
    if (!court || !hour) return 0;
    const h = Number(hour);
    let pricePerHour = court.price;
    if (h >= 17) pricePerHour = Math.floor(court.price * 1.3);
    return pricePerHour * duration;
  };

  const getUserBookings = () => {
    if (!user || !['user', 'admin', 'manager', 'staff'].includes(user?.role)) return [];
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


  // === EFFECTS ===

  useEffect(() => {
    if (!user) {
      setAiRecommendation(null);
      return;
    }
    if (['user', 'admin', 'manager', 'staff'].includes(user.role) && (user.id || user._id) && localStorage.getItem('token')) {
      fetchMyBookings();
      fetchUserNotifications();
      fetchAIRecommendation();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
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

  // === PERSIST STATE EFFECTS ===
  useEffect(() => {
    localStorage.setItem('user_current_page', page);
  }, [page]);

  useEffect(() => {
    if (selectedCourt) {
      localStorage.setItem('user_selected_court', JSON.stringify(selectedCourt));
    } else {
      localStorage.removeItem('user_selected_court');
    }
  }, [selectedCourt]);

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('user_selected_date', selectedDate);
    } else {
      localStorage.removeItem('user_selected_date');
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedHour) {
      localStorage.setItem('user_selected_hour', selectedHour);
    } else {
      localStorage.removeItem('user_selected_hour');
    }
  }, [selectedHour]);

  useEffect(() => {
    localStorage.setItem('user_booking_duration', String(duration));
  }, [duration]);

  useEffect(() => {
    if (selectedBookingId) {
      localStorage.setItem('user_selected_booking_id', selectedBookingId);
    } else {
      localStorage.removeItem('user_selected_booking_id');
    }
  }, [selectedBookingId]);

  useEffect(() => {
    if (paymentData) {
      localStorage.setItem('user_payment_data', JSON.stringify(paymentData));
    } else {
      localStorage.removeItem('user_payment_data');
    }
  }, [paymentData]);

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

  const renderHero = () => (
    <section className="hero-slider" style={{ position: 'relative', overflow: 'hidden', height: '75vh', minHeight: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#1a1a2e' }}>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 45%', // Canh ngay vị trí thân người chơi
          zIndex: 0
        }}
      >
        {/* Placeholder video link or local file */}
        <source src="/banner-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="hero-overlay" style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.45)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '0 20px',
        width: '100%',
        maxWidth: '100%'
      }}>
        <h1 style={{ color: '#fff', textAlign: 'center', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, textShadow: '2px 4px 10px rgba(0,0,0,0.5)', margin: 0, letterSpacing: '2px' }}>
          LTV <span style={{ color: '#4cc9f0' }}>BADMINTON</span>
        </h1>
        <p style={{ color: '#f8f9fa', fontSize: 'clamp(1rem, 2vw, 1.4rem)', textAlign: 'center', maxWidth: '800px', margin: '20px 0 40px 0', textShadow: '1px 2px 4px rgba(0,0,0,0.5)', fontWeight: 500 }}>
          Hệ thống sân cầu lông đạt chuẩn quốc gia. Trải nghiệm không gian thể thao đẳng cấp và chuyên nghiệp ngay hôm nay.
        </p>
        <button 
          className="btn-primary pulse" 
          onClick={() => {
            const courtSection = document.querySelector('.court-section');
            if (courtSection) courtSection.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: '50px', fontWeight: 'bold' }}
        >
          ĐẶT SÂN NGAY
        </button>
      </div>
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
            <div className="auth-info-side" style={{ backgroundImage: "linear-gradient(135deg, rgba(9, 13, 22, 0.65), rgba(30, 27, 75, 0.85)), url('/smash.jpg')" }}>
              <div className="auth-logo"><span className="logo-brand">LTV</span> <span>BADMINTON</span></div>
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
    <div className="w-full min-h-screen flex flex-col">
      <header className="header">
          <div className="logo" onClick={handleLogoClick}>
            <span className="logo-brand">LTV</span> <span>BADMINTON</span>
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
          {isAuthenticated ? (
            <div className="user-avatar-wrapper logged-in-avatar">
              <div style={{ position: 'relative' }}>
                <div className={`user-avatar ${avatarRankClass}`} onClick={() => setShowUserMenu(prev => !prev)}>
                  {avatar ? <img src={avatar} className="avatar" alt="avatar" /> : <span>{avatarLetter}</span>}
                </div>
                {userNotifications.filter(n => !n.read).length > 0 && (
                  <div style={{
                    position: 'absolute', top: -2, right: -6, background: '#ef4444', color: '#fff',
                    borderRadius: '12px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: 800,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 10,
                    minWidth: '18px', textAlign: 'center', border: '1.5px solid #fff'
                  }}>
                    {userNotifications.filter(n => !n.read).length > 99 ? '99+' : userNotifications.filter(n => !n.read).length}
                  </div>
                )}
              </div>
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
                      {user?.role === 'user' && (
                        <div className="user-menu-field" style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                          <span style={{
                            background: (user?.points||0) >= 5000 ? 'linear-gradient(135deg,#6366f1,#3b82f6)' :
                                        (user?.points||0) >= 1000 ? 'linear-gradient(135deg,#f59e0b,#d97706)' :
                                        '#94a3b8',
                            color:'#fff', fontSize:'0.65rem', fontWeight:800, padding:'1px 7px', borderRadius:20
                          }}>
                            {(user?.points||0) >= 5000 ? 'Bạch Kim' : (user?.points||0) >= 1000 ? 'Vàng' : 'Bạc'}
                          </span>
                          💎 <strong style={{color:'#4361ee'}}>{(user?.points||0).toLocaleString()}</strong> điểm LTV
                        </div>
                      )}
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
                  {user?.role === 'user' && (
                    <div className="menu-item" onClick={() => { setShowUserMenu(false); setPage('membership'); }}>🏅 Thành viên & Điểm</div>
                  )}
                  <div className="menu-item" onClick={() => { 
                    setShowUserMenu(false); 
                    setPage('shop'); 
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-cart'));
                    }, 100);
                  }}>🛒 Giỏ hàng</div>
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); setPage('notifications'); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🔔 Thông báo</span>
                    {userNotifications.filter(n => !n.read).length > 0 && (
                      <span style={{
                        background: '#ef4444', color: '#fff', borderRadius: '10px',
                        padding: '1px 6px', fontSize: '0.75rem', fontWeight: 700,
                        boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
                      }}>
                        {userNotifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </div>
                  <div className="menu-item" onClick={() => { setShowUserMenu(false); handleOpenUserProfile(); }}>⚙️ Cập nhật thông tin</div>
                  <div className="user-menu-separator" />
                  <div className="menu-item logout" onClick={handleUserLogout}>🚪 Đăng xuất</div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons auth-lookup-buttons">
              <button className="btn-login-lookup" onClick={() => { setPage('auth'); setAuthMode('login'); }}>Đăng ký / Đăng nhập</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content fade-in">
        {page === 'home' && (
          <>
            {renderHero()}
            {isAuthenticated && aiRecommendation && aiRecommendation.court && (
              <section className="ai-recommendation-section" style={{
                margin: '24px 0',
                padding: '24px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))',
                color: '#fff',
                boxShadow: '0 10px 30px rgba(67, 97, 238, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'ai-glow 3s infinite alternate'
              }}>
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  width: '250px',
                  height: '250px',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }} />

                <div className="ai-banner-container" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div style={{ flex: '1 1 500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        background: aiRecommendation.type === 'personalized' 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        {aiRecommendation.type === 'personalized' ? '🤖 AI Gợi Ý Cá Nhân Hóa' : '🔥 AI Đề Xuất Xu Hướng'}
                      </span>
                      <span style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                        ● Trợ lý thông minh
                      </span>
                    </div>

                    <h2 style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      margin: '0 0 10px 0',
                      lineHeight: '1.4',
                      color: '#fff'
                    }}>
                      {aiRecommendation.message}
                    </h2>

                    <p style={{
                      margin: '0',
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      💡 <strong>Lý do chọn:</strong> {aiRecommendation.reason}
                    </p>
                  </div>

                  <div className="ai-action-box" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '18px 24px',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    flex: '1 1 300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>SÂN ĐỀ XUẤT</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fdb913' }}>{aiRecommendation.court.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>GIÁ SÂN</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                          {(Number(aiRecommendation.hour) >= 17 ? Math.floor(aiRecommendation.court.price * 1.3) : aiRecommendation.court.price).toLocaleString()}đ/h
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>NGÀY CHƠI</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                          {new Date(aiRecommendation.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>GIỜ CHƠI</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                          {aiRecommendation.hour}:00 – {Number(aiRecommendation.hour) + 1}:00
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        // Tìm sân trong danh sách sân của client
                        const fullCourtObj = courts.find(c => String(c.id || c._id) === String(aiRecommendation.court._id || aiRecommendation.court.id)) || aiRecommendation.court;
                        setSelectedCourt(fullCourtObj);
                        setSelectedDate(aiRecommendation.date);
                        setSelectedHour(String(aiRecommendation.hour));
                        setDuration(1);
                        setPage('court-detail');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #4361ee, #3b82f6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(67, 97, 238, 0.4)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>Đặt Ngay</span>
                    </button>
                  </div>
                </div>
                
                <style>{`
                  @keyframes ai-glow {
                    from { box-shadow: 0 10px 30px rgba(67, 97, 238, 0.2), border-color: rgba(99, 102, 241, 0.2); }
                    to { box-shadow: 0 10px 40px rgba(99, 102, 241, 0.45), border-color: rgba(99, 102, 241, 0.6); }
                  }
                `}</style>
              </section>
            )}
            <section className="court-section">
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
                    userRole={user?.role}
                  />
                ))}
              </div>
            </section>
          </>
        )}
{page === 'my-bookings' && (
  isUser ? (
    <BookingHistory bookingRequests={bookingRequests} user={user} cancelBooking={cancelBooking} adminPhone="0339310915" highlightBookingId={selectedBookingId} payForBooking={handlePayForBooking} />
  ) : (
    <div className="guest-login-prompt" style={{ padding: '40px 10%', textAlign: 'center' }}>
      <h2>🔒 Vui lòng đăng nhập để xem lịch đặt sân</h2>
      <p>Bạn cần đăng nhập để truy cập trang lịch đặt sân và xem chi tiết booking.</p>
      <button className="btn-primary" onClick={() => { setPage('auth'); setAuthMode('login'); }}>
        ĐĂNG NHẬP NGAY
      </button>
    </div>
  )
)}
        {page === 'notifications' && isAuthenticated && (
          <NotificationsPage
            notifications={userNotifications}
            onBack={() => setPage('home')}
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

        {page === 'payment' && (
          <PaymentPage
            bookingData={paymentData}
            setPage={setPage}
            refreshBookings={fetchMyBookings}
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
            bookingRequests={allSchedules}
            onGoToPayment={goToPayment}
            setPage={setPage}
            setSelectedCourt={setSelectedCourt}
            user={user}
            onRefreshCourts={fetchCourts}
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
        {page === 'contact' && <ContactPage />}
        {page === 'shop' && <UtilityShop user={user} />}
        {page === 'membership' && user?.role === 'user' && (
          <MembershipPage user={user} onRefreshUser={refreshUserPoints} />
        )}
      </main>

      <footer className="footer">
          <div className="f-logo"><span className="logo-brand">LTV</span> <span>BADMINTON GROUP</span></div>
          <p>🏢 Địa chỉ: {footerSettings.address}</p>
          <p>📞 Hotline: {footerSettings.hotline}</p>
          <p>📧 Email: {footerSettings.email}</p>
          <p>🕒 Giờ hoạt động: {footerSettings.hours}</p>
        </footer>

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



      {showSuccessPopup && <SuccessPopup onClose={() => setShowSuccessPopup(false)} />}
      {/* Nút Zalo nổi */}
      <a
        href={`https://zalo.me/${footerSettings.hotline.replace(/\s/g,'')}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat Zalo với LTV Badminton"
        style={{
          position: 'fixed',
          bottom: 96,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#0068ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(0,104,255,0.45)',
          zIndex: 9998,
          textDecoration: 'none',
          border: '2px solid #fff',
          transition: 'transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08) translateY(-3px)'; e.currentTarget.style.boxShadow='0 15px 30px -5px rgba(0,104,255,.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 10px 25px -5px rgba(0,104,255,.45)'; }}
      >
        {/* Zalo official logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
          alt="Zalo"
          style={{ width: 38, height: 38, objectFit: 'contain' }}
        />
      </a>
      <ChatBot />
    </div>
  );
}

export default App;