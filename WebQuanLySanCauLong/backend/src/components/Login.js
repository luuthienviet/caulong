import React, { useState } from 'react';
import API from '../api';

export default function Login({ setPage, setAuthMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Chuyển hướng dựa trên role
      if (user.role === 'admin') {
        setPage('admin');
      } else {
        setPage('home');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Đăng nhập</button>
      <p>Chưa có tài khoản? <span onClick={() => setAuthMode('register')}>Đăng ký</span></p>
    </form>
  );
}