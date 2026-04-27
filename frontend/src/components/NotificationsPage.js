import React from 'react';

const typeMeta = {
  booking_approved: { icon: '🟢', label: 'Xác nhận đơn', color: '#198754' },
  booking_rejected: { icon: '❌', label: 'Hủy đơn', color: '#dc3545' },
  booking_cancelled: { icon: '❌', label: 'Hủy đơn', color: '#dc3545' },
  schedule_reminder: { icon: '⏰', label: 'Nhắc lịch', color: '#0d6efd' },
  promotion: { icon: '🎁', label: 'Khuyến mãi', color: '#ff9900' },
  booking_created: { icon: '🟢', label: 'Đơn mới', color: '#0d6efd' },
};

export default function NotificationsPage({ notifications, onMarkAsRead, onClear, onMarkAllRead, onNotificationClick, onBack }) {
  const sorted = notifications ? [...notifications].sort((a, b) => new Date(b.createdAt || b.time).getTime() - new Date(a.createdAt || a.time).getTime()) : [];

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <div>
          <h1>🔔 THÔNG BÁO</h1>
          <p>Quản lý thông báo khuyến mãi, nhắc lịch và trạng thái đơn của bạn.</p>
        </div>
        <div className="notification-actions-row">
          <button className="btn-secondary" onClick={onBack}>← Quay lại</button>
          {sorted.length > 0 && (
            <button className="btn-secondary" onClick={onMarkAllRead}>✅ Đánh dấu tất cả đã đọc</button>
          )}
          {sorted.length > 0 && (
            <button className="btn-secondary danger" onClick={onClear}>🗑 Xóa tất cả</button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="notification-empty-card">
          <p>📭 Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="notification-list">
          {sorted.map((noti) => {
            const meta = typeMeta[noti.type] || { icon: '🔔', label: 'Thông báo', color: '#6c757d' };
            return (
              <div
                key={noti._id || noti.id}
                className={`notification-card ${noti.read ? 'read' : 'unread'}`}
                onClick={() => onNotificationClick && onNotificationClick(noti)}
              >
                <div className="notification-bubble" style={{ background: `${meta.color}20`, color: meta.color }}>
                  {meta.icon}
                </div>
                <div className="notification-card-body">
                  <div className="notification-card-top">
                    <span className="notification-type" style={{ color: meta.color }}>{meta.label}</span>
                    {!noti.read && <span className="notification-unread-dot">●</span>}
                  </div>
                  <div className="notification-message">{noti.message}</div>
                  <div className="notification-meta">
                    <span>{noti.time || new Date(noti.createdAt).toLocaleString()}</span>
                    {noti.bookingId && <span>Đơn liên quan</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .notification-page { padding: 40px 10%; background: #f5f7fb; min-height: 100vh; }
        .notification-page-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
        .notification-page-header h1 { margin: 0; color: #0b5ed7; }
        .notification-page-header p { margin: 8px 0 0; color: #555; }
        .notification-actions-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .btn-secondary { border: none; padding: 10px 18px; border-radius: 999px; cursor: pointer; background: #0b5ed7; color: white; font-weight: 700; }
        .btn-secondary.danger { background: #dc3545; }
        .notification-empty-card { padding: 46px; background: white; border-radius: 20px; text-align: center; color: #555; box-shadow: 0 15px 40px rgba(0,0,0,0.08); }
        .notification-list { display: grid; gap: 16px; }
        .notification-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); cursor: pointer; display: grid; grid-template-columns: 60px 1fr; gap: 18px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .notification-card:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
        .notification-card.unread { border: 1px solid #0b5ed7; }
        .notification-bubble { width: 60px; height: 60px; display: grid; place-items: center; border-radius: 22px; font-size: 1.5rem; }
        .notification-card-body { display: grid; gap: 10px; }
        .notification-card-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .notification-type { font-weight: 700; }
        .notification-unread-dot { color: #dc3545; font-size: 1.1rem; }
        .notification-message { line-height: 1.6; color: #333; }
        .notification-meta { display: flex; gap: 12px; color: #69707d; font-size: 0.95rem; }
        @media (max-width: 820px) { .notification-page { padding: 24px 16px; } .notification-card { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
