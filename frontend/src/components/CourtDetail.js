import React, { useEffect, useState } from 'react';

const STEPS = ['Chọn ngày', 'Chọn giờ', 'Thông tin', 'Xác nhận'];

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
}) {
  const [slideIndex, setSlideIndex]         = useState(0);
  const [step, setStep]                     = useState(0);
  const [customerName, setCustomerName]     = useState(user?.name || user?.username || '');
  const [customerPhone, setCustomerPhone]   = useState(user?.phone || '');
  const [customerNote, setCustomerNote]     = useState('');
  const [phoneError, setPhoneError]         = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: null, end: null });
  const [dragging, setDragging]             = useState(false);
  const [selectionAnchor, setSelectionAnchor] = useState(null);
  const [isMobile, setIsMobile]             = useState(window.innerWidth <= 768);

  const hours = ['05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21'];
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
    const b = bookingRequests.find(
      r => String(r.courtId) === String(selectedCourt.id) && r.date === selectedDate && r.hour === hour
    );
    if (!b) return 'available';
    if (b.status === 'approved') return 'approved';
    if (b.status === 'pending')  return 'pending';
    return 'done';
  };
  const isDisabled = h => ['past','approved','pending','done'].includes(getSlotStatus(h));
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
    available: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', ok: true  },
    approved:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', ok: false },
    pending:   { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', ok: false },
    done:      { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', ok: false },
    past:      { bg: '#f9fafb', color: '#d1d5db', border: '#e5e7eb', ok: false },
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
    setSelectedCourt(null);
  };

  /* ══════════════════════════════════════
     DESKTOP LAYOUT (giữ nguyên như cũ)
  ══════════════════════════════════════ */
  if (!isMobile) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 64px', fontFamily: 'inherit' }}>
        <button onClick={() => { setSelectedCourt(null); setPage('home'); }}
          style={{ background: 'none', border: 'none', color: '#4361ee', fontWeight: 700,
            fontSize: '0.92rem', cursor: 'pointer', marginBottom: 20, padding: 0,
            display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Quay lại danh sách sân
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{courtName}</h1>
          {isVip && (
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
              padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>✦ VIP</span>
          )}
        </div>
        <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem' }}>{courtDesc}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT */}
          <div>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)',
              marginBottom: 20, position: 'relative' }}>
              <img src={galleryImages[slideIndex]} alt={courtName}
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 6 }}>
                {galleryImages.map((_, i) => (
                  <button key={i} onClick={() => setSlideIndex(i)}
                    style={{ width: i === slideIndex ? 22 : 8, height: 8, borderRadius: 99,
                      background: i === slideIndex ? '#fff' : 'rgba(255,255,255,.5)',
                      border: 'none', cursor: 'pointer', padding: 0, transition: 'all .2s' }} />
                ))}
              </div>
              <button onClick={() => setSlideIndex(p => (p - 1 + galleryImages.length) % galleryImages.length)}
                style={navBtn('left')}>❮</button>
              <button onClick={() => setSlideIndex(p => (p + 1) % galleryImages.length)}
                style={navBtn('right')}>❯</button>
            </div>

            <div style={{ background: '#f8faff', borderRadius: 14, padding: '16px 18px',
              marginBottom: 16, border: '1.5px solid #e0e7ff' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 10, fontSize: '0.92rem' }}>💰 Bảng giá</div>
              {[
                ['Giờ thường (05:00–17:00)', `${selectedCourt.price.toLocaleString()} VNĐ/giờ`, '#1e293b'],
                ['Giờ tối (17:00–22:00)', `${Math.floor(selectedCourt.price*1.3).toLocaleString()} VNĐ/giờ`, '#dc2626'],
                ['Đặt cọc', '50% khi đặt', '#4361ee'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.88rem', color: '#475569', marginBottom: 6 }}>
                  <span>{label}</span><strong style={{ color }}>{val}</strong>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12, fontSize: '0.92rem' }}>✨ Tiện ích</div>
              {[['🏸','Thảm Yonex cao cấp'],['💡','Ánh sáng thi đấu chuẩn'],
                ['🛡️','Sàn chống trơn trượt'],['🕒','Mở cửa 05:00 – 22:00'],
                ['💧','Nước uống & WC sạch'],['👥','Không gian thoải mái']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: '0.85rem', color: '#475569', marginBottom: 8 }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 28px rgba(0,0,0,.07)',
              border: '1.5px solid #e8ecf6', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                padding: '18px 24px', color: '#fff' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>📅 Đặt sân ngay</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Chọn ngày → chọn giờ → điền thông tin → thanh toán</div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Chọn ngày</label>
                  <input type="date" value={selectedDate || ''} min={today}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10,
                      padding: '9px 14px', fontSize: '0.95rem', color: '#1e293b',
                      background: '#f8faff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {selectedDate && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Chọn giờ <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.78rem' }}>(kéo để chọn nhiều giờ)</span></label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      {[['available','Còn trống'],['pending','Đang giữ'],['approved','Đã đặt']].map(([k, t]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: slotMeta[k].bg,
                            border: `1.5px solid ${slotMeta[k].border}`, display: 'inline-block' }} />{t}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 6 }}
                      onMouseLeave={() => dragging && setDragging(false)}>
                      {hours.map((hour, index) => {
                        const status = getSlotStatus(hour);
                        const meta   = slotMeta[status];
                        const inSel  = selectionRange.start != null && index >= selectionRange.start && index <= selectionRange.end;
                        const isEve  = Number(hour) >= 17;
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
                              {inSel ? '✓' : status === 'pending' ? '🔒' : status === 'approved' ? '🚫' : isEve ? '🌙' : '☀️'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedHour && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8faff', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                    border: '1.5px solid #e0e7ff' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Thời lượng</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {selectedHour}:00 – {hours[Math.min(hours.length-1, hours.indexOf(selectedHour)+duration)]}:00
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

                <div style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', borderRadius: 14,
                  padding: '16px 18px', marginBottom: 18, border: '1.5px solid #c7d2fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                    fontSize: '0.88rem', color: '#475569' }}>
                    <span>{duration} giờ × {selectedHour ? priceForHour(selectedHour).toLocaleString() : '—'} VNĐ</span>
                    <strong style={{ color: '#1e293b' }}>{totalPrice.toLocaleString()} VNĐ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: '1rem', fontWeight: 800, color: '#4361ee' }}>
                    <span>Đặt cọc 50%</span><span>{deposit.toLocaleString()} VNĐ</span>
                  </div>
                </div>

                <button onClick={handleBook}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(67,97,238,.35)', transition: 'transform .15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  Đặt sân và thanh toán →
                </button>
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                  Cọc 50% giữ chỗ · Phần còn lại thanh toán tại sân
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div style={{
      maxWidth: '100%', fontFamily: 'inherit',
      background: '#f5f6fa', minHeight: '100vh',
      paddingBottom: 100,
    }}>

      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <img src={selectedCourt.image} alt={courtName}
          style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,.4) 0%, transparent 45%, rgba(0,0,0,.6) 100%)',
        }} />
        <button onClick={goBackMobile} style={{
          position: 'absolute', top: 14, left: 14,
          background: 'rgba(255,255,255,.92)', border: 'none', borderRadius: 50,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 2px 10px rgba(0,0,0,.15)',
        }}>←</button>
        {isVip && (
          <span style={{
            position: 'absolute', top: 14, right: 14,
            background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
            padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800,
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
        background: '#fff', padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #f0f2f8',
        position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
        marginBottom: 14,
      }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: i < step ? '#22c55e' : i === step ? '#4361ee' : '#e5e7eb',
                color: i <= step ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, transition: 'all .3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: '0.6rem', marginTop: 4,
                fontWeight: i === step ? 700 : 400,
                color: i === step ? '#4361ee' : i < step ? '#22c55e' : '#9ca3af',
                whiteSpace: 'nowrap',
              }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 2, marginBottom: 18,
                background: i < step ? '#22c55e' : '#e5e7eb', transition: 'background .3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 0 — Chọn ngày */}
      {step === 0 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ padding: '18px 20px 6px', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>📅 Chọn ngày đặt sân</div>
            <div style={{ padding: '8px 20px 18px' }}>
              <input type="date" value={selectedDate || ''} min={today}
                onChange={e => handleDateChange(e.target.value)}
                style={{ width: '100%', border: '2px solid #e0e7ff', borderRadius: 12,
                  padding: '14px 16px', fontSize: '1rem', color: '#1e293b',
                  background: '#f8faff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              {selectedDate && (
                <div style={{ marginTop: 10, padding: '12px 14px',
                  background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                  borderRadius: 10, fontSize: '0.88rem', color: '#4361ee', fontWeight: 600 }}>
                  ✅ {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={mCard}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: 12 }}>💰 Bảng giá</div>
              {[
                ['☀️ Giờ thường (05–17h)', `${selectedCourt.price.toLocaleString()}đ/giờ`, '#1e293b'],
                ['🌙 Giờ tối (17–22h)', `${Math.floor(selectedCourt.price * 1.3).toLocaleString()}đ/giờ`, '#dc2626'],
                ['💳 Đặt cọc', '50% khi đặt', '#4361ee'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.87rem' }}>
                  <span style={{ color: '#64748b' }}>{l}</span>
                  <strong style={{ color: c }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { if (!selectedDate) { alert('Vui lòng chọn ngày.'); return; } goNext(); }} style={mBtnPrimary}>
            Tiếp theo → Chọn giờ
          </button>
        </div>
      )}

      {/* STEP 1 — Chọn giờ */}
      {step === 1 && (
        <div style={{ padding: '0 12px' }}>
          <div style={mCard}>
            <div style={{ padding: '16px 20px 8px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 8 }}>🕐 Chọn giờ bắt đầu</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[['available','Còn trống'],['pending','Đang giữ'],['approved','Đã đặt']].map(([k, t]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#64748b' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: slotMeta[k].bg,
                      border: `1.5px solid ${slotMeta[k].border}`, display: 'inline-block' }} />{t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '8px 14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {hours.map((hour, index) => {
                const status = getSlotStatus(hour);
                const meta   = slotMeta[status];
                const inSel  = selectionRange.start != null && index >= selectionRange.start && index <= selectionRange.end;
                const isEve  = Number(hour) >= 17;
                return (
                  <button key={hour} type="button" disabled={!meta.ok}
                    onClick={() => {
                      if (!meta.ok) return;
                      setSelectedHour(hour); setDuration(1);
                      setSelectionRange({ start: index, end: index });
                    }}
                    style={{
                      border: `2px solid ${inSel ? '#4361ee' : meta.border}`,
                      borderRadius: 12, padding: '10px 4px',
                      background: inSel ? 'linear-gradient(135deg,#4361ee,#3a0ca3)' : meta.bg,
                      color: inSel ? '#fff' : meta.color,
                      cursor: meta.ok ? 'pointer' : 'not-allowed',
                      fontSize: '0.82rem', fontWeight: 700,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      transition: 'all .15s',
                      boxShadow: inSel ? '0 4px 12px rgba(67,97,238,.4)' : 'none',
                      transform: inSel ? 'scale(1.06)' : 'scale(1)',
                      minHeight: 58, WebkitTapHighlightColor: 'transparent',
                    }}>
                    <span style={{ fontSize: '0.85rem' }}>{hour}:00</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                      {inSel ? '✓' : status === 'pending' ? '🔒' : status === 'approved' ? '🚫' : isEve ? '🌙' : '☀️'}
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
              <div style={{ marginTop: 12, padding: '12px 14px', background: '#f0f4ff', borderRadius: 10,
                display: 'flex', justifyContent: 'space-between' }}>
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

      {/* STEP 2 — Thông tin */}
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
            if (!/^0\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) {
              setPhoneError('SĐT gồm 10 số, bắt đầu bằng 0'); return;
            }
            setPhoneError(''); goNext();
          }} style={mBtnPrimary}>
            Tiếp theo → Xác nhận
          </button>
        </div>
      )}

      {/* STEP 3 — Xác nhận */}
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
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.88rem', padding: '10px 0', borderBottom: '1px solid #f4f6fb', gap: 8 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Cọc ngay (50%)</span>
              <span style={{ color: '#4361ee', fontWeight: 700 }}>{deposit.toLocaleString()}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Thanh toán tại sân</span>
              <span style={{ color: '#64748b', fontWeight: 600 }}>{(totalPrice - deposit).toLocaleString()}đ</span>
            </div>
            <div style={{ marginTop: 14, padding: '14px 16px',
              background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
              borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Tổng cộng</span>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#4361ee' }}>{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>

          <button onClick={handleBook} style={{
            ...mBtnPrimary,
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            boxShadow: '0 4px 16px rgba(34,197,94,.35)',
          }}>
            ✅ Xác nhận & Thanh toán
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: 6 }}>
            Cọc 50% giữ chỗ · Còn lại thanh toán tại sân
          </div>
        </div>
      )}
    </div>
  );
}

/* Desktop styles */
const labelStyle = { display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10, padding: '9px 12px', fontSize: '0.9rem', color: '#1e293b', background: '#f8faff', outline: 'none', boxSizing: 'border-box' };
const durationBtn = { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#4361ee', color: '#fff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const navBtn = (side) => ({ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 10, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' });

/* Mobile styles */
const mBtnPrimary = { width: '100%', background: 'linear-gradient(135deg,#4361ee,#3a0ca3)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(67,97,238,.35)', marginTop: 4, marginBottom: 8, WebkitTapHighlightColor: 'transparent' };
const mCircleBtn = { width: 50, height: 50, borderRadius: '50%', border: 'none', background: '#4361ee', color: '#fff', fontWeight: 800, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', boxShadow: '0 2px 8px rgba(67,97,238,.3)' };
const mLabelSt = { display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' };
const mInputSt = { width: '100%', border: '1.5px solid #dde3f0', borderRadius: 12, padding: '13px 14px', fontSize: '1rem', color: '#1e293b', background: '#f8faff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };