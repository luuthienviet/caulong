import { useState, useEffect } from 'react';
import Login from "./components/Login";
import Register from "./components/Register";
import CourtCard from "./components/CourtCard";
import BookingModal from "./components/BookingModal";
import SuccessPopup from "./components/SuccessPopup";
import BookingHistory from "./components/BookingHistory";
import AdminDashboard from "./components/AdminDashboard";
import API from './api';
import './App.css';
import NotificationsPage from "./components/NotificationsPage";
import CourtEditModal from "./components/CourtEditModal";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import FavoritesPage from "./components/FavoritesPage";
import MapPage from "./components/MapPage";
import CurrentDate from "./components/CurrentDate";
import PaymentPage from "./components/PaymentPage";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [notifications, setNotifications] = useState([]); // chỉ dùng cho admin
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
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
        if (res.data.data && res.data.data.length > 0) {
          const formattedCourts = res.data.data
            .filter(c => c && typeof c === 'object')
            .map(c => ({
              id: c._id,
              name: c.name,
              price: c.price,
              desc: c.description,
              status: c.status,
              image: c.image
            }));
          setCourts(formattedCourts);
        } else {
          setCourts([
            { id: 1, name: "SÂN SỐ 01 - VIP", price: 200000, desc: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", status: "Trống", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png" },
            { id: 2, name: "SÂN SỐ 02 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", status: "Trống", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg" },
            { id: 3, name: "SÂN SỐ 03 - THƯỜNG", price: 100000, desc: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", status: "Trống", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg" },
            { id: 4, name: "SÂN SỐ 04 - VIP", price: 200000, desc: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", status: "Trống", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg" }
          ]);
        }
      } catch (err) {
        console.error('Lỗi lấy sân từ API:', err);
        setCourts([
          { id: 1, name: "SÂN SỐ 01 - VIP", price: 200000, desc: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", status: "Trống", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png" },
          { id: 2, name: "SÂN SỐ 02 - CHUẨN", price: 120000, desc: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", status: "Trống", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg" },
          { id: 3, name: "SÂN SỐ 03 - THƯỜNG", price: 100000, desc: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", status: "Trống", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg" },
          { id: 4, name: "SÂN SỐ 04 - VIP", price: 200000, desc: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", status: "Trống", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg" }
        ]);
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
    setPaymentData(data);
    setPage('payment');
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
    try {
      await API.put(`/notifications/${id}/read`);
      setUserNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
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

  const handleUserProfileSave = () => {
    if (!user) return;
    const updatedUser = { ...user, name: userDisplayName, email: userEmail, phone: userPhone };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setShowUserProfile(false);
    alert('Cập nhật thông tin khách hàng thành công!');
  };

  const handleAdminProfileSave = () => {
    if (!user) return;
    const updatedUser = { ...user, name: adminDisplayName, email: adminEmail };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setShowAdminProfile(false);
    alert('Cập nhật thông tin quản trị viên thành công!');
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAvatar(null);
    localStorage.removeItem('avatar');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setShowUserMenu(false);
    setShowAdminProfile(false);
    setPage('home');
  };

  const handleUserLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAvatar(null);
    localStorage.removeItem('avatar');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setShowUserMenu(false);
    setShowUserProfile(false);
    setPage('home');
  };

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
      const validCourts = (res.data.data || []).filter(c => c && typeof c === 'object');
      setCourts(validCourts);
      setShowCourtModal(false);
      setEditingCourt(null);
      alert('Cập nhật sân thành công!');
    } catch (error) {
      console.error('Lỗi lưu sân:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sân!');
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = async () => {
    for (let n of userNotifications) {
      await API.delete(`/notifications/${n._id}`);
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

  const handleDeleteCourt = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sân này?')) {
      try {
        await API.delete(`/courts/${id}`);
        const res = await API.get('/courts');
        setCourts(res.data.data);
        alert('Xóa sân thành công!');
      } catch (error) {
        console.error('Lỗi xóa sân:', error);
        alert('Xóa sân thất bại!');
      }
    }
  };

  // === API CALLS ===
  const fetchAllBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookingRequests(res.data.data);
      const revenue = res.data.data.filter(b => b.status === 'approved').reduce((sum, b) => sum + (b.total || 0), 0);
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

  const addNotification = (message) => {
    const newNoti = { id: Date.now(), message, time: new Date().toLocaleString(), read: false };
    const updated = [newNoti, ...notifications];
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
    console.log("💾 Đã lưu thông báo vào localStorage:", updated);
  };

  // === EFFECTS ===
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('currentUser');
    if (token && userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        setIsLoggedIn(true);
        if (userData.role === 'admin') {
          fetchAllBookings();
        } else if (userData.role === 'user') {
          fetchMyBookings();
          fetchUserNotifications(); // Lấy thông báo từ API cho khách hàng
        }
      } catch (e) {
        console.error('Parse user error', e);
      }
    }
    const savedNoti = localStorage.getItem('notifications');
    if (savedNoti) {
      try {
        setNotifications(JSON.parse(savedNoti));
      } catch(e) { console.error(e); }
    }
  }, []);

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
    setIsLoggedIn={setIsLoggedIn}
    setUser={setUser}
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
        <div className="logo" onClick={() => {
            if (isLoggedIn && user?.role === 'admin') {
              handleOpenAdminProfile();
              return;
            }
            setPage('home');
          }}>
          KONTUM <span>BADMINTON</span>
          {isLoggedIn && user?.role === 'user' && (
            <div className="user-logo-badge" onClick={handleOpenUserProfile}>
              <div className="user-logo-text">
                <strong>{user?.name || user?.username}</strong>
                <small>Khách hàng</small>
              </div>
            </div>
          )}
        </div>
        <nav className="main-nav">
          <ul>
            <li onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>🏠 TRANG CHỦ</li>
            {isLoggedIn && user?.role === 'user' && (
              <>
                <li onClick={() => setPage('my-bookings')} className={page === 'my-bookings' ? 'active' : ''}>📋 LỊCH SỬ ĐẶT SÂN</li>
                <li onClick={() => setPage('favorites')} className={page === 'favorites' ? 'active' : ''}>❤️ YÊU THÍCH</li>
                <li onClick={() => setPage('notifications')} className={page === 'notifications' ? 'active' : ''}>🔔 THÔNG BÁO</li>
              </>
            )}
            {isLoggedIn && user?.role === 'admin' && (
              <li onClick={() => setPage('admin')} className={page === 'admin' ? 'active' : ''} style={{ color: 'red', fontWeight: 'bold' }}>👑 QUẢN TRỊ</li>
            )}
            <li onClick={() => setPage('map')} className={page === 'map' ? 'active' : ''}>🗺️ BẢN ĐỒ</li>
            {(!isLoggedIn || user?.role === 'user') && (
              <li onClick={() => setPage('contact')} className={page === 'contact' ? 'active' : ''}>📞 LIÊN HỆ</li>
            )}
          </ul>
        </nav>
        <div className="header-auth-section">
          {isLoggedIn && user?.role === "user" && (
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setShowNotification(!showNotification)}>
                🔔
                {userNotifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">{userNotifications.filter(n => !n.read).length}</span>
                )}
              </div>
              {showNotification && (
                <div className="notification-dropdown">
                  {userNotifications.length === 0 ? (
                    <div className="notification-item">Không có thông báo</div>
                  ) : (
                    <>
                      {userNotifications.slice(0, 5).map(n => (
                        <div key={n._id} className="notification-item">
                          <div>{n.message}</div>
                          <small>{n.time || new Date(n.createdAt).toLocaleString()}</small>
                        </div>
                      ))}
                      {userNotifications.length > 5 && (
                        <div className="notification-item" style={{ textAlign: 'center', background: '#f0f0f0' }}>
                          <button onClick={() => { setShowNotification(false); setPage('notifications-list'); }} style={{ background: 'none', border: 'none', color: '#00a651', cursor: 'pointer', fontWeight: 'bold' }}>Xem tất cả ({userNotifications.length})</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {isLoggedIn && user?.role === 'user' ? (
            <div className="user-avatar-wrapper">
              <div className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                {avatar ? <img src={avatar} className="avatar" alt="avatar" /> : <div className="avatar-placeholder">👤</div>}
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="menu-item">👤 {user?.name || user?.username}</div>
                  <div className="menu-item logout" onClick={() => { setIsLoggedIn(false); setUser(null); setAvatar(null); localStorage.removeItem("avatar"); localStorage.removeItem("currentUser"); localStorage.removeItem("token"); setShowUserMenu(false); setPage("home"); }}>🚪 Đăng xuất</div>
                </div>
              )}
            </div>
          ) : isLoggedIn && user?.role === 'admin' ? null : (
            <div className="auth-buttons">
              <button className="btn-login" onClick={() => { setPage('auth'); setAuthMode('login'); }}>ĐĂNG NHẬP</button>
              <button className="btn-signup" onClick={() => { setPage('auth'); setAuthMode('register'); }}>ĐĂNG KÝ</button>
            </div>
          )}
          <CurrentDate />
          {isLoggedIn && user?.role === 'admin' && (
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
            <section className="court-section">
              {isLoggedIn && user?.role === 'admin' && (
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
                      if (!isLoggedIn) { setShowLoginNotice(true); return; }
                      setSelectedCourt(court);
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
          <BookingHistory bookingRequests={bookingRequests} user={user} cancelBooking={cancelBooking} adminPhone="0339310915" />
        )}
        {page === 'notifications' && isLoggedIn && user?.role === 'user' && (
          <section style={{ padding: '50px 10%' }}>
            <h2 style={{ color: 'var(--green)', marginBottom: '20px' }}>🔔 THÔNG BÁO CỦA BẠN</h2>
            {userNotifications.length === 0 ? (
              <div className="empty-noti">Bạn chưa có thông báo nào</div>
            ) : (
              <div className="notification-page">
                {userNotifications.map(n => (
                  <div key={n._id} className="notification-card">
                    <div className="noti-icon">🔔</div>
                    <div className="noti-content">
                      <div className="noti-message">{n.message}</div>
                      <div className="noti-time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {page === 'admin' && isLoggedIn && user?.role === 'admin' && (
          <AdminDashboard
            bookingRequests={bookingRequests}
            approveBooking={approveBooking}
            rejectBooking={rejectBooking}
            deleteBooking={cancelBooking}
            clearOldBookings={clearOldBookings}
            courts={courts}
            setCourts={setCourts}
          />
        )}
        {page === 'notifications-list' && (
          <NotificationsPage
            notifications={userNotifications}
            onMarkAsRead={markNotificationAsRead}
            onClear={clearAllNotifications}
            onDelete={deleteNotification}
            onBack={() => setPage(user?.role === 'admin' ? 'admin' : 'home')}
          />
        )}
        {page === 'payment' && (
          <PaymentPage
            bookingData={paymentData}
            setPage={setPage}
            handleBooking={submitBookingRequest}
          />
        )}
        {page === 'favorites' && (
          <FavoritesPage
            courts={courts}
            favorites={favorites}
            toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])}
            onViewCourt={(court) => { if (!isLoggedIn) { setShowLoginNotice(true); return; } setSelectedCourt(court); }}
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
          <div className="admin-profile-modal">
            <div className="admin-profile-header">
              <div>
                <h3>👤 Thông tin Khách hàng</h3>
                <p style={{ margin: 0, color: '#555' }}>Cập nhật thông tin cá nhân</p>
              </div>
              <button className="close-btn" onClick={() => setShowUserProfile(false)}>✕</button>
            </div>

            <div className="admin-profile-body">
              <div className="admin-profile-avatar">
                {avatar ? <img src={avatar} alt="avatar" /> : <div className="avatar-placeholder">👤</div>}
                <label className="avatar-upload-btn">
                  📷 Thay đổi ảnh đại diện
                  <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files[0]; if (!file) return; handleUserAvatarUpload(file); }} />
                </label>
              </div>
              <div className="input-field">
                <label>Họ tên</label>
                <input type="text" value={userDisplayName} onChange={e => setUserDisplayName(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Email</label>
                <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Số điện thoại</label>
                <input type="text" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
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
              <button className="btn-secondary" onClick={handleUserLogout}>🚪 Đăng xuất</button>
              <button className="btn-secondary" onClick={() => { setShowUserProfile(false); setPage('forgot'); }}>🔑 Đổi mật khẩu</button>
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

      <BookingModal
        user={user}
        selectedCourt={selectedCourt}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        duration={duration}
        setDuration={setDuration}
        showDepositStep={showDepositStep}
        setShowDepositStep={setShowDepositStep}
        handleUpload={(e, courtId) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => setPaymentProof({ ...paymentProof, [courtId]: reader.result }); reader.readAsDataURL(file); }}
        paymentProof={paymentProof}
        calculatePrice={calculatePrice}
        handleBooking={submitBookingRequest}
        schedule={{}}
        setSelectedCourt={setSelectedCourt}
        clearOldBookings={clearOldBookings}
        bookingRequests={bookingRequests}
        onGoToPayment={goToPayment}
      />

      {showSuccessPopup && <SuccessPopup onClose={() => setShowSuccessPopup(false)} />}
    </div>
  );
}

export default App;