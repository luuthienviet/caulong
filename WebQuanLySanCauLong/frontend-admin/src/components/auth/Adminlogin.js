import React, { useContext, useState } from 'react';
import API from '../../api';
import { AuthContext } from '../../AuthContext';

export default function AdminLogin({ setPage }) {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { username, password });
            const { token, user } = res.data;

            if (!['admin', 'manager', 'staff'].includes(user.role)) {
                alert('Tài khoản này không có quyền truy cập quản trị!');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            login(user);
            setPage('reports');
        } catch (err) {
            alert(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-actual-form">
            <h2 style={{ color: '#00a651' }}>CHÀO MỪNG TRỞ LẠI</h2>
            <div className="input-field">
                <label>Tên đăng nhập</label>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="input-field">
                <label>Mật khẩu</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
            </button>
        </form>
    );
}