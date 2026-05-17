import React from "react";

export default function CourtCard({
  court,
  onViewCourt,
  onRate,
}) {
  const courtName = typeof court.name === 'string' ? court.name : 'Unknown Court';
  const courtDesc = typeof court.description === 'string'
    ? court.description
    : (typeof court.desc === 'string' ? court.desc : '');
  let avgRating = court.avgRating || 0;
  let reviewCount = court.reviewCount || 0;
  let bookingCount = court.bookingCount || 0;

  // Lấy dữ liệu đánh giá và lượt đặt lưu tạm trong localStorage (để hiển thị ngay cho người dùng)
  try {
    const allReviews = JSON.parse(localStorage.getItem('allCourtReviews') || '{}');
    const courtId = court._id || court.id;
    const localReviews = allReviews[courtId] || [];
    if (localReviews.length > 0) {
      reviewCount += localReviews.length;
      const sum = localReviews.reduce((acc, r) => acc + r.stars, 0);
      avgRating = ((court.avgRating || 0) * (court.reviewCount || 0) + sum) / reviewCount;
    }

    const localBookings = JSON.parse(localStorage.getItem('localCourtBookings') || '{}');
    if (localBookings[courtId]) {
      bookingCount += localBookings[courtId];
    }
  } catch (err) {
    console.error(err);
  }

  const isMaintenance = court.status === 'Đang bảo trì';

  return (
    <div className="court-card-wrapper">
      <div className="court-card">

        {/* Trạng thái sân */}
        {isMaintenance && (
          <div className="court-status">
            🔴 Đang bảo trì
          </div>
        )}

        {/* Badge bảo trì */}
        {isMaintenance && (
          <div className="maintenance-badge">🔧 Đang bảo trì</div>
        )}

        <img src={court.image} alt={courtName} className="court-img" />

        <div className="court-content">
          <div className="court-title">{courtName}</div>
          <p className="court-desc">{courtDesc}</p>

          {/* Thống kê đánh giá và lượt đặt */}
          <div className="court-stats">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{avgRating.toFixed(1)}</span>
              <span className="stat-label">({reviewCount} đánh giá)</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-value">{bookingCount}</span>
              <span className="stat-label">lượt đặt</span>
            </div>
          </div>

          {/* Giờ mở cửa */}
          <div className="court-opening">🕒 Mở cửa: 05:00 - 22:00</div>

          <button
            className={`btn-view-court ${isMaintenance ? 'disabled' : ''}`}
            onClick={() => {
              if (isMaintenance) return;
              if (onViewCourt) onViewCourt(court);
            }}
            disabled={isMaintenance}
          >
            {isMaintenance ? '🔧 Đang bảo trì' : '📅 Đặt lịch'}
          </button>
        </div>
      </div>

      {/* Nút đánh giá */}
      {onRate && !isMaintenance && (
        <button className="btn-rate" onClick={() => onRate(court)}>
          ⭐ Đánh giá
        </button>
      )}
    </div>
  );
}