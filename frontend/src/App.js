  import { useState, useEffect } from 'react';
  import CourtCard from "./components/CourtCard";
  import BookingModal from "./components/BookingModal";
  import SuccessPopup from "./components/SuccessPopup";
  import BookingHistory from "./components/BookingHistory";
  import AdminBookingRequests from "./components/AdminBookingRequests";
  import './App.css';

  function App() {
    // --- 1. STATES QUẢN LÝ ---
    const [page, setPage] = useState('home'); 
    const [courts, setCourts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [paymentProof, setPaymentProof] = useState({});
    const [bookingData, setBookingData] = useState({})
    const [expandedCourt, setExpandedCourt] = useState(null);
    const [duration, setDuration] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const [showDepositStep, setShowDepositStep] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [showDeposit, setShowDeposit] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginNotice, setShowLoginNotice] = useState(false);
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); 
    const [editingCourt, setEditingCourt] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    
    
    
  const hours = [
  "05","06","07","08","09","10","11","12",
  "13","14","15","16","17","18","19","20","21"
];
  // ✅ đặt calculatePrice lên trên
  const calculatePrice = (court, hour, duration = 1) => {
    if (!court || !hour) return 0;

    // đảm bảo lấy đúng giờ
    const h = Number(hour);

    let pricePerHour = court.price;

    if (h >= 17) {
      pricePerHour = Math.floor(court.price * 1.3);
    }

    return pricePerHour * duration;
  };

  const adminPhone = "0339310915"; // 👉 thay bằng số thật của bạn
  
  // ✅ Sửa lại biến depositAmount để không bị crash khi selectedCourt là null
  const depositAmount = (selectedCourt && selectedHour)
    ? Math.floor(calculatePrice(selectedCourt, selectedHour, duration) * 0.5)
    : 0;

  // ✅ Sửa hàm isSlotBooked để an toàn hơn
  const isSlotBooked = (courtId, date, hour) => {
    if (!courtId || !date || !hour) return false; 
    return bookingRequests.some(req => 
      req.courtId === courtId && 
      req.date === date && 
      req.hour === hour &&
      req.status !== "rejected"
    );
  };
  

  <BookingHistory
  bookingHistory={bookingHistory}
  setBookingHistory={setBookingHistory}
