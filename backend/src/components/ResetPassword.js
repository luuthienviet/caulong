import React, { useState } from 'react';
import API from '../api';

export default function ResetPassword({ token, setPage }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => setPage('auth'), 2000);
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
            <h3>ĐẶT LẠI MẬT KHẨU</h3>
            <p>Nhập mật khẩu mới.</p>
          </div>
          <div className="auth-form-side">
            <form onSubmit={handleSubmit} className="auth-actual-form">
              <h2>Mật khẩu mới</h2>
              <div className="input-field">
                <label>Mật khẩu</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="input-field">
                <label>Xác nhận mật khẩu</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              {message && <p style={{ color: 'green' }}>{message}</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button type="submit" className="btn-auth-submit">ĐẶT LẠI</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}