import React from 'react';
import CourtCard from './CourtCard';

export default function FavoritesPage({ courts, favorites, toggleFavorite, onViewCourt, userRole }) {
  const favoriteCourts = courts.filter(court => favorites.includes(court.id));
  return (
    <section style={{ padding: '40px 10%' }}>
      <h2 style={{ color: 'var(--green)' }}>❤️ SÂN YÊU THÍCH</h2>
      {favoriteCourts.length === 0 ? (
        <p>Bạn chưa có sân yêu thích nào.</p>
      ) : (
        <div className="court-grid">
          {favoriteCourts.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onViewCourt={onViewCourt}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </section>
  );
}