import React, { useEffect, useState } from 'react';

const STEPS = ['Chọn ngày', 'Chọn giờ', 'Thông tin', 'Xác nhận'];





/* ── Star picker ── */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          style={{
            fontSize: '1.8rem', cursor: 'pointer',
            color: i <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color .15s, transform .15s',
            transform: i <= (hovered || value) ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block', userSelect: 'none',
          }}>★</span>
      ))}
    </div>
  );
}

/* ── Review + Suggestions section ── */
function ReviewSection({ court, courts = [], onSelectCourt, user }) {
  const otherCourts = courts.filter(
    c => String(c._id || c.id) !== String(court._id || court.id) &&
      c.status !== 'Đang bảo trì'
  );
  const [reviews, setReviews] = useState([]);
  const [showCount, setShowCount] = useState(5);
  const [newStars, setNewStars] = useState(0);
  const [newText, setNewText] = useState('');
  const [newName, setNewName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [starErr, setStarErr] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { default: API } = await import('../../api');
        const res = await API.get(`/reviews/${court._id || court.id}`);
        if (res.data.success) {
          const formatted = res.data.data.map(r => ({
            id: r._id,
            name: r.userId?.name || r.userId?.username || 'Khách hàng',
            avatar: '🙋',
            stars: r.rating,
            date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
            text: r.comment
          }));
          setReviews(formatted);
        }
      } catch (err) {
        console.error('Lỗi tải đánh giá:', err);
      }
    };
    fetchReviews();
  }, [court._id, court.id]);

  const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.stars === s).length,
    pct: Math.round(reviews.filter(r => r.stars === s).length / reviews.length * 100),
  }));
  const sorted = [...reviews].sort((a, b) => b.stars - a.stars);
  const visible = sorted.slice(0, showCount);

  const handleSubmit = async () => {
    if (newStars === 0) { setStarErr(true); return; }

    // Gửi lên backend
    try {
      const { default: API } = await import('../../api');
      await API.post('/reviews', {
        courtId: court._id || court.id,
        rating: newStars,
        comment: newText.trim()
      });

      setReviews(prev => [{
        id: Date.now(), 
        name: user ? (user.name || user.username) : (newName.trim() || 'Khách hàng'), 
        avatar: '🙋',
        stars: newStars, 
        date: new Date().toLocaleDateString('vi-VN'),
        text: newText.trim() || 'Đánh giá tốt!',
      }, ...prev]);

      setNewStars(0); setNewText(''); setNewName('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng đăng nhập!');
    }
  };

  return (
    <div style={{ marginTop: 52 }}>
      <style>{`
        @keyframes rv-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .rv-card { animation: rv-in .3s ease; }
        .sug-court-card { transition: transform .2s, box-shadow .2s; cursor: pointer; }
        .sug-court-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,.14); }
        .xem-them-btn { transition: background .2s, color .2s; }
        .xem-them-btn:hover { background: #4361ee !important; color: #fff !important; }
        .dat-lich-btn { transition: background .2s, transform .15s; }
        .dat-lich-btn:hover { background: #3a56d4 !important; transform: scale(1.02); }
      `}</style>

      {/* ══ ĐÁNH GIÁ SÂN ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 4, height: 28, background: 'linear-gradient(#4361ee,#3a0ca3)', borderRadius: 4 }} />
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Đánh giá sân</h2>
      </div>

      {/* Tổng điểm + phân bổ */}
      {reviews.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '32px 28px', marginBottom: 28,
          boxShadow: '0 2px 14px rgba(0,0,0,.06)', border: '1.5px solid #f1f5f9',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem' }}>🏸</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Chưa có đánh giá nào</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hãy là người đầu tiên đánh giá sân này!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 28 }}>
          <div style={{
            background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', borderRadius: 20,
            padding: '28px 20px', color: '#fff', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <div style={{ fontSize: '3.8rem', fontWeight: 900, lineHeight: 1 }}>{avg}</div>
            <div style={{ display: 'flex', gap: 3, fontSize: '1.2rem' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= Math.round(avg) ? '#fbbf24' : 'rgba(255,255,255,.3)' }}>★</span>
              ))}
            </div>
            <div style={{ opacity: 0.85, fontSize: '0.8rem' }}>{reviews.length} lượt đánh giá</div>
          </div>

          <div style={{
            background: '#fff', borderRadius: 20, padding: '20px 24px',
            boxShadow: '0 2px 14px rgba(0,0,0,.06)', border: '1.5px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10
          }}>
            {dist.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', width: 14, textAlign: 'right' }}>{star}</span>
                <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★</span>
                <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 99,
                    background: star === 5 ? '#4361ee' : star === 4 ? '#6ee7b7' : star === 3 ? '#fcd34d' : '#fca5a5',
                    transition: 'width .6s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 22, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form viết đánh giá */}
      <div style={{
        background: '#fff', borderRadius: 20, padding: '24px 28px',
        boxShadow: '0 2px 14px rgba(0,0,0,.06)', border: '1.5px solid #e0e7ff', marginBottom: 28
      }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 16 }}>✍️ Viết đánh giá của bạn</div>

        {submitted && (
          <div style={{
            background: '#d1fae5', border: '1.5px solid #6ee7b7', borderRadius: 12,
            padding: '12px 16px', marginBottom: 16, color: '#065f46', fontWeight: 600, fontSize: '0.9rem'
          }}>
            ✅ Cảm ơn bạn đã đánh giá! Bình luận đã được đăng.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbSt}>Họ tên</label>
            <input 
              value={user ? (user.name || user.username) : newName} 
              disabled={!!user}
              onChange={e => setNewName(e.target.value)}
              placeholder="Tên của bạn" 
              style={{ ...inSt, background: user ? '#f1f5f9' : '#f8faff', cursor: user ? 'not-allowed' : 'text' }} 
            />
          </div>
          <div>
            <label style={lbSt}>Xếp hạng {starErr && <span style={{ color: '#ef4444', fontWeight: 400 }}>– Vui lòng chọn sao</span>}</label>
            <StarPicker value={newStars} onChange={v => { setNewStars(v); setStarErr(false); }} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbSt}>Nhận xét</label>
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
            rows={3}
            style={{ ...inSt, resize: 'vertical', minHeight: 80, fontFamily: 'inherit', lineHeight: 1.5 }} />
        </div>

        <button onClick={handleSubmit}
          style={{
            background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', color: '#fff',
            border: 'none', borderRadius: 12, padding: '11px 28px', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(67,97,238,.3)',
            transition: 'transform .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          Gửi đánh giá →
        </button>
      </div>

      {/* Danh sách bình luận */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((r, idx) => (
            <div key={r.id} className="rv-card"
              style={{
                background: '#fff', borderRadius: 16, padding: '18px 22px',
                boxShadow: '0 2px 10px rgba(0,0,0,.05)',
                border: r.stars === 5 ? '1.5px solid #c7d2fe' : '1.5px solid #f1f5f9',
                display: 'flex', gap: 16, alignItems: 'flex-start'
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: r.stars === 5 ? 'linear-gradient(135deg,#4361ee,#3a0ca3)' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', boxShadow: r.stars === 5 ? '0 2px 10px rgba(67,97,238,.3)' : 'none'
              }}>
                {r.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 4, flexWrap: 'wrap', gap: 6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{r.name}</span>
                    {r.stars === 5 && idx < 5 && (
                      <span style={{
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
                        fontSize: '0.62rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700
                      }}>TOP ⭐</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{ fontSize: '0.88rem', color: i <= r.stars ? '#f59e0b' : '#e5e7eb' }}>★</span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569', lineHeight: 1.6 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCount < sorted.length && (
        <div style={{ textAlign: 'right', marginTop: 14 }}>
          <button className="xem-them-btn" onClick={() => setShowCount(c => c + 5)}
            style={{
              background: '#fff', border: '2px solid #e0e7ff', borderRadius: 12,
              padding: '9px 24px', fontWeight: 700, color: '#4361ee', fontSize: '0.88rem', cursor: 'pointer'
            }}>
            Xem thêm ({sorted.length - showCount} đánh giá) ↓
          </button>
        </div>
      )}

      {/* ══ GỢI Ý SÂN — dùng dữ liệu sân thật ══ */}
      {otherCourts.length > 0 && (
        <div style={{ marginTop: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 4, height: 28, background: 'linear-gradient(#f59e0b,#d97706)', borderRadius: 4 }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Gợi ý sân khác</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(otherCourts.length, 4)}, 1fr)`,
            gap: 18, marginBottom: 20
          }}>
            {otherCourts.map(c => {
              const cName = typeof c.name === 'string' ? c.name : 'Sân';
              const cDesc = typeof c.desc === 'string' ? c.desc : (typeof c.description === 'string' ? c.description : '');
              const cRating = c.avgRating || 0;
              const cReviews = c.reviewCount || 0;
              const cBooks = c.bookingCount || 0;
              const isVip = cName.toLowerCase().includes('vip');
              return (
                <div
                  key={c._id || c.id}
                  className="sug-court-card"
                  style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 2px 14px rgba(0,0,0,.07)', border: '1.5px solid #f0f2f8',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectCourt && onSelectCourt(c)}
                >
                  {/* Ảnh sân */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={c.image}
                      alt={cName}
                      style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                    />
                    {/* Badge trạng thái */}
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: '#fff', borderRadius: 20,
                      padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.72rem', fontWeight: 700, color: '#16a34a',
                      boxShadow: '0 2px 8px rgba(0,0,0,.12)'
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      Còn trống
                    </div>
                    {/* Badge VIP */}
                    {isVip && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                        color: '#fff', borderRadius: 20, padding: '3px 10px',
                        fontSize: '0.68rem', fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(245,158,11,.3)'
                      }}>✦ VIP</div>
                    )}
                  </div>

                  {/* Nội dung card */}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: 4 }}>{cName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10, lineHeight: 1.4 }}>{cDesc}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b' }}>{cRating.toFixed(1)}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({cReviews} đánh giá)</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 4 }}>
                      📋 {cBooks} lượt đặt
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 14 }}>
                      🕒 Mở cửa: 05:00 – 22:00
                    </div>

                    <button
                      className="dat-lich-btn"
                      onClick={e => { e.stopPropagation(); onSelectCourt && onSelectCourt(c); }}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                        color: '#fff', border: 'none', borderRadius: 10,
                        padding: '10px 0', fontWeight: 700, fontSize: '0.82rem',
                        cursor: 'pointer', boxShadow: '0 3px 12px rgba(67,97,238,.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}>
                      📋 Đặt lịch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tiện ích chung */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '22px 26px',
            border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,.05)'
          }}>
            <div style={{
              fontWeight: 700, fontSize: '0.82rem', color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14
            }}>
              🏟️ Tất cả sân mở cửa 05:00 – 22:00 mỗi ngày
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
              {[['💡', 'Ánh sáng chuẩn thi đấu'], ['🛡️', 'Sàn chống trơn trượt'],
              ['🚿', 'WC & phòng thay đồ'], ['🅿️', 'Bãi đỗ xe miễn phí'],
              ['📶', 'WiFi miễn phí'], ['🥤', 'Nước uống & đồ ăn nhẹ']].map(([icon, text]) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f8faff', borderRadius: 10, padding: '10px 12px',
                  fontSize: '0.8rem', color: '#475569', fontWeight: 500
                }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function CourtDetail({
  selectedCourt,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  duration,
  setDuration,
  bookingRequests,
  onGoToPayment,
  setPage,
  setSelectedCourt,
  user,
  courts = [],        // ← danh sách tất cả sân thật từ parent
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState(user?.name || user?.username || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNote, setCustomerNote] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: null, end: null });
  const [dragging, setDragging] = useState(false);
  const [selectionAnchor, setSelectionAnchor] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const hours = ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => { if (!selectedCourt) setPage('home'); }, [selectedCourt, setPage]);

  useEffect(() => {
    if (!selectedHour) { setSelectionRange({ start: null, end: null }); return; }
    const idx = hours.indexOf(selectedHour);
    if (idx >= 0)
      setSelectionRange({ start: idx, end: Math.min(hours.length - 1, idx + Math.max(1, duration) - 1) });
  }, [selectedHour, duration]);

  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, []);

  if (!selectedCourt) return null;

  /* ── helpers ── */
  const getSlotStatus = (hour) => {
    if (selectedDate === today && Number(hour) < new Date().getHours()) return 'past';
    const h = parseInt(hour, 10);
    const b = bookingRequests.find(
      r => {
        if (r.status === 'rejected' || r.status === 'cancelled') return false;
        const isSameCourt = String(r.courtId) === String(selectedCourt.id) || String(r.courtName) === String(selectedCourt.name);
        if (!isSameCourt || r.date !== selectedDate) return false;
        const startH = parseInt(r.hour, 10);
        const dur = r.duration || 1;
        const endH = startH + dur;
        return h >= startH && h < endH;
      }
    );
    if (!b) return 'available';
    if (b.status === 'approved') return 'approved';
    if (b.status === 'pending') return 'pending';
    return 'done';
  };
  const isDisabled = h => ['past', 'approved', 'pending', 'done'].includes(getSlotStatus(h));
  const getDragRange = (anchor, hover) => {
    if (anchor == null || hover == null) return null;
    const dir = hover >= anchor ? 1 : -1;
    let cur = anchor, end = anchor;
    while (cur !== hover) {
      const next = cur + dir;
      if (next < 0 || next >= hours.length) break;
      if (isDisabled(hours[next])) break;
      cur = next; end = cur;
    }
    return dir === 1 ? { start: anchor, end } : { start: end, end: anchor };
  };
  const canExtend = () => {
    const next = hours.indexOf(selectedHour) + duration;
    return next < hours.length && !isDisabled(hours[next]);
  };
  const priceForHour = h => Number(h) >= 17 ? Math.floor(selectedCourt.price * 1.3) : selectedCourt.price;
  const totalPrice = (() => {
    if (selectionRange.start == null) return 0;
    let t = 0;
    for (let i = selectionRange.start; i <= selectionRange.end; i++) t += priceForHour(hours[i]);
    return t;
  })();
  const deposit = Math.floor(totalPrice * 0.5);

  const slotMeta = {
    available: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', ok: true },
    approved: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', ok: false },
    pending: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', ok: false },
    done: { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', ok: false },
    past: { bg: '#f9fafb', color: '#d1d5db', border: '#e5e7eb', ok: false },
  };

  const courtName = typeof selectedCourt.name === 'string' ? selectedCourt.name : 'Sân';
  const courtDesc = typeof selectedCourt.desc === 'string' ? selectedCourt.desc
    : (typeof selectedCourt.description === 'string' ? selectedCourt.description : '');
  const galleryImages = [selectedCourt.image, selectedCourt.image, selectedCourt.image];
  const isVip = courtName.toLowerCase().includes('vip');

  const handleDateChange = (v) => {
    setSelectedDate(v); setSelectedHour(''); setDuration(1);
    setSelectionRange({ start: null, end: null });
  };
  const handleBook = () => {
    if (!selectedDate || !selectedHour) { alert('Vui lòng chọn ngày và giờ.'); return; }
    
    // Check for overlap conflicts
    if (selectionRange.start != null && selectionRange.end != null) {
      for (let i = selectionRange.start; i <= selectionRange.end; i++) {
        const hourToCheck = hours[i];
        if (isDisabled(hourToCheck)) {
          alert(`Khung giờ ${hourToCheck}:00 đã có người đặt hoặc không khả dụng. Vui lòng chọn khung giờ khác!`);
          return;
        }
      }
    }

    if (!customerName.trim()) { alert('Vui lòng nhập tên.'); return; }
    if (!/^0\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) {
      setPhoneError('SĐT gồm 10 số, bắt đầu bằng 0'); return;
    }
    setPhoneError('');
    onGoToPayment({
      selectedCourt, selectedDate, selectedHour, duration,
      totalPrice, depositAmount: deposit,
      customerName: customerName.trim(),
      customerPhone: customerPhone.replace(/\s+/g, ''),
      customerNote: customerNote.trim(), user,
    });
  };

  /* ══════════════════════════════════════
     DESKTOP LAYOUT
  ══════════════════════════════════════ */
  if (!isMobile) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 80px', fontFamily: 'inherit' }}>
        <button onClick={() => { setSelectedCourt(null); setPage('home'); }}
          style={{
            background: 'none', border: 'none', color: '#4361ee', fontWeight: 700,
            fontSize: '0.92rem', cursor: 'pointer', marginBottom: 20, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
          ← Quay lại danh sách sân
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{courtName}</h1>
          {isVip && (
            <span style={{
              background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
              padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700
            }}>✦ VIP</span>
          )}
        </div>
        <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem' }}>{courtDesc}</p>

        {/* ── Grid 2 cột: ảnh+info | form đặt sân ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT */}
          <div>
            <div style={{
              borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)',
              marginBottom: 20, position: 'relative'
            }}>
              <img src={galleryImages[slideIndex]} alt={courtName}
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 6
              }}>
                {galleryImages.map((_, i) => (
                  <button key={i} onClick={() => setSlideIndex(i)}
                    style={{
                      width: i === slideIndex ? 22 : 8, height: 8, borderRadius: 99,
                      background: i === slideIndex ? '#fff' : 'rgba(255,255,255,.5)',
                      border: 'none', cursor: 'pointer', padding: 0, transition: 'all .2s'
                    }} />
                ))}
              </div>
              <button onClick={() => setSlideIndex(p => (p - 1 + galleryImages.length) % galleryImages.length)}
                style={navBtn('left')}>❮</button>
              <button onClick={() => setSlideIndex(p => (p + 1) % galleryImages.length)}
                style={navBtn('right')}>❯</button>
            </div>

            <div style={{
              background: '#f8faff', borderRadius: 14, padding: '16px 18px',
              marginBottom: 16, border: '1.5px solid #e0e7ff'
            }}>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 10, fontSize: '0.92rem' }}>💰 Bảng giá</div>
              {[
                ['Giờ thường (05:00–17:00)', `${selectedCourt.price.toLocaleString()} VNĐ/giờ`, '#1e293b'],
                ['Giờ tối (17:00–22:00)', `${Math.floor(selectedCourt.price * 1.3).toLocaleString()} VNĐ/giờ`, '#dc2626'],
                ['Thanh toán', '100% online', '#4361ee'],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.88rem', color: '#475569', marginBottom: 6
                }}>
                  <span>{label}</span><strong style={{ color }}>{val}</strong>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12, fontSize: '0.92rem' }}>✨ Tiện ích</div>
              {[['🏸', 'Thảm Yonex cao cấp'], ['💡', 'Ánh sáng thi đấu chuẩn'],
              ['🛡️', 'Sàn chống trơn trượt'], ['🕒', 'Mở cửa 05:00 – 22:00'],
              ['💧', 'Nước uống & WC sạch'], ['👥', 'Không gian thoải mái']].map(([icon, text]) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: '0.85rem', color: '#475569', marginBottom: 8
                }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form đặt sân */}
          <div>
            <div style={{
              background: '#fff', borderRadius: 18, boxShadow: '0 4px 28px rgba(0,0,0,.07)',
              border: '1.5px solid #e8ecf6', overflow: 'hidden'
            }}>
              <div style={{ background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', padding: '18px 24px', color: '#fff' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>📅 Đặt sân ngay</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Chọn ngày → chọn giờ → điền thông tin → thanh toán</div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Chọn ngày */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Chọn ngày</label>
                  <input type="date" value={selectedDate || ''} min={today}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{
                      width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10,
                      padding: '9px 14px', fontSize: '0.95rem', color: '#1e293b',
                      background: '#f8faff', outline: 'none', boxSizing: 'border-box'
                    }} />
                </div>

                {/* Chọn giờ */}
                {selectedDate && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Chọn giờ <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.78rem' }}>(kéo để chọn nhiều giờ)</span></label>
                    {/* Đã loại bỏ phần chú giải biểu tượng theo yêu cầu */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 6 }}
                      onMouseLeave={() => dragging && setDragging(false)}>
                      {hours.map((hour, index) => {
                        const status = getSlotStatus(hour);
                        const meta = slotMeta[status];
                        const inSel = selectionRange.start != null && index >= selectionRange.start && index <= selectionRange.end;
                        const isEve = Number(hour) >= 17;
                        return (
                          <button key={hour} type="button" disabled={!meta.ok}
                            onMouseDown={() => {
                              if (!meta.ok) return;
                              setDragging(true); setSelectionAnchor(index);
                              setSelectionRange({ start: index, end: index });
                              setSelectedHour(hour); setDuration(1);
                            }}
                            onMouseEnter={() => {
                              if (!dragging || selectionAnchor == null) return;
                              const r = getDragRange(selectionAnchor, index);
                              if (r) { setSelectionRange(r); setSelectedHour(hours[r.start]); setDuration(r.end - r.start + 1); }
                            }}
                            style={{
                              border: `2px solid ${inSel ? '#4361ee' : meta.border}`,
                              borderRadius: 10, padding: '8px 4px',
                              background: inSel ? '#4361ee' : meta.bg,
                              color: inSel ? '#fff' : meta.color,
                              cursor: meta.ok ? 'pointer' : 'not-allowed',
                              fontSize: '0.8rem', fontWeight: 700,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                              transition: 'all .15s',
                              transform: inSel ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: inSel ? '0 2px 8px rgba(67,97,238,.3)' : 'none',
                            }}>
                            <span>{hour}:00</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>
                              {inSel ? '✓' : status === 'pending' ? '🔒' : status === 'approved' ? '🚫' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Thời lượng */}
                {selectedHour && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8faff', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                    border: '1.5px solid #e0e7ff'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Thời lượng</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {selectedHour}:00 – {hours[Math.min(hours.length - 1, hours.indexOf(selectedHour) + duration)]}:00
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => {
                        const s = selectionRange.start ?? hours.indexOf(selectedHour);
                        const nd = Math.max(1, duration - 1);
                        setDuration(nd); if (s >= 0) setSelectionRange({ start: s, end: s + nd - 1 });
                      }} style={durationBtn}>−</button>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', minWidth: 50, textAlign: 'center' }}>{duration} giờ</span>
                      <button disabled={!canExtend()} onClick={() => {
                        const s = selectionRange.start ?? hours.indexOf(selectedHour);
                        setDuration(duration + 1); if (s >= 0) setSelectionRange({ start: s, end: s + duration });
                      }} style={{ ...durationBtn, opacity: canExtend() ? 1 : 0.35 }}>+</button>
                    </div>
                  </div>
                )}

                {/* Thông tin người đặt */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Tên người đặt</label>
                    <input type="text" value={customerName} placeholder="Tên đầy đủ"
                      onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Số điện thoại</label>
                    <input type="tel" value={customerPhone} placeholder="0xxxxxxxxx"
                      onChange={e => { setCustomerPhone(e.target.value); setPhoneError(''); }}
                      style={{ ...inputStyle, borderColor: phoneError ? '#ef4444' : '#dde3f0' }} />
                    {phoneError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{phoneError}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Ghi chú</label>
                    <input type="text" value={customerNote} placeholder="Yêu cầu thêm..."
                      onChange={e => setCustomerNote(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                {/* Tổng tiền */}
                <div style={{
                  background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', borderRadius: 14,
                  padding: '16px 18px', marginBottom: 18, border: '1.5px solid #c7d2fe'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                    fontSize: '0.88rem', color: '#475569'
                  }}>
                    <span>{duration} giờ × {selectedHour ? priceForHour(selectedHour).toLocaleString() : '—'} VNĐ</span>
                    <strong style={{ color: '#1e293b' }}>{totalPrice.toLocaleString()} VNĐ</strong>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '1rem', fontWeight: 800, color: '#4361ee'
                  }}>
                    <span>Tổng thanh toán</span><span>{totalPrice.toLocaleString()} VNĐ</span>
                  </div>
                </div>

                <button onClick={handleBook}
                  style={{
                    width: '100%', background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(67,97,238,.35)', transition: 'transform .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  Đăng ký sân →
                </button>
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                  Thanh toán 100% online chuyển khoản hoặc tại sân
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ ĐÁNH GIÁ + GỢI Ý — full width bên dưới ══ */}
        <ReviewSection
          court={selectedCourt}
          courts={courts}
          onSelectCourt={(c) => {
            setSelectedCourt(c);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          user={user}
        />
      </div>
    );
  }

  /* ══════════════════════════════════════
     MOBILE LAYOUT — Step by step
  ══════════════════════════════════════ */
  const mCard = {
    background: '#fff', borderRadius: 20,
    boxShadow: '0 2px 16px rgba(0,0,0,.07)',
    border: '1px solid #eef0f6',
    marginBottom: 14, overflow: 'hidden',
  };

  const goNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const goBackMobile = () => { if (step === 0) { setSelectedCourt(null); setPage('home'); } else setStep(s => s - 1); };

  return (
    <div style={{ maxWidth: '100%', fontFamily: 'inherit', background: '#f5f6fa', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <img src={selectedCourt.image} alt={courtName}
          style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,.4) 0%, transparent 45%, rgba(0,0,0,.6) 100%)'
        }} />
        <button onClick={goBackMobile} style={{
          position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,.92)',
          border: 'none', borderRadius: 50, width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 2px 10px rgba(0,0,0,.15)'
        }}>←</button>
        {isVip && (
          <span style={{
            position: 'absolute', top: 14, right: 14,
            background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
            padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800
          }}>✦ VIP</span>
        )}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 1px 6px rgba(0,0,0,.4)' }}>{courtName}</div>
          <div style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.8rem', marginTop: 3 }}>
            🕒 05:00–22:00 &nbsp;·&nbsp; 💰 {selectedCourt.price.toLocaleString()}đ/giờ
          </div>
        </div>
      </div>

      {/* Step bar */}
      <div style={{
        background: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #f0f2f8', position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,.06)', marginBottom: 14
      }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: i < step ? '#22c55e' : i === step ? '#4361ee' : '#e5e7eb',
                color: i <= step ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, transition: 'all .3s'
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: '0.6rem', marginTop: 4, fontWeight: i === step ? 700 : 400,
                color: i === step ? '#4361ee' : i < step ? '#22c55e' : '#9ca3af', whiteSpace: 'nowrap'
              }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 2, marginBottom: 18,
                background: i < step ? '#22c55e' : '#e5e7eb', transition: 'background .3s'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 0 */}
      {step === 0 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ padding: '18px 20px 6px', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>📅 Chọn ngày đặt sân</div>
            <div style={{ padding: '8px 20px 18px' }}>
              <input type="date" value={selectedDate || ''} min={today}
                onChange={e => handleDateChange(e.target.value)}
                style={{
                  width: '100%', border: '2px solid #e0e7ff', borderRadius: 12,
                  padding: '14px 16px', fontSize: '1rem', color: '#1e293b',
                  background: '#f8faff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                }} />
              {selectedDate && (
                <div style={{
                  marginTop: 10, padding: '12px 14px',
                  background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                  borderRadius: 10, fontSize: '0.88rem', color: '#4361ee', fontWeight: 600
                }}>
                  ✅ {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
          <div style={mCard}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 12 }}>💰 Bảng giá</div>
              {[
                ['Giờ thường (05:00–17:00)', `${selectedCourt.price.toLocaleString()}đ/giờ`, '#1e293b'],
                ['Giờ tối (17:00–22:00)', `${Math.floor(selectedCourt.price * 1.3).toLocaleString()}đ/giờ`, '#dc2626'],
                ['💳 Thanh toán', '100% online', '#4361ee'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.87rem' }}>
                  <span style={{ color: '#64748b' }}>{l}</span><strong style={{ color: c }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { if (!selectedDate) { alert('Vui lòng chọn ngày.'); return; } goNext(); }} style={mBtnPrimary}>
            Tiếp theo → Chọn giờ
          </button>

          {/* Đánh giá + Gợi ý trên mobile xuất hiện ở step 0 */}
          <div style={{ marginTop: 8 }}>
            <ReviewSection
              court={selectedCourt}
              courts={courts}
              onSelectCourt={(c) => {
                setSelectedCourt(c);
                setStep(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              user={user}
            />
          </div>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ padding: '16px 20px 8px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 8 }}>🕐 Chọn giờ bắt đầu</div>
              {/* Đã loại bỏ phần chú giải biểu tượng theo yêu cầu */}
            </div>
            <div style={{ padding: '8px 14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {hours.map((hour, index) => {
                const status = getSlotStatus(hour);
                const meta = slotMeta[status];
                const inSel = selectionRange.start != null && index >= selectionRange.start && index <= selectionRange.end;
                const isEve = Number(hour) >= 17;
                return (
                  <button key={hour} type="button" disabled={!meta.ok}
                    onClick={() => { if (!meta.ok) return; setSelectedHour(hour); setDuration(1); setSelectionRange({ start: index, end: index }); }}
                    style={{
                      border: `2px solid ${inSel ? '#4361ee' : meta.border}`,
                      borderRadius: 12, padding: '10px 4px',
                      background: inSel ? 'linear-gradient(135deg,#4361ee,#3a0ca3)' : meta.bg,
                      color: inSel ? '#fff' : meta.color, cursor: meta.ok ? 'pointer' : 'not-allowed',
                      fontSize: '0.82rem', fontWeight: 700,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      transition: 'all .15s', boxShadow: inSel ? '0 4px 12px rgba(67,97,238,.4)' : 'none',
                      transform: inSel ? 'scale(1.06)' : 'scale(1)', minHeight: 58, WebkitTapHighlightColor: 'transparent',
                    }}>
                    <span style={{ fontSize: '0.85rem' }}>{hour}:00</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                      {inSel ? '✓' : status === 'pending' ? '🔒' : status === 'approved' ? '🚫' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedHour && (
            <div style={{ ...mCard, padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 16 }}>⏱️ Số giờ chơi</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <button onClick={() => {
                  const nd = Math.max(1, duration - 1);
                  const s = selectionRange.start ?? hours.indexOf(selectedHour);
                  setDuration(nd); setSelectionRange({ start: s, end: s + nd - 1 });
                }} style={mCircleBtn}>−</button>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#4361ee', lineHeight: 1 }}>{duration}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>giờ</div>
                </div>
                <button disabled={!canExtend()} onClick={() => {
                  const s = selectionRange.start ?? hours.indexOf(selectedHour);
                  setDuration(duration + 1); setSelectionRange({ start: s, end: s + duration });
                }} style={{ ...mCircleBtn, opacity: canExtend() ? 1 : 0.3 }}>+</button>
              </div>
              <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                {selectedHour}:00 → {hours[Math.min(hours.length - 1, hours.indexOf(selectedHour) + duration)]}:00
              </div>
              <div style={{
                marginTop: 12, padding: '12px 14px', background: '#f0f4ff', borderRadius: 10,
                display: 'flex', justifyContent: 'space-between'
              }}>
                <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Tạm tính</span>
                <strong style={{ color: '#4361ee', fontSize: '0.95rem' }}>{totalPrice.toLocaleString()}đ</strong>
              </div>
            </div>
          )}
          <button onClick={() => { if (!selectedHour) { alert('Vui lòng chọn giờ.'); return; } goNext(); }} style={mBtnPrimary}>
            Tiếp theo → Điền thông tin
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ padding: '18px 20px 6px', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>👤 Thông tin đặt sân</div>
            <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={mLabelSt}>Họ và tên *</label>
                <input type="text" value={customerName} placeholder="Nguyễn Văn A"
                  onChange={e => setCustomerName(e.target.value)} style={mInputSt} />
              </div>
              <div>
                <label style={mLabelSt}>Số điện thoại *</label>
                <input type="tel" value={customerPhone} placeholder="0xxxxxxxxx"
                  onChange={e => { setCustomerPhone(e.target.value); setPhoneError(''); }}
                  style={{ ...mInputSt, borderColor: phoneError ? '#ef4444' : '#dde3f0' }} />
                {phoneError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 5 }}>{phoneError}</div>}
              </div>
              <div>
                <label style={mLabelSt}>Ghi chú (tuỳ chọn)</label>
                <input type="text" value={customerNote} placeholder="Yêu cầu thêm..."
                  onChange={e => setCustomerNote(e.target.value)} style={mInputSt} />
              </div>
            </div>
          </div>
          <button onClick={() => {
            if (!customerName.trim()) { alert('Vui lòng nhập tên.'); return; }
            if (!/^0\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) { setPhoneError('SĐT gồm 10 số, bắt đầu bằng 0'); return; }
            setPhoneError(''); goNext();
          }} style={mBtnPrimary}>
            Tiếp theo → Xác nhận
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', padding: '16px 20px', color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>📋 Xác nhận đặt sân</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>Kiểm tra lại trước khi thanh toán</div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['🏸 Sân', courtName],
                ['📅 Ngày', selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''],
                ['🕐 Giờ', `${selectedHour}:00 – ${hours[Math.min(hours.length - 1, hours.indexOf(selectedHour) + duration)]}:00`],
                ['⏱️ Thời lượng', `${duration} giờ`],
                ['👤 Tên', customerName],
                ['📞 SĐT', customerPhone],
                customerNote ? ['📝 Ghi chú', customerNote] : null,
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.88rem', padding: '10px 0', borderBottom: '1px solid #f4f6fb', gap: 8
                }}>
                  <span style={{ color: '#64748b', flexShrink: 0 }}>{label}</span>
                  <strong style={{ color: '#1e293b', textAlign: 'right' }}>{val}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...mCard, padding: '16px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 12 }}>💳 Chi tiết thanh toán</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>{duration} giờ × {priceForHour(selectedHour || '05').toLocaleString()}đ</span>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>{totalPrice.toLocaleString()}đ</span>
            </div>
            <div style={{ height: 1, background: '#f0f2f8', margin: '8px 0' }} />
            <div style={{
              marginTop: 14, padding: '14px 16px',
              background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
              borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Tổng cộng</span>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#4361ee' }}>{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>

          <button onClick={handleBook} style={{ ...mBtnPrimary, background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,.35)' }}>
            ✅ Đăng ký sân
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: 6 }}>
            Thanh toán 100% online chuyển khoản hoặc tại sân
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Desktop shared styles ── */
const labelStyle = { display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10, padding: '9px 12px', fontSize: '0.9rem', color: '#1e293b', background: '#f8faff', outline: 'none', boxSizing: 'border-box' };
const durationBtn = { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#4361ee', color: '#fff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const navBtn = (side) => ({ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 10, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' });

/* ── Mobile shared styles ── */
const mBtnPrimary = { width: '100%', background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(67,97,238,.35)', marginTop: 4, marginBottom: 8, WebkitTapHighlightColor: 'transparent' };
const mCircleBtn = { width: 50, height: 50, borderRadius: '50%', border: 'none', background: '#4361ee', color: '#fff', fontWeight: 800, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', boxShadow: '0 2px 8px rgba(67,97,238,.3)' };
const mLabelSt = { display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' };
const mInputSt = { width: '100%', border: '1.5px solid #dde3f0', borderRadius: 12, padding: '13px 14px', fontSize: '1rem', color: '#1e293b', background: '#f8faff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

/* ── ReviewSection shared styles ── */
const lbSt = { display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inSt = { width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10, padding: '10px 13px', fontSize: '0.9rem', color: '#1e293b', background: '#f8faff', outline: 'none', boxSizing: 'border-box' };