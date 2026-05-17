import AdminLogin from "../components/auth/Adminlogin";

const AdminLoginPage = ({ setPage }) => {
    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <h1>👑 KONTUM BADMINTON</h1>
                        <p>Trang quản trị hệ thống</p>
                    </div>
                    <AdminLogin setPage={setPage} />
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;