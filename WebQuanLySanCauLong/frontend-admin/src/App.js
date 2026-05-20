import { useState, useEffect, useContext } from 'react';
import AdminLoginPage from "./pages/Adminloginpage";
import { AuthContext } from './AuthContext';
import AdminDashboardModern from "./pages/AdminDashboardModern";
import CourtEditModal from "./components/courts/CourtEditModal";
import NotificationsPage from "./pages/NotificationsPage";
import ScheduleViewer from "./components/courts/ScheduleViewer";
import API from './api';
import './App.css';
import './styles/dashboard.css';

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
      name: typeof c.name === 'string' ? c.name : 'Unknown Court',
      price: typeof c.price === 'number' ? c.price : Number(c.price) || 0,
      desc: typeof c.description === 'string' ? c.description : (typeof c.desc === 'string' ? c.desc : ''),
      status: typeof c.status === 'string' ? c.status : 'Trống',
      image: typeof c.image === 'string' ? c.image : ''
    }))
    .filter((court) => {
      const key = court.id || court.name;
      if (uniqueMap.has(key)) return false;
      uniqueMap.set(key, true);
      return true;
    });

  const sourceByName = new Map(formattedSource.map(court => [court.name, court]));
  const defaultNames = new Set(defaultCourts.map(dc => dc.name));
  const sortedDefault = defaultCourts.map(defaultCourt => ({
    ...defaultCourt,
    ...sourceByName.get(defaultCourt.name)
  }));

  const extras = formattedSource
    .filter(court => !defaultNames.has(court.name))
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
  const [page, setPage] = useState('login');
  const [courts, setCourts] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const { user, login, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  // eslint-disable-next-line
  const [, setTotalRevenue] = useState(0);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = Boolean(user && ['admin', 'manager', 'staff'].includes(user.role));

  // === KHỞI TẠO SÂN TỪ API ===
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await API.get('/courts');
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

  // Redirect to login if not admin
  useEffect(() => {
    if (user && ['admin', 'manager', 'staff'].includes(user.role)) {
      if (page === 'login') setPage('reports');
    } else if (user && !['admin', 'manager', 'staff'].includes(user.role)) {
      alert('Bạn không có quyền truy cập trang quản trị!');
      logout();
      setPage('login');
    }
  }, [user, page]);

  // === ADMIN PROFILE ===
  const handleOpenAdminProfile = () => {
    if (!user) return;
    setAdminDisplayName(user.name || user.username || '');
    setAdminEmail(user.email || '');
    setShowAdminProfile(true);
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
    setShowAdminProfile(false);
    setShowCourtModal(false);
    setEditingCourt(null);
    setPage('login');
    setNotifications([]);
  };

  // === COURT MANAGEMENT ===
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
      setTotalRevenue(revenue);
    } catch (err) {
      console.error('Lỗi lấy tất cả booking:', err);
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

  const approveBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'approved' });
      await fetchAllBookings();
    } catch (err) {
      console.error('Lỗi duyệt:', err);
      alert('Duyệt thất bại!');
    }
  };

  const rejectBooking = async (id, reason) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'rejected', reason });
      await fetchAllBookings();
    } catch (err) {
      console.error('Lỗi từ chối:', err);
      alert('Từ chối thất bại!');
    }
  };

  const cancelBooking = async (id) => {
    try {
      await API.delete(`/bookings/${id}`);
      await fetchAllBookings();
    } catch (err) {
      console.error('Lỗi hủy:', err);
    }
  };

  const clearOldBookings = () => {
    fetchAllBookings();
  };

  // === EFFECTS ===
  useEffect(() => {
    if (!user || !['admin', 'manager', 'staff'].includes(user.role)) return;
    fetchAllBookings();
    fetchUsers();
  }, [user]);

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
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'staff' && ['staff', 'customers', 'payments'].includes(page)) {
      setPage('schedule');
    }
  }, [page, user]);

  // Login page
  if (!isAdmin || page === 'login') {
    return <AdminLoginPage setPage={setPage} />;
  }

  // Admin Dashboard
  return (
    <div className="admin-app">
      {/* Admin Header */}
      <header className="admin-header-bar">
        <div className="admin-header-left">
          <h1 className="admin-brand" onClick={() => setPage('reports')}>
            👑 <span className="logo-brand">LTV</span> <span>ADMIN</span>
          </h1>
        </div>
        <nav className="admin-nav">
          <button className={page === 'courts' ? 'active' : ''} onClick={() => setPage('courts')}>🏸 Quản lý sân</button>
          <button className={page === 'schedule' ? 'active' : ''} onClick={() => setPage('schedule')}>📅 Lịch sân</button>
          <button className={page === 'bookings' ? 'active' : ''} onClick={() => setPage('bookings')}>📋 Quản lý đặt sân</button>
          {user?.role !== 'staff' && (
            <button className={page === 'customers' ? 'active' : ''} onClick={() => setPage('customers')}>👥 Khách hàng</button>
          )}
          {user?.role !== 'staff' && (
            <button className={page === 'staff' ? 'active' : ''} onClick={() => setPage('staff')}>👷 Nhân viên</button>
          )}
          <button className={page === 'services' ? 'active' : ''} onClick={() => setPage('services')}>🛒 Dịch vụ</button>
          {user?.role !== 'staff' && (
            <button className={page === 'payments' ? 'active' : ''} onClick={() => setPage('payments')}>💳 Thanh toán</button>
          )}
          <button className={page === 'reports' ? 'active' : ''} onClick={() => setPage('reports')}>📈 Báo cáo</button>
          <button className={page === 'feedback' ? 'active' : ''} onClick={() => setPage('feedback')}>⭐ Phản hồi</button>
        </nav>
        <div className="admin-header-right-wrapper" style={{ position: 'relative' }}>
          <div 
            className={`admin-user-info ${userMenuOpen ? 'active' : ''}`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="admin-avatar">
              {avatar ? <img src={avatar} alt="admin" /> : <span>👤</span>}
            </div>
            <div className="admin-user-text">
              <strong>{user?.name || user?.username}</strong>
              <small style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                <span style={{ fontSize: '7px', opacity: 0.6 }}>▼</span>
              </small>
            </div>
          </div>

          {/* Premium Admin Dropdown Menu */}
          {userMenuOpen && (
            <div className="admin-dropdown-menu">
              <div className="admin-dropdown-header">
                <strong>{user?.name || user?.username}</strong>
                <span>{user?.email || 'admin@kontumbadminton.vn'}</span>
              </div>
              <div className="admin-dropdown-divider" />
              <button 
                className="admin-dropdown-item" 
                onClick={() => {
                  setUserMenuOpen(false);
                  handleOpenAdminProfile();
                }}
              >
                👤 Thông tin cá nhân
              </button>
              <button 
                className="admin-dropdown-item logout" 
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {['dashboard', 'bookings', 'customers', 'payments', 'reports', 'staff', 'services', 'feedback'].includes(page) && (
          <AdminDashboardModern
            bookingRequests={bookingRequests}
            users={users}
            approveBooking={approveBooking}
            rejectBooking={rejectBooking}
            deleteBooking={cancelBooking}
            clearOldBookings={clearOldBookings}
            courts={courts}
            setCourts={setCourts}
            refreshBookings={fetchAllBookings}
            refreshUsers={fetchUsers}
            user={user}
            setPage={setPage}
            page={page}
            showHeader={false}
          />
        )}

        {page === 'schedule' && (
          <div className="schedule-page-wrapper">
            <ScheduleViewer
              courts={courts}
              bookingRequests={bookingRequests}
              refreshBookings={fetchAllBookings}
            />
          </div>
        )}

        {page === 'courts' && (
          <div className="courts-management-page">
            <div className="courts-page-header">
              <h2>🏸 Quản lý sân cầu lông</h2>
              {user?.role !== 'staff' && (
                <button className="btn-add-court" onClick={handleAddNewCourt}>
                  ➕ Thêm sân mới
                </button>
              )}
            </div>
            <div className="courts-grid-admin">
              {courts.map(court => (
                <div key={court.id} className="court-admin-card">
                  <img src={court.image} alt={court.name} />
                  <div className="court-admin-info">
                    <h3>{court.name}</h3>
                    <p>{court.desc}</p>
                    <div className="court-admin-meta">
                      <span className="price">{court.price?.toLocaleString()}đ/giờ</span>
                      <span className={`status ${court.status === 'Trống' ? 'free' : 'busy'}`}>
                        {court.status}
                      </span>
                    </div>
                    {user?.role !== 'staff' && (
                      <button
                        className="btn-edit-court"
                        onClick={() => handleOpenEditCourt(court)}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            onBack={() => setPage('reports')}
            onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
            onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            onClear={() => setNotifications([])}
            onNotificationClick={() => { }}
          />
        )}
      </main>

      {/* Court Edit Modal */}
      {showCourtModal && (
        <CourtEditModal
          court={editingCourt}
          onSave={handleSaveCourt}
          onClose={() => setShowCourtModal(false)}
        />
      )}

      {/* Admin Profile Modal */}
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
                <span>Vai trò:</span> <strong>Quản trị viên</strong>
              </div>
            </div>

            <div className="admin-profile-actions">
              <button className="btn-secondary" onClick={handleLogout}>🚪 Đăng xuất</button>
              <button className="btn-primary" onClick={handleAdminProfileSave}>💾 Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;