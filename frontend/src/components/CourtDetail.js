import React, { useEffect, useState } from 'react';

/**
 * CourtDetail – hiển thị chi tiết 1 sân + đặt sân trực tiếp
 * ✅ FIX: isHourDisabled chặn cả 'approved' lẫn 'pending'
 *         → khách không thể chọn giờ đã có người đang chờ duyệt
 */
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
  const [slideIndex, setSlideIndex]           = useState(0);
  const [customerName, setCustomerName]       = useState(user?.name || user?.username || '');
  const [customerPhone, setCustomerPhone]     = useState(user?.phone || '');
  const [customerNote, setCustomerNote]       = useState('');
  const [phoneError, setPhoneError]           = useState('');
  const [selectionRange, setSelectionRange]   = useState({ start: null, end: null });
  const [dragging, setDragging]               = useState(false);
  const [selectionAnchor, setSelectionAnchor] = useState(null);

  const hours = ['05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21'];

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
    return () => window.removeEventListener('mouseup', up);
  }, []);

  if (!selectedCourt) return null;

  const today = new Date().toISOString().split('T')[0];

  /* ── Slot status ── */
  const getSlotStatus = (hour) => {
    // Giờ đã qua (hôm nay)
    if (selectedDate === today && Number(hour) < new Date().getHours()) return 'past';

    const booking = bookingRequests.find(
      r => String(r.courtId) === String(selectedCourt.id) &&
           r.date === selectedDate &&
           r.hour === hour
    );
    if (!booking) return 'available';
    if (booking.status === 'approved') return 'approved';

    // ✅ FIX: pending cũng bị chặn — hiển thị màu vàng, không cho chọn
    if (booking.status === 'pending') return 'pending';

    return 'done';
  };

  const isDisabled = (hour) => {
    const s = getSlotStatus(hour);
    // ✅ FIX: thêm 'pending' vào danh sách bị chặn
    return s === 'past' || s === 'approved' || s === 'pending' || s === 'done';
  };

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

  const priceForHour = (h) =>
    Number(h) >= 17 ? Math.floor(selectedCourt.price * 1.3) : selectedCourt.price;

  const totalPrice = (() => {
    if (selectionRange.start == null || selectionRange.end == null) return 0;
    let t = 0;
    for (let i = selectionRange.start; i <= selectionRange.end; i++) t += priceForHour(hours[i]);
    return t;
  })();
  const deposit = Math.floor(totalPrice * 0.5);

  const handleDateChange = (v) => {
    setSelectedDate(v);
    setSelectedHour('');
    setDuration(1);
    setSelectionRange({ start: null, end: null });
  };

  const handleBook = () => {
    if (!selectedDate || !selectedHour) { alert('Vui lòng chọn ngày và giờ.'); return; }
    if (!customerName.trim())           { alert('Vui lòng nhập tên người đặt.'); return; }
    if (!/^0\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) {
      setPhoneError('SĐT Việt Nam gồm 10 chữ số, bắt đầu bằng 0'); return;
    }
    setPhoneError('');
    onGoToPayment({
      selectedCourt, selectedDate, selectedHour, duration,
      totalPrice, depositAmount: deposit,
      customerName:  customerName.trim(),
      customerPhone: customerPhone.replace(/\s+/g, ''),
      customerNote:  customerNote.trim(),
      user,
    });
    setSelectedCourt(null);
  };

  /* ── Màu sắc từng trạng thái ── */
  const slotMeta = {
    available: { label: 'Trống',      bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', cursor: true,  icon: '' },
    approved:  { label: 'Đã đặt',    bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', cursor: false, icon: '' },
    // ✅ FIX: pending hiển thị màu vàng rõ ràng để khách biết giờ đó đang bị giữ chỗ
    pending:   { label: 'Đang giữ',  bg: '#fef3c7', color: '#92400e', border: '#fcd34d', cursor: false, icon: '' },
    done:      { label: 'Kết thúc',  bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', cursor: false, icon: '' },
    past:      { label: '—',         bg: '#f9fafb', color: '#d1d5db', border: '#e5e7eb', cursor: false, icon: '' },
  };

  const galleryImages = [selectedCourt.image, selectedCourt.image, selectedCourt.image];
  const isVip = selectedCourt.name.toLowerCase().includes('vip');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 64px', fontFamily: 'inherit' }}>

      {/* Back */}
      <button
        onClick={() => { setSelectedCourt(null); setPage('home'); }}
        style={{ background: 'none', border: 'none', color: '#4361ee', fontWeight: 700,
          fontSize: '0.92rem', cursor: 'pointer', marginBottom: 20, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Quay lại danh sách sân
      </button>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{selectedCourt.name}</h1>
        {isVip && (
          <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff',
            padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
            ✦ VIP
          </span>
        )}
      </div>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem' }}>
        {selectedCourt.desc || selectedCourt.description}
      </p>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div>
          {/* Gallery */}
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)',
            marginBottom: 20, position: 'relative' }}>
            <img src={galleryImages[slideIndex]} alt={selectedCourt.name}
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

          {/* Giá */}
          <div style={{ background: '#f8faff', borderRadius: 14, padding: '16px 18px',
            marginBottom: 16, border: '1.5px solid #e0e7ff' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 10, fontSize: '0.92rem' }}>💰 Bảng giá</div>
            {[
              ['Giờ thường (05:00–17:00)', `${selectedCourt.price.toLocaleString()} VNĐ/giờ`, '#1e293b'],
              ['Giờ tối (17:00–22:00)',    `${Math.floor(selectedCourt.price*1.3).toLocaleString()} VNĐ/giờ`, '#dc2626'],
              ['Đặt cọc',                  '50% khi đặt', '#4361ee'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '0.88rem', color: '#475569', marginBottom: 6 }}>
                <span>{label}</span>
                <strong style={{ color }}>{val}</strong>
              </div>
            ))}
          </div>

          {/* Tiện ích */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12, fontSize: '0.92rem' }}>✨ Tiện ích</div>
            {[
              ['🏸','Thảm Yonex cao cấp'],['💡','Ánh sáng thi đấu chuẩn'],
              ['🛡️','Sàn chống trơn trượt'],['🕒','Mở cửa 05:00 – 22:00'],
              ['💧','Nước uống & WC sạch'],['👥','Không gian thoải mái'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10,
                fontSize: '0.85rem', color: '#475569', marginBottom: 8 }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 28px rgba(0,0,0,.07)',
            border: '1.5px solid #e8ecf6', overflow: 'hidden' }}>

            {/* Card header */}
            <div style={{ background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
              padding: '18px 24px', color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>📅 Đặt sân ngay</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                Chọn ngày → chọn giờ → điền thông tin → thanh toán
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* Chọn ngày */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Chọn ngày</label>
                <input type="date" value={selectedDate || ''} min={today}
                  onChange={e => handleDateChange(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10,
                    padding: '9px 14px', fontSize: '0.95rem', color: '#1e293b',
                    background: '#f8faff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Grid giờ */}
              {selectedDate && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>
                    Chọn giờ&nbsp;
                    <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.78rem' }}>
                      (kéo chuột để chọn nhiều giờ)
                    </span>
                  </label>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    {[
                      ['available','Còn trống'],
                      ['pending',  'Đang giữ chỗ'],   // ✅ thêm legend pending
                      ['approved', 'Đã đặt'],
                    ].map(([k, t]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%',
                          background: slotMeta[k].bg, border: `1.5px solid ${slotMeta[k].border}`,
                          display: 'inline-block' }} />
                        {t}
                      </div>
                    ))}
                  </div>

                  {/* Slots */}
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))', gap: 6 }}
                    onMouseLeave={() => dragging && setDragging(false)}
                  >
                    {hours.map((hour, index) => {
                      const status = getSlotStatus(hour);
                      const meta   = slotMeta[status];
                      const inSel  = selectionRange.start != null && selectionRange.end != null
                        && index >= selectionRange.start && index <= selectionRange.end;
                      const isEve  = Number(hour) >= 17;

                      return (
                        <button
                          key={hour}
                          type="button"
                          disabled={!meta.cursor}
                          title={
                            status === 'pending'
                              ? 'Giờ này đang có người chờ duyệt, không thể đặt'
                              : status === 'approved'
                              ? 'Giờ này đã được đặt'
                              : `Đặt ${hour}:00`
                          }
                          onMouseDown={() => {
                            if (!meta.cursor) return;
                            setDragging(true);
                            setSelectionAnchor(index);
                            setSelectionRange({ start: index, end: index });
                            setSelectedHour(hour);
                            setDuration(1);
                          }}
                          onMouseEnter={() => {
                            if (!dragging || selectionAnchor == null) return;
                            const r = getDragRange(selectionAnchor, index);
                            if (r) {
                              setSelectionRange(r);
                              setSelectedHour(hours[r.start]);
                              setDuration(r.end - r.start + 1);
                            }
                          }}
                          style={{
                            border: `2px solid ${inSel ? '#4361ee' : meta.border}`,
                            borderRadius: 10, padding: '8px 4px',
                            background: inSel ? '#4361ee' : meta.bg,
                            color: inSel ? '#fff' : meta.color,
                            cursor: meta.cursor ? 'pointer' : 'not-allowed',
                            fontSize: '0.8rem', fontWeight: 700,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            transition: 'all .15s',
                            transform: inSel ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: inSel ? '0 2px 8px rgba(67,97,238,.3)' : 'none',
                          }}
                        >
                          <span>{hour}:00</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.85 }}>
                            {inSel
                              ? '✓'
                              : status === 'pending'
                              ? '🔒'          // ✅ icon khoá cho pending
                              : status === 'approved'
                              ? '🚫'
                              : isEve ? '🌙' : '☀️'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thời lượng */}
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
                      setDuration(nd);
                      if (s >= 0) setSelectionRange({ start: s, end: s + nd - 1 });
                    }} style={durationBtn}>−</button>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b',
                      minWidth: 50, textAlign: 'center' }}>{duration} giờ</span>
                    <button disabled={!canExtend()} onClick={() => {
                      const s = selectionRange.start ?? hours.indexOf(selectedHour);
                      setDuration(duration + 1);
                      if (s >= 0) setSelectionRange({ start: s, end: s + duration });
                    }} style={{ ...durationBtn, opacity: canExtend() ? 1 : 0.35 }}>+</button>
                  </div>
                </div>
              )}

              {/* Form thông tin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Tên người đặt</label>
                  <input type="text" value={customerName} placeholder="Tên đầy đủ"
                    onChange={e => { setCustomerName(e.target.value); setPhoneError(''); }}
                    style={inputStyle} />
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
                    onChange={e => setCustomerNote(e.target.value)}
                    style={inputStyle} />
                </div>
              </div>

              {/* Tổng tiền */}
              <div style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', borderRadius: 14,
                padding: '16px 18px', marginBottom: 18, border: '1.5px solid #c7d2fe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                  fontSize: '0.88rem', color: '#475569' }}>
                  <span>
                    {duration} giờ × {selectedHour ? priceForHour(selectedHour).toLocaleString() : '—'} VNĐ
                  </span>
                  <strong style={{ color: '#1e293b' }}>{totalPrice.toLocaleString()} VNĐ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: '1rem', fontWeight: 800, color: '#4361ee' }}>
                  <span>Đặt cọc 50%</span>
                  <span>{deposit.toLocaleString()} VNĐ</span>
                </div>
              </div>

              {/* Nút đặt */}
              <button onClick={handleBook}
                style={{ width: '100%', background: 'linear-gradient(135deg,#4361ee,#3a0ca3)',
                  color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                  fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(67,97,238,.35)', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
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

const labelStyle = {
  display: 'block', marginBottom: 6, fontSize: '0.82rem',
  fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em',
};
const inputStyle = {
  width: '100%', border: '1.5px solid #dde3f0', borderRadius: 10,
  padding: '9px 12px', fontSize: '0.9rem', color: '#1e293b',
  background: '#f8faff', outline: 'none', boxSizing: 'border-box',
};
const durationBtn = {
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  background: '#4361ee', color: '#fff', fontWeight: 800,
  fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
const navBtn = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 10, background: 'rgba(255,255,255,.85)', border: 'none',
  borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
  fontWeight: 800, fontSize: '0.9rem', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
});