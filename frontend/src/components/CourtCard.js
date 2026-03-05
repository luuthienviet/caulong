import React from "react";

export default function CourtCard({
  court,
  favorites,
  toggleFavorite,
  onViewCourt
})
{
  return (
    <div className="court-card">
      <div
  className={`favorite-icon ${
    (favorites || []).includes(court.id) ? "active" : ""
  }`}
  onClick={() => toggleFavorite(court.id)}
>
        ❤
      </div>

      <img src={court.image} alt={court.name} className="court-img"/>

      <div className="court-content">
        <div className="court-title">{court.name}</div>
        <p className="court-desc">{court.desc}</p>

        <button className="btn-view-court" onClick={() => onViewCourt(court)}>
          XEM SÂN NGAY
        </button>
      </div>
    </div>
  );
}