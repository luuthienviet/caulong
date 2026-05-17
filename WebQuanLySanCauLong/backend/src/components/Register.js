import React, { useState } from 'react';
import API from '../api';

export default function Register({ setPage, setAuthMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', { username, password });
      alert('Đăng ký thành công!');
      setAuthMode('login');
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Đăng ký</button>
    </form>
  );
}