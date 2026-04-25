import React, { useState } from 'react';
import API from '../api';

export default function Register({ setPage, setAuthMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', { username, password, email });
      alert('Đăng ký thành công!');
      setAuthMode('login');
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <form className="auth-actual-form" onSubmit={handleSubmit}>
      <h2 style={{ color: '#00a651' }}>ĐĂNG KÝ THÀNH VIÊN</h2>
      <div className="input-field">
        <label>Tên tài khoản</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="input-field">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="input-field">
        <label>Mật khẩu</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn-auth-submit yellow-variant">HOÀN TẤT ĐĂNG KÝ</button>
    </form>
  );
}