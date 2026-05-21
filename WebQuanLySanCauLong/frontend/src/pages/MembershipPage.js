import React, { useEffect, useState } from 'react';
import API from '../api';

const TIERS = [
  {
    name: 'Bạc',
    icon: '🥈',
    minPoints: 0,
    maxPoints: 999,
    discountPercent: 0,
    color: '#94a3b8',
    gradient: 'linear-gradient(135deg,#94a3b8,#64748b)',
    bg: '#f8fafc',
    border: '#cbd5e1',
    benefits: ['Tích 1 điểm / 1.000đ thanh toán', 'Đổi 1 điểm = giảm 1đ', 'Xem lịch sử đặt sân', 'Nhận thông báo khuyến mãi'],
  },
  {
    name: 'Vàng',
    icon: '🥇',
    minPoints: 1000,
    maxPoints: 4999,
    discountPercent: 5,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    bg: '#fffbeb',
    border: '#fcd34d',
    benefits: ['Giảm 5% mọi đơn đặt sân', 'Tích 1 điểm / 1.000đ', 'Đổi 1 điểm = giảm 1đ', 'Ư u tiên đặt sân giờ vàng', 'Nhận quà sinh nhật'],
  },
  {
    name: 'Bạch Kim',
    icon: '💎',
    minPoints: 5000,
    maxPoints: Infinity,
    discountPercent: 10,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg,#6366f1,#3b82f6)',
    bg: '#eef2ff',
    border: '#a5b4fc',
    benefits: ['Giảm 10% mọi đơn đặt sân', 'Tích 1 điểm / 1.000đ', 'Đổi 1 điểm = giảm 1đ', 'Đặt sân ưu tiên 24/7', 'Quà tặng & sự kiện VIP', 'Tư vấn HLV miễn phí'],
  },
];

