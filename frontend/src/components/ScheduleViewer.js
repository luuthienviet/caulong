import React, { useState } from 'react';

const scheduleHours = Array.from({ length: 17 }, (_, i) => i + 5);

const getSlotStatus = (court, hour, selectedDate, bookingRequests) => {
  if (!selectedDate) return 'available';

  const today = new Date().toISOString().split('T')[0];
  if (selectedDate === today && hour < new Date().getHours()) return 'past';

  const hourStr = String(hour).padStart(2, '0');
  const booking = bookingRequests.find((b) => {
    const courtMatch =
      String(b.courtId) === String(court.id) ||
      String(b.courtName) === String(court.name);
    return courtMatch && b.date === selectedDate && b.hour === hourStr;
  });

  if (!booking) return 'available';
  if (booking.status === 'approved') return 'approved';
  if (booking.status === 'pending') return 'pending';
  if (booking.status === 'done' || booking.status === 'completed') return 'done';
  return 'available';
};

const statusConfig = {
  available: { label: 'Trống',     className: 'sv-slot-available', clickable: true  },
  approved:  { label: 'Đã đặt',    className: 'sv-slot-approved',  clickable: false },
  pending:   { label: 'Chờ duyệt', className: 'sv-slot-pending',   clickable: false },
  done:      { label: 'Kết thúc',  className: 'sv-slot-done',      clickable: false },
  past:      { label: '—',         className: 'sv-slot-past',      clickable: false },
};

/**
 * ScheduleViewer - dành cho KHÁCH HÀNG
 *
 * Props:
 *   courts          [{id, name, price, ...}]
 *   bookingRequests [{courtId, date, hour, status, ...}]
 *   selectedDate    string YYYY-MM-DD
 *   setSelectedDate setter
 *   onSelectSlot    callback(court, hourStr '05'...'21')
 *   selectedCourt   sân đang chọn (để highlight)
 *   selectedHour    giờ đang chọn '05'...'21' (để highlight)
 */
