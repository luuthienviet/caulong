import React from "react";

export default function Header({
  isLoggedIn,
  user,
  setPage,
  setAuthMode,
  setIsLoggedIn,
  setUser,
  setShowUserMenu
}) {

  return (
    <header className="header">
      <div className="logo" onClick={() => setPage('home')}>KONTUM <span>BADMINTON</span></div>
      <nav className="main-nav">
        <ul>
          <li onClick={() => setPage('home')}>TRANG CHỦ</li>
          <li onClick={() => setPage('contact')}>LIÊN HỆ</li>
          {isLoggedIn && user.role === "customer" && (
            <li onClick={() => setPage("my-bookings")}>LỊCH SỬ ĐẶT SÂN</li>
          )}
          {isLoggedIn && user.role === "customer" && (
            <li onClick={() => setPage('notifications')}>🔔 THÔNG BÁO</li>
          )}
          {isLoggedIn && user.role === "admin" && (
            <li onClick={() => setPage("admin")} style={{color:'red'}}>QUẢN TRỊ</li>
          )}
        </ul>
      </nav>

      <div className="auth-section">
        {isLoggedIn ? (
          <div className="header-user" onClick={() => setShowUserMenu(true)}>
            👤 {user.name}
          </div>
        ) : (
          <>
            <button className="btn-login" onClick={() => {
              setPage('auth');
              setAuthMode("login");
            }}>ĐĂNG NHẬP</button>
            <button className="btn-signup" onClick={() => {
              setPage('auth');
              setAuthMode("register");
            }}>ĐĂNG KÝ</button>
          </>
        )}
      </div>
    </header>
  );
}