export default function MembershipPage({ user, onRefreshUser }) {
  const points = user?.points || 0;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentTier = TIERS.slice().reverse().find(t => points >= t.minPoints) || TIERS[0];
  const nextTier = TIERS.find(t => t.minPoints > points);

  const progressPercent = nextTier
    ? Math.min(100, Math.round(((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100))
    : 100;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get('/bookings/my-bookings');
        setBookings(res.data.data || []);
      } catch (e) {}
      setLoading(false);
    };
    load();
    onRefreshUser?.();
  }, []);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 80px', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: currentTier.gradient, color: '#fff',
          padding: '6px 20px', borderRadius: 30, fontSize: '0.8rem', fontWeight: 800,
          letterSpacing: '0.05em', marginBottom: 14, boxShadow: '0 4px 16px rgba(0,0,0,.18)'
        }}>
          {currentTier.icon} HẠNG {currentTier.name.toUpperCase()}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
          Tích điểm &amp; Thành viên
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Tích điểm từ mỗi lần đặt sân – đổi ưu đãi, lên hạng thành viên cao hơn
        </p>
      </div>

      {/* Points card */}
      <div style={{
        background: currentTier.gradient,
        borderRadius: 24, padding: '28px 32px', color: '#fff',
        marginBottom: 28, boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          background: 'rgba(255,255,255,.08)', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40, width: 150, height: 150,
          background: 'rgba(255,255,255,.06)', borderRadius: '50%'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Điểm tích lũy của bạn
          </div>
          <div style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1 }}>
            {points.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: 4 }}>điểm LTV</div>
        </div>
        <div style={{ position: 'relative', textAlign: 'right' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))' }}>
            {currentTier.icon}
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 4 }}>Hạng {currentTier.name}</div>
          {currentTier.discountPercent > 0 && (
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 12, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
              Giảm {currentTier.discountPercent}% tất cả đơn
            </div>
          )}
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div style={{
          background: '#fff', borderRadius: 18, padding: '20px 24px',
          marginBottom: 28, border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
              🎯 Lên hạng {nextTier.icon} {nextTier.name}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {points.toLocaleString()} / {nextTier.minPoints.toLocaleString()} điểm
            </span>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 99, height: 12, overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              background: nextTier.gradient, borderRadius: 99,
              transition: 'width 1s ease', boxShadow: '0 2px 6px rgba(0,0,0,.15)'
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8, textAlign: 'center' }}>
            Cần thêm <strong style={{ color: nextTier.color }}>{(nextTier.minPoints - points).toLocaleString()} điểm</strong> để lên hạng {nextTier.name} &amp; nhận giảm {nextTier.discountPercent}%
          </div>
        </div>
      )}
      {!nextTier && (
        <div style={{
          background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', borderRadius: 18, padding: '16px 24px',
          marginBottom: 28, border: '1.5px solid #a5b4fc', textAlign: 'center',
          fontWeight: 700, color: '#4338ca', fontSize: '0.95rem'
        }}>
          🏆 Chúc mừng! Bạn đang ở hạng cao nhất — Bạch Kim! Tiếp tục tích điểm để đổi giảm giá!
        </div>
      )}

      {/* How points work */}
      <div style={{
        background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 18, padding: '20px 24px',
        marginBottom: 28, border: '1.5px solid #86efac'
      }}>
        <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.95rem', marginBottom: 12 }}>💡 Cách tích điểm</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {[
            { icon: '🏸', text: 'Đặt sân được duyệt → nhận 1 điểm/1.000đ' },
            { icon: '♻️', text: '1 điểm = giảm trực tiếp 1đ khi đặt sân' },
            { icon: '🔁', text: 'Điểm được hoàn nếu đơn bị hủy' },
            { icon: '📈', text: 'Tích điểm không giới hạn, không hết hạn' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: '#166534' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>📊 Các hạng thành viên</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 36 }}>
        {TIERS.map(tier => {
          const isActive = tier.name === currentTier.name;
          return (
            <div key={tier.name} style={{
              background: isActive ? tier.bg : '#fff',
              border: `2px solid ${isActive ? tier.color : '#e2e8f0'}`,
              borderRadius: 20, padding: '22px 20px',
              boxShadow: isActive ? `0 4px 20px ${tier.color}30` : '0 1px 6px rgba(0,0,0,.06)',
              position: 'relative', overflow: 'hidden'
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: tier.gradient, color: '#fff',
                  fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20
                }}>
                  HIỆN TẠI
                </div>
              )}
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{tier.icon}</div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: tier.color, marginBottom: 4 }}>Hạng {tier.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
                {tier.maxPoints === Infinity ? `≥ ${tier.minPoints.toLocaleString()} điểm` : `${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} điểm`}
              </div>
              {tier.discountPercent > 0 && (
                <div style={{
                  background: tier.gradient, color: '#fff',
                  borderRadius: 10, padding: '4px 12px',
                  fontSize: '0.82rem', fontWeight: 800, display: 'inline-block', marginBottom: 12
                }}>
                  Giảm {tier.discountPercent}% mỗi đơn
                </div>
              )}
              <ul style={{ margin: '10px 0 0', padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {tier.benefits.map(b => (
                  <li key={b} style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>{b}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Booking points history */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>🕒 Lịch sử tích điểm</h2>
      <div style={{
        background: '#fff', borderRadius: 20, border: '1.5px solid #e2e8f0',
        overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</div>
        ) : bookings.filter(b => b.status === 'approved' && (b.pointsEarned || 0) > 0).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
            Chưa có điểm tích lũy. Hãy đặt sân và được duyệt để bắt đầu tích điểm!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Ngày', 'Sân', 'Tổng tiền', 'Điểm tích', 'Điểm dùng'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter(b => b.status === 'approved')
                .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                .slice(0, 20)
                .map(b => (
                  <tr key={b._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{b.date}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600 }}>{b.courtName}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a' }}>{(b.total || 0).toLocaleString()}đ</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: '#dcfce7', color: '#15803d', borderRadius: 20,
                        padding: '2px 10px', fontWeight: 700, fontSize: '0.8rem'
                      }}>
                        +{(b.pointsEarned || Math.floor((b.total || 0) / 100)).toLocaleString()} điểm
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {(b.pointsRedeemed || 0) > 0 ? (
                        <span style={{
                          background: '#fee2e2', color: '#dc2626', borderRadius: 20,
                          padding: '2px 10px', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          -{(b.pointsRedeemed).toLocaleString()} điểm
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