export default function ScheduleViewer({
  courts = [],
  bookingRequests = [],
  selectedDate,
  setSelectedDate,
  onSelectSlot,
  selectedCourt,
  selectedHour,
}) {
  const today = new Date().toISOString().split('T')[0];
  const date  = selectedDate || today;

  const isSelected = (court, hour) => {
    const hourStr = String(hour).padStart(2, '0');
    return (
      selectedCourt &&
      String(selectedCourt.id) === String(court.id) &&
      selectedHour === hourStr
    );
  };

  return (
    <div className="sv-wrapper">

      {/* ── Header ── */}
      <div className="sv-header">
        <div className="sv-title-group">
          <span className="sv-emoji">📋</span>
          <div>
            <h3 className="sv-title">Lịch đặt sân</h3>
            <p className="sv-subtitle">
              Chọn ngày và bấm vào ô&nbsp;
              <span className="sv-badge-inline">Trống</span>
              &nbsp;để đặt nhanh
            </p>
          </div>
        </div>
        <div className="sv-date-wrap">
          <label className="sv-date-label">Chọn ngày</label>
          <input
            type="date"
            className="sv-date-input"
            value={date}
            min={today}
            onChange={(e) => setSelectedDate && setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="sv-legend">
        {[
          { key: 'available', text: 'Còn trống' },
          { key: 'approved',  text: 'Đã đặt & duyệt' },
          { key: 'pending',   text: 'Chờ duyệt' },
          { key: 'done',      text: 'Đã hoàn thành / Kết thúc' },
        ].map(({ key, text }) => (
          <div key={key} className="sv-legend-item">
            <span className={`sv-legend-dot sv-dot-${key}`} />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {courts.length === 0 ? (
        <p className="sv-empty">Không có sân để hiển thị.</p>
      ) : (
        <div className="sv-scroll">
          <div
            className="sv-grid"
            style={{
              gridTemplateColumns: `90px repeat(${courts.length}, minmax(130px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div className="sv-corner">Giờ / Sân</div>
            {courts.map((court) => (
              <div key={court.id} className="sv-court-header">
                <span className="sv-court-badge">{court.name}</span>
              </div>
            ))}

            {/* Data rows */}
            {scheduleHours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="sv-time-cell">
                  <strong>{String(hour).padStart(2, '0')}:00</strong>
                </div>
                {courts.map((court) => {
                  const status   = getSlotStatus(court, hour, date, bookingRequests);
                  const cfg      = statusConfig[status];
                  const hourStr  = String(hour).padStart(2, '0');
                  const selected = isSelected(court, hour);

                  return (
                    <button
                      key={`${court.id}-${hour}`}
                      type="button"
                      className={[
                        'sv-slot',
                        cfg.className,
                        selected      ? 'sv-slot-selected'  : '',
                        cfg.clickable ? 'sv-slot-clickable' : '',
                      ].join(' ').trim()}
                      disabled={!cfg.clickable}
                      onClick={() => cfg.clickable && onSelectSlot && onSelectSlot(court, hourStr)}
                      title={cfg.clickable ? `Đặt ${court.name} lúc ${hourStr}:00` : cfg.label}
                    >
                      <span className="sv-slot-inner">
                        {selected ? '✓ Đã chọn' : cfg.label}
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Hint bar ── */}
      {selectedCourt && selectedHour && (
        <div className="sv-hint">
          ✅ Đã chọn <strong>{selectedCourt.name}</strong> lúc <strong>{selectedHour}:00</strong>.
          Điền thông tin bên phải và bấm <em>Đặt sân và thanh toán</em>.
        </div>
      )}

      <style>{`
        .sv-wrapper{background:#fff;border-radius:16px;box-shadow:0 2px 20px rgba(0,0,0,.07);padding:22px 20px;margin:20px 0}

        /* header */
        .sv-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:16px}
        .sv-title-group{display:flex;align-items:center;gap:12px}
        .sv-emoji{font-size:26px}
        .sv-title{margin:0 0 3px;font-size:1.1rem;font-weight:700;color:#1a1a2e}
        .sv-subtitle{margin:0;font-size:.82rem;color:#666}
        .sv-badge-inline{display:inline-block;background:#d1f5d3;color:#1e6b21;padding:1px 8px;border-radius:20px;font-size:.78rem;font-weight:600}

        /* date */
        .sv-date-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
        .sv-date-label{font-size:.75rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em}
        .sv-date-input{border:1.5px solid #dde3f0;border-radius:10px;padding:7px 12px;font-size:.9rem;color:#1a1a2e;background:#f7f9ff;outline:none;cursor:pointer;transition:border-color .2s}
        .sv-date-input:focus{border-color:#4361ee}

        /* legend */
        .sv-legend{display:flex;flex-wrap:wrap;gap:12px 18px;margin-bottom:16px}
        .sv-legend-item{display:flex;align-items:center;gap:7px;font-size:.81rem;color:#444}
        .sv-legend-dot{width:13px;height:13px;border-radius:50%;flex-shrink:0}
        .sv-dot-available{background:#d1f5d3;border:1.5px solid #7bc67e}
        .sv-dot-approved {background:#ffd6d6;border:1.5px solid #f28b82}
        .sv-dot-pending  {background:#fff3cd;border:1.5px solid #f0c040}
        .sv-dot-done     {background:#e0e0e0;border:1.5px solid #bbb}

        /* scroll + grid */
        .sv-scroll{overflow-x:auto;border-radius:12px;border:1.5px solid #eaecf4}
        .sv-grid{display:grid;min-width:420px}

        /* corner */
        .sv-corner{background:#f5f7ff;padding:11px 14px;font-size:.8rem;font-weight:700;color:#888;text-align:center;border-bottom:2px solid #eaecf4;border-right:1.5px solid #eaecf4;display:flex;align-items:center;justify-content:center}

        /* court header */
        .sv-court-header{padding:10px 8px;text-align:center;border-bottom:2px solid #eaecf4;border-right:1px solid #eaecf4;display:flex;align-items:center;justify-content:center}
        .sv-court-badge{display:inline-block;background:linear-gradient(135deg,#4361ee,#3a0ca3);color:#fff;border-radius:20px;padding:5px 14px;font-size:.75rem;font-weight:700;letter-spacing:.03em;white-space:nowrap}

        /* time cell */
        .sv-time-cell{padding:9px 10px;text-align:center;font-size:.88rem;color:#444;background:#fafbff;border-right:1.5px solid #eaecf4;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:center}

        /* slot base */
        .sv-slot{border:none;background:transparent;padding:7px 6px;border-bottom:1px solid #f0f0f0;border-right:1px solid #f0f0f0;display:flex;align-items:center;justify-content:center;cursor:default;transition:background .15s}
        .sv-slot-inner{display:inline-block;padding:5px 14px;border-radius:20px;font-size:.78rem;font-weight:600;white-space:nowrap;pointer-events:none;transition:all .15s}

        /* colours */
        .sv-slot-available .sv-slot-inner{background:#d1f5d3;color:#1e6b21}
        .sv-slot-approved  .sv-slot-inner{background:#ffd6d6;color:#b91c1c}
        .sv-slot-pending   .sv-slot-inner{background:#fff3cd;color:#92600a}
        .sv-slot-done      .sv-slot-inner{background:#e0e0e0;color:#555}
        .sv-slot-past      .sv-slot-inner{background:#f5f5f5;color:#ccc}

        /* clickable */
        .sv-slot-clickable{cursor:pointer}
        .sv-slot-clickable:hover{background:#eef2ff}
        .sv-slot-clickable:hover .sv-slot-inner{background:#4361ee;color:#fff;box-shadow:0 2px 8px rgba(67,97,238,.28);transform:scale(1.06)}

        /* selected */
        .sv-slot-selected{background:#eef2ff!important}
        .sv-slot-selected .sv-slot-inner{background:#4361ee!important;color:#fff!important;box-shadow:0 2px 10px rgba(67,97,238,.35)}

        /* last row */
        .sv-grid > *:nth-last-child(-n+${courts.length + 1}){border-bottom:none}

        .sv-empty{color:#aaa;padding:20px 0;text-align:center}

        /* hint */
        .sv-hint{margin-top:14px;padding:10px 16px;background:#eef2ff;border-left:3px solid #4361ee;border-radius:10px;font-size:.87rem;color:#3a0ca3}

        @media(max-width:640px){
          .sv-wrapper{padding:14px 10px}
          .sv-header{flex-direction:column}
          .sv-date-wrap{align-items:flex-start}
          .sv-court-badge{padding:4px 9px;font-size:.7rem}
        }
      `}</style>
    </div>
  );
}