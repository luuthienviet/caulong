import React, { useState } from 'react';
import API from '../../api';

export default function Register({ setPage, setAuthMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const sanitizeUsername = (val) => {
    return val
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone && !/^0\d{9}$/.test(phone)) {
      return alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số, bắt đầu bằng 0');
    }
    try {
      await API.post('/auth/register', { username, password, email, phone });
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
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(sanitizeUsername(e.target.value))} 
          placeholder="viết thường, không dấu, viết liền"
          required 
        />
        <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
          * Tên tài khoản phải viết thường, không dấu và không có khoảng cách
        </small>
      </div>
      <div className="input-field">
        <label>Số điện thoại</label>
        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ví dụ: 0393109152" required />
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