/>

  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatar") || null
  );

  const [accounts, setAccounts] = useState(
    JSON.parse(localStorage.getItem("accounts")) || []
  );
  const [showUserMenu, setShowUserMenu] = useState(false);


    // --- BỔ SUNG STATES CHO ĐẶT SÂN & DOANH THU ---
  // --- BỔ SUNG STATES CHO ĐẶT SÂN & DOANH THU ---
  const [bookings, setBookings] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // ✅ KHAI BÁO bookingRequests TRƯỚC
  const [bookingRequests, setBookingRequests] = useState(
    
    JSON.parse(localStorage.getItem("bookingRequests")) || []
  );

  const cancelBooking = (id) => {
  const updated = bookingRequests.filter(req => req.id !== id);

  setBookingRequests(updated);
  localStorage.setItem("bookingRequests", JSON.stringify(updated));
};

  // 🔔 THÔNG BÁO ADMIN
  const [showNotification, setShowNotification] = useState(false);

  const unreadCount = bookingRequests.filter(
    req => req.status === "pending"
  ).length;

  useEffect(() => {
    const savedOtp = localStorage.getItem("generatedOtp");
    if (savedOtp) {
      setGeneratedOtp(savedOtp);
    }
  }, []);
  useEffect(() => {

    const saved = localStorage.getItem("notifications");

    if (saved) {
      setNotifications(JSON.parse(saved));
    }

  }, []);

  const addNotification = (message) => {

    const newNoti = {
      id: Date.now(),
      message: message,
      time: new Date().toLocaleString(),
      read: false
    };

    const updated = [newNoti, ...notifications];

    setNotifications(updated);

    localStorage.setItem(
      "notifications",
      JSON.stringify(updated)
    );

  };
  // Ví dụ nếu bạn có dòng nào tương tự thế này:
  // console.log(selectedCourt.id) -> Sẽ lỗi nếu chưa chọn sân
  // Hãy sửa thành:
  if (selectedCourt) {
    console.log(selectedCourt.id);
  }
  // Hoặc dùng: selectedCourt?.id

    // --- 2. DỮ LIỆU BANNER ---
    const bannerData = [
      {
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
        title: "NÂNG TẦM <span style='color: #fdb913;'>TRẢI NGHIỆM</span>",
        desc: "Hệ thống sân bãi đạt chuẩn thi đấu quốc tế BWF."
      },
      {
        image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=2070",
        title: "SÂN CHƠI <span style='color: #fdb913;'>ĐẲNG CẤP</span>",
        desc: "Ánh sáng chống chói, thảm Yonex cao cấp bảo vệ khớp gối."
      },
      {
        image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2070",
        title: "DỊCH VỤ <span style='color: #fdb913;'>CHUYÊN NGHIỆP</span>",
        desc: "Đặt sân trực tuyến dễ dàng, phục vụ 24/7."
      }
    ];

    
    useEffect(() => {

    const savedAvatar = localStorage.getItem("avatar");

    if (savedAvatar) {
      setAvatar(savedAvatar);
    }

  }, []);
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (!event.target.closest(".user-avatar-wrapper")) {
        setShowUserMenu(false);
      }

    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };

  }, []);
    useEffect(() => {

    const data = JSON.parse(
      localStorage.getItem("bookingRequests")
    ) || [];

    setBookingRequests(data);

  }, []);
    // --- 3. EFFECTS ---
    useEffect(() => {
    setCourts([
      {
        id: 1,
        name: "SÂN SỐ 01 - VIP",
        price: 200000,
        desc: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.",
        status: "Trống",
        image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg"
      },
      {
        id: 2,
        name: "SÂN SỐ 02 - CHUẨN",
        price: 120000,
        desc: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.",
        status: "Trống",
        image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg"
      },
      {
        id: 3,
        name: "SÂN SỐ 03 - THƯỜNG",
        price: 100000,
        desc: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.",
        status: "Trống",
        image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg"
      },
      {
        id: 4,
        name: "SÂN SỐ 04 - VIP",
        price: 200000,
        desc: "Sân VIP mới, không gian rộng, ánh sáng chống chói.",
        status: "Trống",
        image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg"
      }
    ]);
  }, []);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }, [bannerData.length]);

    const [registerData, setRegisterData] = useState({
    username: "",
    phone: "",
    password: "",
    otp: ""
  });
  const handleSendOtp = () => {

    if (!registerData.phone) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    setGeneratedOtp(otp);
    setOtpSent(true);

    localStorage.setItem("generatedOtp", otp);

    alert("Mã OTP của bạn là: " + otp);
  };

  

  // ==== DANH SÁCH GIỜ CHƠI ====
  const timeSlots = [
    "08:00","09:00","10:00",
    "14:00","15:00","16:00",
    "17:00","18:00","19:00",
    "20:00","21:00"
  ];

  // ==== GIỜ ĐÃ ĐẶT (mẫu / chưa connect DB) ====
  const bookedSlots = {
    // ví dụ: ngày 2026-03-02 đã có người đặt 07 & 08
    "2026-03-02": ["07:00","08:00","18:00"],
    "2026-03-03": ["17:00","19:00"]
  };

    // --- 4. HANDLERS ---
    const nextSlide = () => setCurrentSlide(currentSlide === bannerData.length - 1 ? 0 : currentSlide + 1);
    const prevSlide = () => setCurrentSlide(currentSlide === 0 ? bannerData.length - 1 : currentSlide - 1);
    const toggleFavorite = (courtId) => {
    if (favorites.includes(courtId)) {
      setFavorites(favorites.filter(id => id !== courtId));
    } else {
      setFavorites([...favorites, courtId]);
    }
  };
    const [schedule, setSchedule] = useState({
    3: {
      "2026-02-26": {
        "08": "Đã đặt",
        "18": "Trống"
      }
    }
  });
  useEffect(() => {
  localStorage.setItem("schedule", JSON.stringify(schedule));
}, [schedule]);

    const handleLogin = (e) => {

    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    // admin mặc định
    if (username === "admin" && password === "admin") {

      const adminUser = {
        name: "Quản trị viên",
        role: "admin"
      };

      setUser(adminUser);
      setIsLoggedIn(true);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(adminUser)
      );

      setPage("admin");

      return;
    }

    // --- Bổ sung logic kiểm tra giờ đã được đặt chưa ---
  const isSlotBooked = (courtId, date, hour) => {
    // Kiểm tra trong danh sách bookingRequests (hoặc bookings) 
    // xem có đơn nào trùng ID sân, ngày và giờ mà trạng thái không phải là 'rejected' không
    return bookingRequests.some(req => 
      req.courtId === courtId && 
      req.date === date && 
      req.hour === hour &&
      req.status !== "rejected" // Chỉ chặn nếu đang chờ duyệt hoặc đã duyệt
    );
  };
  {/* Trong phần Modal chọn giờ của bạn */}
  <div className="booking-status">
    {selectedDate && selectedHour && isSlotBooked(selectedCourt.id, selectedDate, selectedHour) ? (
      <div style={{
        color: "#dc2626", 
        background: "#fee2e2", 
        padding: "10px", 
        borderRadius: "8px",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: "10px"
      }}>
        ❌ Khung giờ này đã có khách đặt trước. <br/> Vui lòng chọn giờ hoặc ngày khác!
      </div>
    ) : (
      <div style={{color: "green", marginTop: "10px"}}>
        ● Khung giờ còn trống
      </div>
    )}
  </div>
  // --- Sửa lại hàm gửi yêu cầu đặt sân để lưu đủ thông tin ---
  const guiYeuCauDatSan = (court) => {
    if (!court) return; // Bảo vệ nếu court bị null

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Vui lòng đăng nhập trước!");
      return;
    }

    const newRequest = {
      id: Date.now(),
      customerName: currentUser.name,
      courtId: court.id,
      courtName: court.name,
      date: selectedDate,
      hour: selectedHour,
      total: calculatePrice(court, selectedHour, duration),
      status: "pending"
    };

    const updated = [...bookingRequests, newRequest];
    setBookingRequests(updated);
    localStorage.setItem("bookingRequests", JSON.stringify(updated));
    
    addNotification(`Yêu cầu đặt ${court.name} vào ${selectedHour}:00 ngày ${selectedDate} thành công!`);
    setShowSuccessModal(true);
  };

    const account = accounts.find(
      acc =>
        acc.username === username &&
        acc.password === password
    );

    if (!account) {
      alert("Sai tài khoản hoặc mật khẩu!");
      return;
    }

    const loggedUser = {
      name: account.username,
      role: "customer"
    };

    setUser(loggedUser);

    setIsLoggedIn(true);

    localStorage.setItem(
      "currentUser",
      JSON.stringify(loggedUser)
    );

    setPage("home");

  };
    const duyet = (id) => {

    const updated = bookingRequests.map(item =>
      item.id === id
        ? {...item, status: "approved"}
        : item
    );

    setBookingRequests(updated);

    localStorage.setItem("bookingRequests", JSON.stringify(updated));
  };

  const tuChoi = (id) => {

    const updated = bookingRequests.filter(item =>
      item.id !== id
    );

    setBookingRequests(updated);

    localStorage.setItem("bookingRequests", JSON.stringify(updated));
  };

    // --- BỔ SUNG LOGIC ĐẶT SÂN ---
