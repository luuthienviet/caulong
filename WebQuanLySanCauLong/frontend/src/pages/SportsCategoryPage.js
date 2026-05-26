import React, { useState, useMemo } from 'react';
import CourtCard from '../components/courts/CourtCard';

const branchNames = {
  'kt': 'Kon Tum', 'hn': 'Hà Nội', 'hcm': 'Hồ Chí Minh', 'dn': 'Đà Nẵng',
  'ct': 'Cần Thơ', 'hp': 'Hải Phòng', 'qn': 'Quảng Ninh', 'nt': 'Nha Trang',
  'dl': 'Đà Lạt', 'vt': 'Vũng Tàu', 'bd': 'Bình Dương', 'dni': 'Đồng Nai',
  'bn': 'Bắc Ninh', 'th': 'Thanh Hóa', 'na': 'Nghệ An', 'hue': 'Huế', 'pq': 'Phú Quốc'
};

export default function SportsCategoryPage({ courts, sports, favorites, toggleFavorite, onViewCourt, userRole }) {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const availableBranches = Object.keys(branchNames);

  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const matchSport = selectedSport === 'all' || court.sport === selectedSport;
      const matchBranch = selectedBranch === 'all' || court.branch === selectedBranch;
      const matchSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSport && matchBranch && matchSearch;
    });
  }, [courts, selectedSport, selectedBranch, searchTerm]);

  return (
    <div className="sports-category-page" style={{ padding: '40px 5%', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>THỂ LOẠI MÔN THỂ THAO</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá và đặt các sân tập đa dạng phù hợp với bộ môn yêu thích của bạn.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm tên sân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>

        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          style={{
            padding: '14px 20px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="all">🏆 Tất cả các môn</option>
          {sports.map(sport => (
            <option key={sport.code} value={sport.code}>{sport.name}</option>
          ))}
        </select>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          style={{
            padding: '14px 20px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="all">📍 Tất cả chi nhánh</option>
          {availableBranches.map(b => (
            <option key={b} value={b}>{branchNames[b.toLowerCase()] || b.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {filteredCourts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏸</div>
          <h3>Không tìm thấy sân nào phù hợp</h3>
          <p>Vui lòng thử bộ lọc hoặc từ khóa khác.</p>
        </div>
      ) : (
        <div className="court-grid">
          {filteredCourts.map(court => (
            <CourtCard
              key={court.id || court._id}
              court={court}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onViewCourt={onViewCourt}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}
