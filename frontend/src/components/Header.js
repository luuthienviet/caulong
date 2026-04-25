import React from "react";

export default function Header({
  isLoggedIn,
  user,
  setPage,
  setAuthMode,
  setIsLoggedIn,
  page,
  setUser,
  setShowUserMenu,
  notifications,
  showNotification,
  setShowNotification
}) {
  return (
    <header className="header">
      <div className="logo" onClick={() => setPage('home')}>KONTUM <span>BADMINTON</span></div>
      <nav className="main-nav">
        <ul>
          <li onClick={() => setPage('home')} className={setPage === 'home' ? 'active' : ''}>TRANG CHỦ</li>
          
          {/* Menu cho customer */}
          {isLoggedIn && user?.role === 'customer' && (
            <>
              <li onClick={() => setPage('my-bookings')}>📋 LỊCH SỬ ĐẶT SÂN</li>
              <li onClick={() => setPage('notifications')}>🔔 THÔNG BÁO</li>
            </>
          )}
          
          {/* Menu cho admin */}
          {isLoggedIn && user?.role === 'admin' && (
            <>
              <li onClick={() => setPage('booking-history')}>📋 LỊCH SỬ ĐẶT SÂN</li>
              <li onClick={() => setPage('admin-notifications')}>🔔 THÔNG BÁO</li>
              <li onClick={() => setPage('revenue')}>💰 DOANH THU</li>
              <li onClick={() => setPage('admin')} style={{ color: 'red', fontWeight: 'bold' }}>👑 QUẢN TRỊ</li>
            </>
          )}
          
          {/* Liên hệ */}
          {(!isLoggedIn || user?.role === 'customer') && (
            <li onClick={() => setPage('contact')}>📞 LIÊN HỆ</li>
          )}
        </ul>
      </nav>

      <div className="header-auth-section">
        {/* Thông báo cho admin */}
        {isLoggedIn && user?.role === "admin" && (
          <div className="notification-wrapper">
            <div className="notification-icon" onClick={() => setShowNotification(!showNotification)}>
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
              )}
            </div>
            {showNotification && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <div className="notification-item">Không có thông báo</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <div>{n.message}</div>
                      <small>{n.time}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* User avatar hoặc nút đăng nhập */}
        {isLoggedIn ? (
          <div className="user-avatar-wrapper">
            <div className="user-avatar" onClick={() => setShowUserMenu(true)}>
              {user?.avatar ? <img src={user.avatar} alt="avatar" /> : "👤"}
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="btn-login" onClick={() => { setPage('auth'); setAuthMode('login'); }}>ĐĂNG NHẬP</button>
            <button className="btn-signup" onClick={() => { setPage('auth'); setAuthMode('register'); }}>ĐĂNG KÝ</button>
          </div>
        )}
      </div>
    </header>
  );
}