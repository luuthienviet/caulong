import React from "react";

export default function CourtCard({
  court,
  favorites,
  toggleFavorite,
  onViewCourt,
  onManageCourt,
  userRole,
  onRate,
}) {
  const courtName = typeof court.name === 'string' ? court.name : 'Unknown Court';
  const courtDesc = typeof court.description === 'string' ? court.description : (typeof court.desc === 'string' ? court.desc : '');
  const avgRating = court.avgRating || 0;
  const reviewCount = court.reviewCount || 0;
  const isMaintenance = court.status === 'Đang bảo trì';

  return (
    <div className="court-card-wrapper">
      <div className="court-card">
        {/* Icon trái tim yêu thích */}
        <div
          className={`favorite-icon ${(favorites || []).includes(court.id) ? "active" : ""}`}
          onClick={() => toggleFavorite(court.id)}
        >
          ❤
        </div>

        {/* Đánh giá sao */}
        <div className="court-rating">
          <span className="rating-stars">
            {'★'.repeat(Math.floor(avgRating))}
            {'☆'.repeat(5 - Math.floor(avgRating))}
          </span>
          <span className="rating-count">({reviewCount})</span>
        </div>
<div className="court-status">
  {isMaintenance ? '🔴 Đang bảo trì' : '🟢 Còn trống'}
</div>

        {/* Badge bảo trì (hiển thị cho mọi người) */}
        {isMaintenance && (
          <div className="maintenance-badge">🔧 Đang bảo trì</div>
        )}

        <img src={court.image} alt={courtName} className="court-img" />
        <div className="court-content">
          <div className="court-title">{courtName}</div>
          <p className="court-desc">{courtDesc}</p>
          <div className="court-opening">🕒 Mở cửa: 05:00 - 22:00</div>
          <button
            className={`btn-view-court ${userRole !== 'admin' && isMaintenance ? 'disabled' : ''}`}
            onClick={() => {
              if (userRole === 'admin') {
                if (onManageCourt) onManageCourt(court);
              } else {
                if (isMaintenance) return;
                if (onViewCourt) onViewCourt(court);
              }
            }}
            disabled={userRole !== 'admin' && isMaintenance}
          >
            {userRole === 'admin' ? '🛠️ Quản lý sân' : (isMaintenance ? '🔧 Đang bảo trì' : '📅 Đặt lịch')}
          </button>
        </div>
      </div>
      {/* Nút đánh giá chỉ hiển thị cho khách hàng và khi không bảo trì */}
      {userRole !== 'admin' && onRate && !isMaintenance && (
        <button className="btn-rate" onClick={() => onRate(court)}>
          ⭐ Đánh giá
        </button>
      )}
    </div>
  );
}