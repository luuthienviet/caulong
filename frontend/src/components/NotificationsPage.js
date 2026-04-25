import React from 'react';

export default function NotificationsPage({ notifications, onMarkAsRead, onClear, onDelete, onBack }) {
  const sorted = [...notifications].sort((a, b) => b.id - a.id);

  const handleMarkAsRead = (id) => {
    if (onMarkAsRead) onMarkAsRead(id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa thông báo này?')) {
      if (onDelete) onDelete(id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
      if (onClear) onClear();
    }
  };

  return (
    <div style={{ padding: '40px 10%', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#00a651' }}>🔔 TẤT CẢ THÔNG BÁO</h1>
        <div>
          <button onClick={onBack} style={{ marginRight: '15px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ← Quay lại
          </button>
          <button onClick={handleClearAll} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🗑 Xóa tất cả
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          📭 Không có thông báo nào
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sorted.map(noti => (
            <div key={noti.id} style={{
              background: noti.read ? 'white' : '#e8f5e9',
              borderLeft: `6px solid ${noti.read ? '#ccc' : '#00a651'}`,
              borderRadius: '8px',
              padding: '16px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: noti.read ? 'normal' : 'bold', marginBottom: '6px' }}>{noti.message}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{noti.time}</div>
              </div>
              <div>
                {!noti.read && (
                  <button
                    onClick={() => handleMarkAsRead(noti.id)}
                    style={{ marginRight: '10px', background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button
                  onClick={() => handleDelete(noti.id)}
                  style={{ background: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}