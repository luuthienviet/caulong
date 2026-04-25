import React, { useState, useEffect } from 'react';
import API from '../api';
import FooterSettings from "./FooterSettings";

export default function AdminDashboard({ 
  bookingRequests = [], 
  approveBooking, 
  rejectBooking, 
  deleteBooking, 
  clearOldBookings, 
  courts = [], 
  setCourts 
}) {
  const [activeTab, setActiveTab] = useState('revenue');
  const [editingCourt, setEditingCourt] = useState(null);
  const [newCourt, setNewCourt] = useState({ name: '', price: 0, desc: '', image: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [remainingCollected, setRemainingCollected] = useState(() => {
    const saved = localStorage.getItem('remainingCollected');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  const safeCourts = Array.isArray(courts) ? courts.filter(c => c && typeof c === 'object' && c.id) : [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('remainingCollected', JSON.stringify(remainingCollected));
  }, [remainingCollected]);

  const getBookingEndTime = (booking) => {
    if (!booking || !booking.date || !booking.hour) return new Date();
    const [year, month, day] = booking.date.split('-');
    const y = parseInt(year);
    if (isNaN(y) || y < 2020 || y > 2030) {
      console.warn('Năm không hợp lệ:', booking.date);
      return new Date();
    }
    const start = new Date(y, parseInt(month) - 1, parseInt(day), parseInt(booking.hour), 0, 0);
    return new Date(start.getTime() + (booking.duration || 1) * 60 * 60 * 1000);
  };

  const isBookingCompleted = (booking) => {
    if (booking.status !== 'approved') return false;
    return currentTime > getBookingEndTime(booking).getTime();
  };

  const getRemainingTime = (booking) => {
    if (booking.status !== 'approved') return '';
    const remainingMs = getBookingEndTime(booking).getTime() - currentTime;
    if (remainingMs <= 0) return 'Đã kết thúc';
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCourtPlaying = (booking) => {
    if (booking.status !== 'approved') return false;
    const [year, month, day] = booking.date.split('-');
    const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(booking.hour), 0, 0);
    const end = getBookingEndTime(booking);
    return currentTime >= start.getTime() && currentTime < end.getTime();
  };

  const today = new Date().toISOString().split('T')[0];
  const bookingsToday = bookingRequests.filter(b => b.date === today);
  const approvedToday = bookingsToday.filter(b => b.status === 'approved');
  const revenueToday = approvedToday.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalBookingsToday = bookingsToday.length;
  const activeCourts = courts.filter(c => c.status === 'Đang sử dụng').length;
  const totalBookingsAll = bookingRequests.length;

  const getDeposit = (b) => Math.floor((b.total || 0) * 0.5);
  const getRemaining = (b) => (b.total || 0) - getDeposit(b);

  const totalDepositRevenue = bookingRequests.filter(b => b.status === 'approved').reduce((s, b) => s + getDeposit(b), 0);
  const totalRemainingCollected = remainingCollected.reduce((sum, id) => {
    const booking = bookingRequests.find(b => String(b._id || b.id) === String(id));
    return sum + (booking ? getRemaining(booking) : 0);
  }, 0);
  const totalRevenue = totalDepositRevenue + totalRemainingCollected;
  const pendingRemainingBookings = bookingRequests.filter(b => 
    b.status === 'approved' && isBookingCompleted(b) && !remainingCollected.includes(String(b._id || b.id))
  );
  const pendingCount = bookingRequests.filter(b => b.status === 'pending').length;
  const approvedCount = bookingRequests.filter(b => b.status === 'approved').length;

  const getCustomerName = (booking) => {
    if (booking.userId) {
      if (typeof booking.userId === 'object' && booking.userId.username) return booking.userId.username;
      if (typeof booking.userId === 'string') return booking.userId;
    }
    return booking.customerName || 'Khách';
  };

  const handleConfirmRemaining = (booking) => {
    const id = String(booking._id || booking.id);
    if (!remainingCollected.includes(id)) {
      setRemainingCollected([...remainingCollected, id]);
      alert(`Đã thu ${getRemaining(booking).toLocaleString()} VNĐ từ ${getCustomerName(booking)}`);
    }
  };

  const handleApprove = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    setLoading(true);
    try {
      await approveBooking(id);
    } catch (e) {
      alert("Lỗi duyệt!");
    }
    setLoading(false);
  };

  const handleReject = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!rejectReason.trim()) {
      alert('Nhập lý do từ chối');
      return;
    }
    setLoading(true);
    try {
      const fakeQR = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=REFUND_${id}_${booking.total}`;
      setQrCode(fakeQR);
      alert(`Đã từ chối!\nMã QR hoàn tiền:\n${fakeQR}`);
      await rejectBooking(id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      setQrCode('');
    } catch (e) {
      alert("Lỗi từ chối!");
    }
    setLoading(false);
  };

  const handleDelete = async (booking) => {
    const id = booking._id || booking.id;
    if (!id) return;
    if (!window.confirm('Xóa đơn này?')) return;
    setLoading(true);
    try {
      await deleteBooking(id);
    } catch (e) {
      alert("Lỗi xóa!");
    }
    setLoading(false);
  };

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.price) {
      alert('Nhập đủ thông tin sân');
      return;
    }
    setLoading(true);
    try {
      const courtData = {
        name: newCourt.name,
        price: newCourt.price,
        description: newCourt.desc,
        image: newCourt.image,
        status: 'Trống'
      };
      await API.post('/courts', courtData);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setNewCourt({ name: '', price: 0, desc: '', image: '' });
      alert('Thêm sân thành công!');
    } catch (error) {
      console.error('Lỗi thêm sân:', error);
      alert('Thêm sân thất bại!');
    }
    setLoading(false);
  };

  const handleUpdateCourt = async () => {
    if (!editingCourt) return;
    setLoading(true);
    try {
      const courtData = {
        name: editingCourt.name,
        price: editingCourt.price,
        description: editingCourt.desc,
        image: editingCourt.image,
        status: editingCourt.status
      };
      await API.put(`/courts/${editingCourt.id}`, courtData);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      setEditingCourt(null);
      alert('Cập nhật sân thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật sân:', error);
      alert(error.response?.data?.message || 'Cập nhật sân thất bại!');
    }
    setLoading(false);
  };

  const handleDeleteCourt = async (id) => {
    if (!window.confirm('Xóa sân này?')) return;
    setLoading(true);
    try {
      await API.delete(`/courts/${id}`);
      const res = await API.get('/courts');
      setCourts(res.data.data);
      alert('Xóa sân thành công!');
    } catch (error) {
      console.error('Lỗi xóa sân:', error);
      alert('Xóa sân thất bại!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👑 BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h2>
      {loading && <div style={{ background: '#ffc107', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>⏳ Đang xử lý...</div>}

      <div className="dashboard-stats">
        <div className="stat-card"><h3>🏸 Sân đang hoạt động</h3><p>{activeCourts}</p></div>
        <div className="stat-card"><h3>📅 Lịch đặt hôm nay</h3><p>{totalBookingsToday}</p></div>
        <div className="stat-card"><h3>💰 Doanh thu hôm nay</h3><p>{revenueToday.toLocaleString()} VNĐ</p></div>
        <div className="stat-card"><h3>📊 Tổng lượt đặt</h3><p>{totalBookingsAll}</p></div>
      </div>

      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <button onClick={() => setShowFooterModal(true)} style={{ background: '#6c757d', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
          ⚙️ Cài đặt thông tin liên hệ
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button onClick={() => setActiveTab('revenue')} style={{ padding: '10px 20px', background: activeTab === 'revenue' ? '#00a651' : 'transparent', color: activeTab === 'revenue' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>💰 DOANH THU</button>
        <button onClick={() => setActiveTab('courts')} style={{ padding: '10px 20px', background: activeTab === 'courts' ? '#00a651' : 'transparent', color: activeTab === 'courts' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>🏸 QUẢN LÝ SÂN</button>
        <button onClick={() => setActiveTab('bookings')} style={{ padding: '10px 20px', background: activeTab === 'bookings' ? '#00a651' : 'transparent', color: activeTab === 'bookings' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '8px 8px 0 0' }}>📋 LỊCH ĐẶT SÂN</button>
      </div>

      {activeTab === 'revenue' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card"><h3>💰 Tổng doanh thu</h3><p>{totalRevenue.toLocaleString()} VNĐ</p></div>
            <div className="stat-card"><h3>💵 Tiền cọc (50%)</h3><p>{totalDepositRevenue.toLocaleString()} VNĐ</p></div>
            <div className="stat-card"><h3>✅ Đơn đã duyệt</h3><p>{approvedCount}</p></div>
            <div className="stat-card"><h3>⏳ Đơn chờ duyệt</h3><p>{pendingCount}</p></div>
          </div>
          <h3>📋 Chi tiết doanh thu từ cọc</h3>
          <table className="admin-table">
            <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ</th><th>Tổng</th><th>Cọc 50%</th><th>Còn lại</th><th>Trạng thái</th><th>TG còn lại</th></tr></thead>
            <tbody>
              {bookingRequests.filter(b => b.status === 'approved').map(b => {
                const completed = isBookingCompleted(b);
                const paid = remainingCollected.includes(String(b._id || b.id));
                return (
                  <tr key={b._id || b.id}>
                    <td>{getCustomerName(b)}</td>
                    <td>{b.courtName}</td>
                    <td>{b.date}</td>
                    <td>{b.hour}:00</td>
                    <td>{(b.total || 0).toLocaleString()} VNĐ</td>
                    <td>{getDeposit(b).toLocaleString()} VNĐ</td>
                    <td>{getRemaining(b).toLocaleString()} VNĐ</td>
                    <td style={{ color: !completed ? 'blue' : (paid ? 'green' : 'orange') }}>
                      {!completed ? '🟢 Đang hoạt động' : (paid ? '✅ Đã hoàn thành' : '💰 Chờ thanh toán')}
                    </td>
                    <td>{!completed ? getRemainingTime(b) : 'Đã kết thúc'}</td>
                  </tr>
                );
              })}
              {!bookingRequests.some(b => b.status === 'approved') && (
                <tr><td colSpan="9">Chưa có đơn duyệt</td></tr>
              )}
            </tbody>
          </table>
          <h3>💸 Chờ thu tiền còn lại</h3>
          {pendingRemainingBookings.length === 0 ? <p>Không có đơn nào.</p> : (
            <table className="admin-table">
              <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ kết thúc</th><th>Tiền còn lại</th><th>Hành động</th></tr></thead>
              <tbody>
                {pendingRemainingBookings.map(b => (
                  <tr key={b._id || b.id}>
                    <td>{getCustomerName(b)}</td>
                    <td>{b.courtName}</td>
                    <td>{b.date}</td>
                    <td>{getBookingEndTime(b).toLocaleTimeString()}</td>
                    <td>{getRemaining(b).toLocaleString()} VNĐ</td>
                    <td><button onClick={() => handleConfirmRemaining(b)} className="btn-confirm">Xác nhận đã thu</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'courts' && (
        <div>
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3>➕ THÊM SÂN MỚI</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Tên sân" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })} />
              <input type="number" placeholder="Giá / giờ" value={newCourt.price} onChange={e => setNewCourt({ ...newCourt, price: parseInt(e.target.value) })} />
              <input type="text" placeholder="Mô tả" value={newCourt.desc} onChange={e => setNewCourt({ ...newCourt, desc: e.target.value })} />
              <input type="text" placeholder="URL hình ảnh" value={newCourt.image} onChange={e => setNewCourt({ ...newCourt, image: e.target.value })} />
            </div>
            <button onClick={handleAddCourt} style={{ marginTop: '15px', background: '#00a651', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>THÊM SÂN</button>
          </div>
          <h3>✏️ DANH SÁCH SÂN HIỆN CÓ</h3>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Tên sân</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {safeCourts.length > 0 ? (
                safeCourts.map(court => (
                  <tr key={court.id}>
                    <td>{court.id}</td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <input value={editingCourt.name || ''} onChange={e => setEditingCourt({ ...editingCourt, name: e.target.value })} />
                      ) : (
                        court.name || 'N/A'
                      )}
                    </td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <input type="number" value={editingCourt.price || 0} onChange={e => setEditingCourt({ ...editingCourt, price: parseInt(e.target.value) })} />
                      ) : (
                        (court.price || 0).toLocaleString() + ' VNĐ'
                      )}
                    </td>
                    <td>{court.status || 'Trống'}</td>
                    <td>
                      {editingCourt?.id === court.id ? (
                        <>
                          <button onClick={handleUpdateCourt} style={{ background: '#28a745', color: 'white', marginRight: '5px' }}>Lưu</button>
                          <button onClick={() => setEditingCourt(null)}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingCourt(court)} style={{ background: '#ffc107', marginRight: '5px' }}>Sửa</button>
                          <button onClick={() => handleDeleteCourt(court.id)} style={{ background: '#dc3545', color: 'white' }}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">Chưa có sân nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>📋 TẤT CẢ YÊU CẦU ĐẶT SÂN</h3>
            <button onClick={() => clearOldBookings && clearOldBookings()} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>🗑 Dọn lịch cũ</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Khách</th><th>Sân</th><th>Ngày</th><th>Giờ</th><th>Số giờ</th><th>Tổng tiền</th><th>Ảnh cọc</th><th>Trạng thái</th><th>TG còn lại</th><th>Hành động</th></tr></thead>
            <tbody>
              {bookingRequests.map(req => {
                const playing = isCourtPlaying(req);
                const completed = isBookingCompleted(req);
                return (
                  <tr key={req._id || req.id} style={{ backgroundColor: playing ? '#e8f5e9' : 'transparent' }}>
                    <td>{getCustomerName(req)}</td>
                    <td>{req.courtName}</td>
                    <td>{req.date}</td>
                    <td>{req.hour}:00 - {parseInt(req.hour) + (req.duration || 1)}:00</td>
                    <td>{req.duration || 1}</td>
                    <td>{(req.total || 0).toLocaleString()} VNĐ</td>
                    <td>{req.paymentImage && <img src={req.paymentImage} alt="cọc" style={{ width: '50px', cursor: 'pointer' }} onClick={() => window.open(req.paymentImage)} />}</td>
                    <td style={{ color: playing ? 'green' : (req.status === 'approved' ? (completed ? (remainingCollected.includes(String(req._id || req.id)) ? 'blue' : 'orange') : 'blue') : (req.status === 'pending' ? 'orange' : 'red')) }}>
                      {playing ? '🟢 Đang hoạt động' : 
                       req.status === 'approved' ? (completed ? (remainingCollected.includes(String(req._id || req.id)) ? '✅ Đã hoàn thành' : '💰 Chờ thanh toán') : '💰 Chờ thanh toán') :
                       req.status === 'pending' ? '⏳ Chờ duyệt' : '❌ Đã hủy'}
                    </td>
                    <td>{req.status === 'approved' && !completed ? getRemainingTime(req) : (completed ? 'Đã kết thúc' : '')}</td>
                    <td>
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(req)} style={{ background: '#28a745', color: 'white', marginRight: '5px' }}>Duyệt</button>
                          <button onClick={() => setShowRejectModal(req)} style={{ background: '#dc3545', color: 'white' }}>Từ chối</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(req)} style={{ background: '#6c757d', color: 'white' }}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
              {bookingRequests.length === 0 && <tr><td colSpan="10">Chưa có yêu cầu</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '400px' }}>
            <h3>❌ TỪ CHỐI ĐƠN ĐẶT SÂN</h3>
            <p>Khách: <strong>{getCustomerName(showRejectModal)}</strong></p>
            <p>Sân: <strong>{showRejectModal.courtName}</strong> - {showRejectModal.date} {showRejectModal.hour}:00</p>
            <label>Lý do từ chối:</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows="3" style={{ width: '100%', margin: '10px 0', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Nhập lý do..." />
            {qrCode && <div><p>📱 Mã QR hoàn tiền:</p><img src={qrCode} alt="QR" style={{ width: '120px' }} /></div>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
              <button onClick={() => handleReject(showRejectModal)} style={{ background: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Xác nhận từ chối</button>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); setQrCode(''); }} style={{ background: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showFooterModal && (
        <FooterSettings onClose={() => setShowFooterModal(false)} onSave={(settings) => console.log('Saved', settings)} />
      )}
    </div>
  );
}