const handleBooking = (court) => {

  if (!selectedDate || !selectedHour) {
    alert("Vui lòng chọn ngày và giờ!");
    return;
  }

  const hours = [
    "05","06","07","08","09","10","11","12",
    "13","14","15","16","17","18","19","20","21"
  ];

  const startIndex = hours.indexOf(selectedHour);

  let total = 0;

  for (let i = 0; i < duration; i++) {
    const hour = hours[startIndex + i];
    const hourNumber = Number(hour);

    const price =
      hourNumber >= 17
        ? Math.floor(court.price * 1.3)
        : court.price;

    total += price;
  }

  const newRequest = {
    id: Date.now(),
    courtId: court.id,
    courtName: court.name,
     phone: user.phone,
    date: selectedDate,
    hour: selectedHour,
    duration: duration,
    total: total,
    status: "pending",
    customerName: user.name
  };

  setBookingRequests(prev => [...prev, newRequest]);

  alert("Đặt sân thành công!");

  setSelectedCourt(null);
  setSelectedDate("");
  setSelectedHour("");
  setDuration(1);
};

    // --- BỔ SUNG LOGIC DUYỆT ĐƠN (ADMIN) ---
    const approveBooking = (bookingId, courtName, price) => {
      setBookings(bookings.map(b => b.id === bookingId ? {...b, status: "Thành công"} : b));
      setTotalRevenue(prev => prev + price);
      setCourts(courts.map(c => c.name === courtName ? {...c, status: "Đang sử dụng"} : c));
      alert("Đã duyệt đơn và cộng doanh thu!");
    };

    const handleSaveCourt = () => {
    setCourts(
      courts.map(c =>
        c.id === editingCourt.id ? editingCourt : c
      )
    );
    setEditingCourt(null);
  };

  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = (e, courtId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof({
        ...paymentProof,
        [courtId]: reader.result
      });
    };
    reader.readAsDataURL(file);
  };
  const handleRegister = (e) => {

    e.preventDefault();

    const { username, phone, password, otp } = registerData;

    // kiểm tra OTP
    if (otp !== generatedOtp) {
      alert("OTP không đúng!");
      return;
    }

    // kiểm tra trùng username
    const exists = accounts.find(acc => acc.username === username);

    if (exists) {
      alert("Tên tài khoản đã tồn tại!");
      return;
    }

    // tạo tài khoản mới
    const newAccount = {
      username,
      phone,
      password,
      role: "customer"
    };

    const updatedAccounts = [...accounts, newAccount];

    setAccounts(updatedAccounts);

    localStorage.setItem(
      "accounts",
      JSON.stringify(updatedAccounts)
    );

    alert("Đăng ký thành công!");

    setAuthMode("login");
  };

    // --- 5. RENDER FUNCTIONS ---
    const renderHero = () => (
      <section className="hero-slider">
        {bannerData.map((slide, index) => (
          <div 
            className={`slide-item ${index === currentSlide ? 'active' : ''}`} 
            key={index}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${slide.image})` }}
          >
            <div className="hero-overlay">
              <h1 style={{color: '#fff'}} dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
              <p style={{color: '#eee', fontSize: '1.2rem'}}>{slide.desc}</p>
              <button className="btn-primary pulse">ĐẶT SÂN NGAY</button>
            </div>
          </div>
        ))}
        <button className="slide-arrow prev" onClick={prevSlide}>&#10094;</button>
        <button className="slide-arrow next" onClick={nextSlide}>&#10095;</button>
        {editingCourt && (
    <div className="edit-modal">
      <h3>SỬA THÔNG TIN SÂN</h3>

      <label>Tên sân</label>
      <input
        value={editingCourt.name}
        onChange={(e) =>
          setEditingCourt({ ...editingCourt, name: e.target.value })
        }
      />

      <label>Giá / giờ</label>
      <input
        type="number"
        value={editingCourt.price}
        onChange={(e) =>
          setEditingCourt({ ...editingCourt, price: Number(e.target.value) })
        }
      />

      <label>Trạng thái</label>
      <select
        value={editingCourt.status}
        onChange={(e) =>
          setEditingCourt({ ...editingCourt, status: e.target.value })
        }
      >
        <option>Trống</option>
        <option>Đang sử dụng</option>
        <option>Đang bảo trì</option>
      </select>

      <div style={{ marginTop: '10px' }}>
        <button
          style={{ background: 'var(--green)', color: '#fff', marginRight: '10px' }}
          onClick={handleSaveCourt}
        >
          Lưu
        </button>
        <button onClick={() => setEditingCourt(null)}>Hủy</button>
      </div>
    </div>
  )}

      </section>
    );

    // --- 6. LOGIC HIỂN THỊ AUTH (KHÁCH HÀNG ĐĂNG NHẬP/ĐĂNG KÝ) ---
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
                  <form className="auth-actual-form" onSubmit={handleLogin}>
                    <h2 style={{color: '#00a651'}}>CHÀO MỪNG TRỞ LẠI</h2>
                    <div className="input-field">
                      <label style={{color: '#000'}}>Tên đăng nhập / Số điện thoại</label>
                      <input type="text" name="username" placeholder="Nhập admin để vào quản lý" required />
                    </div>
                    <div className="input-field">
                      <label style={{color: '#000'}}>Mật khẩu</label>
                      <input 
    type="password" 
    name="password"
    placeholder="••••••••" 
    required 
  />
                    </div>
                    <button type="submit" className="btn-auth-submit">ĐĂNG NHẬP NGAY</button>
                    <p className="auth-switch">Chưa có tài khoản? <span onClick={() => setAuthMode('register')}>Đăng ký miễn phí</span></p>
                  </form>
                ) : (
                  <form className="auth-actual-form" onSubmit={handleRegister}>

  <h2 style={{color: '#00a651'}}>ĐĂNG KÝ THÀNH VIÊN</h2>

  <div className="input-field">
  <label>Tên tài khoản</label>
  <input
  type="text"
  required
  value={registerData.username}
  onChange={(e) =>
  setRegisterData({
  ...registerData,
  username: e.target.value
  })
  }
  />
  </div>

  <div className="input-field">
  <label>Số điện thoại</label>

  <div className="phone-otp-group">

  <input
  type="tel"
  required
  value={registerData.phone}
  onChange={(e) =>
  setRegisterData({
  ...registerData,
  phone: e.target.value
  })
  }
  />

  <button
  type="button"
  className="btn-send-otp"
  onClick={handleSendOtp}
  >
  {otpSent ? "GỬI LẠI" : "GỬI MÃ"}
  </button>

  </div>
  </div>

  {otpSent && (
  <div className="input-field">

  <label>OTP</label>

  <input
  type="text"
  required
  value={registerData.otp}
  onChange={(e) =>
  setRegisterData({
  ...registerData,
  otp: e.target.value
  })
  }
  />

  </div>
  )}

  <div className="input-field">

  <label>Mật khẩu</label>

  <input
  type="password"
  required
  value={registerData.password}
  onChange={(e) =>
  setRegisterData({
  ...registerData,
  password: e.target.value
  })
  }
  />

  </div>

  <button type="submit" className="btn-auth-submit yellow-variant">
  HOÀN TẤT ĐĂNG KÝ
  </button>

  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- 7. GIAO DIỆN CHÍNH ---
    return (
      <div className="container">
        <header className="header">
          <div className="logo" onClick={() => setPage('home')}>KONTUM <span>BADMINTON</span></div>
          <nav className="main-nav">
            <ul>
              <li onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>TRANG CHỦ</li>
              {(!isLoggedIn || user.role === 'customer') && (
  <li 
    onClick={() => setPage('contact')} 
    className={page === 'contact' ? 'active' : ''}
  >
    LIÊN HỆ
  </li>
)}
              {isLoggedIn && user.role === 'customer' && (
                <li onClick={() => setPage('my-bookings')} className={page === 'my-bookings' ? 'active' : ''}>LỊCH SỬ ĐẶT SÂN</li>
                
              )}
              {isLoggedIn && user.role === 'customer' && (
    <li
      onClick={() => setPage('notifications')}
      className={page === 'notifications' ? 'active' : ''}
    >
      🔔 THÔNG BÁO
    </li>
  )}
              {isLoggedIn && user.role === 'admin' && (
                <li onClick={() => setPage('admin')} className={page === 'admin' ? 'active' : ''} style={{color: 'red', fontWeight: 'bold'}}>QUẢN TRỊ</li>
              )}
            </ul>
          </nav>
          
          <div className="header-auth-section">

    {/* 🔔 CHUÔNG THÔNG BÁO - CHỈ HIỆN CHO ADMIN */}
    {isLoggedIn && user?.role === "admin" && (
  <div className="notification-wrapper">

    <div
      className="notification-icon"
      onClick={() =>
        setShowNotification(!showNotification)
      }
    >
      🔔

      {notifications.filter(n => !n.read).length > 0 && (
        <span className="notification-badge">
          {notifications.filter(n => !n.read).length}
        </span>
      )}

    </div>

    {showNotification && (
      <div className="notification-dropdown">

        {notifications.length === 0 ? (
          <div className="notification-item">
            Không có thông báo
          </div>
        ) : (

          notifications.map(n => (

            <div
              key={n.id}
              className="notification-item"
            >
              <div>{n.message}</div>
              <small>{n.time}</small>
            </div>

          ))

        )}

      </div>
    )}

  </div>
    )}
            {isLoggedIn ? (

    <div className="user-avatar-wrapper">

      {/* AVATAR */}
      <div
        className="user-avatar"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        {avatar ? (
          <img src={avatar} alt="avatar" />
        ) : (
      <div className="avatar-placeholder">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="22"
      viewBox="0 0 24 24"
      width="22"
      fill="white"
    >
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 
              2.3-5 5 2.3 5 5 5zm0 
              2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
    </svg>
  </div>
        )}
      </div>

      {/* MENU */}
      {showUserMenu && (
        <div className="user-menu">

          {/* đổi avatar */}
          <label className="menu-item upload-avatar">
            📷 Đổi ảnh đại diện
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {

                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();

                reader.onloadend = () => {

                  setAvatar(reader.result);

                  localStorage.setItem(
                    "avatar",
                    reader.result
                  );

                };

                reader.readAsDataURL(file);

              }}
            />
          </label>

          {/* tên user */}
          <div className="menu-item">
            👤 {user?.name}
          </div>

          {/* logout */}
          <div
            className="menu-item logout"
            onClick={() => {

              setIsLoggedIn(false);
              setUser(null);
              setAvatar(null);
              localStorage.removeItem("avatar");

              setShowUserMenu(false);
              setPage("home");

            }}
          >
            🚪 Đăng xuất
          </div>

        </div>
      )}

    </div>

  ) : (
              <div className="auth-buttons">
    <button
      className="btn-login"
      onClick={() => {
        setPage('auth');
        setAuthMode('login');
      }}
    >
      ĐĂNG NHẬP
    </button>

    <button
      className="btn-signup"
      onClick={() => {
        setPage('auth');
        setAuthMode('register');
      }}
    >
      ĐĂNG KÝ
    </button>
  </div>
            )}
          </div>
        </header>

        <main className="main-content fade-in">
          {page === 'home' && (
            <>
              {renderHero()}
              <section className="court-section">
                <div className="court-grid">
    {courts.map(court => (
    <CourtCard
    key={court.id}
    court={court}
    favorites={favorites}      // 👈 DÒNG NÀY
    toggleFavorite={toggleFavorite}
      onViewCourt={(court) => {

        if (!isLoggedIn) {
          setShowLoginNotice(true);
          return;
        }

        setSelectedCourt(court);
      }}
    />
  ))}
  </div>
              </section>
            </>
          )}

{page === 'my-bookings' && (
  <BookingHistory
  bookingRequests={bookingRequests}
  user={user}
  cancelBooking={cancelBooking}
  adminPhone={adminPhone}
/>
)}
          {page === 'notifications' && isLoggedIn && user.role === 'customer' && (
    <section style={{padding:'50px 10%'}}>

      <h2 style={{color:'var(--green)', marginBottom:'20px'}}>
        🔔 THÔNG BÁO CỦA BẠN
      </h2>

      {notifications.length === 0 ? (

        <div className="empty-noti">
          Bạn chưa có thông báo nào
        </div>

      ) : (

        <div className="notification-page">

          {notifications.map(n => (

            <div key={n.id} className="notification-card">

              <div className="noti-icon">
                🔔
              </div>

              <div className="noti-content">

                <div className="noti-message">
                  {n.message}
                </div>

                <div className="noti-time">
                  {n.time}
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  )}

              {page === 'admin' && isLoggedIn && user.role === 'admin' && (
  <section className="admin-dashboard">
    <h2 style={{textAlign: 'center', color: '#00a651'}}>
      BẢNG QUẢN LÝ SÂN (ADMIN)
    </h2>

    <div className="admin-header-stats">
      <div className="stat-box">
        <h4>4</h4>
        <p>Tổng sân</p>
      </div>

      <div className="stat-box active-stat">
        <h4>{courts.filter(c => c.status === 'Trống').length}</h4>
        <p>Sân trống</p>
      </div>

      <div className="stat-box yellow-stat">
        <h4>{totalRevenue.toLocaleString()}đ</h4>
        <p>Doanh thu/Ngày</p>
      </div>
    </div>

    {/* 👇 GỌI COMPONENT ADMIN */}
    <AdminBookingRequests
      bookingRequests={bookingRequests}
      setBookingRequests={setBookingRequests}
      setTotalRevenue={setTotalRevenue}
    />

  </section>
)}
        </main>

        <footer className="footer">
    <div className="f-logo">
      KONTUM <span>BADMINTON GROUP</span>
    </div>

    <p>🏢 Địa chỉ: 704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam</p>
    <p>📞 Hotline: 0339 310 915</p>
    <p>📧 Email: kontumbadminton@gmail.com</p>
    <p>🕒 Giờ hoạt động: 05:00 - 22:00 (Tất cả các ngày trong tuần)</p>
  </footer>
  {showLoginNotice && (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🔒 Yêu cầu đăng nhập</h3>
        <p>Vui lòng đăng nhập để đặt sân.</p>

        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={() => setShowLoginNotice(false)}
          >
            Đóng
          </button>

          <button
            className="btn-confirm"
            onClick={() => {
              setShowLoginNotice(false);
              setPage('auth');
              setAuthMode('login');
            }}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
    
  )}
     <BookingModal
  selectedCourt={selectedCourt}
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  selectedHour={selectedHour}
  setSelectedHour={setSelectedHour}
  duration={duration}
  setDuration={setDuration}   // ⚠️ BẮT BUỘC PHẢI CÓ
  showDepositStep={showDepositStep}
  setShowDepositStep={setShowDepositStep}
  handleUpload={handleUpload}
  paymentProof={paymentProof}
  handleBooking={handleBooking}
  schedule={schedule}
  setSelectedCourt={setSelectedCourt}
/>
  {showSuccessPopup && (
    <SuccessPopup
      onClose={() => setShowSuccessPopup(false)}
    />
  )}
      </div>
    );
    
  }

  export default App;
