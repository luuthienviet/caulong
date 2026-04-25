import React, { useState } from 'react';
import API from '../api';

export default function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      setMessage('');
    }
  };

  return (
    <div className="auth-full-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-info-side">
            <div className="auth-logo">KONTUM <span>BADMINTON</span></div>
            <h3>QUÊN MẬT KHẨU</h3>
            <p>Nhập email đăng ký để nhận link đặt lại mật khẩu.</p>
            <button className="btn-back-home" onClick={() => setPage('auth')}>QUAY LẠI</button>
          </div>
          <div className="auth-form-side">
            <form onSubmit={handleSubmit} className="auth-actual-form">
              <h2>Lấy lại mật khẩu</h2>
              <div className="input-field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {message && <p style={{ color: 'green' }}>{message}</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button type="submit" className="btn-auth-submit">GỬI YÊU CẦU</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}