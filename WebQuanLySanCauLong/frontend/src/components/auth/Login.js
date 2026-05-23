import React, { useContext, useState } from 'react';
import API from '../../api';
import { AuthContext } from '../../AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ setPage, setAuthMode }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      login(user);

      if (user.role === 'admin') {
        setPage('home');
      } else {
        setPage('home');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/google', { token: credentialResponse.credential });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      login(user);
      setPage('home');
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    alert('Đăng nhập Google thất bại');
  };

  return (
    <form onSubmit={handleSubmit} className="auth-actual-form">
      <h2 style={{ color: '#00a651' }}>CHÀO MỪNG TRỞ LẠI</h2>
      <div className="input-field">
        <label>Tên đăng nhập</label>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(sanitizeUsername(e.target.value))} 
          placeholder="viết thường, không dấu, viết liền"
          required 
        />
        <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
          * Tên đăng nhập phải viết thường, không dấu và không có khoảng cách
        </small>
      </div>
      <div className="input-field">
        <label>Mật khẩu</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn-auth-submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
      </div>
      <p className="auth-switch">
        Chưa có tài khoản? <span onClick={() => setAuthMode('register')}>Đăng ký miễn phí</span>
      </p>
      <p className="auth-switch">
        <span onClick={() => setPage('forgot')}>Quên mật khẩu?</span>
      </p>
    </form>
  );
}
