import React, { useState, useMemo } from "react";

const STATUS_CONFIG = {
  pending:  { label: "Chờ duyệt", icon: "⏳", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  approved: { label: "Đã duyệt",  icon: "✅", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  rejected: { label: "Đã từ chối",icon: "❌", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  done:     { label: "Hoàn thành",icon: "🏆", bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
};

const getStatus = (req) => {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  return cfg;
};

// Tính số ngày còn lại đến buổi chơi
const getDaysLeft = (date, hour) => {
  const now = new Date();
  const target = new Date(`${date}T${String(hour).padStart(2,"0")}:00:00`);
  const diff = target - now;
  if (diff < 0) return null; // đã qua
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return { text: hours <= 1 ? "Còn dưới 1 giờ!" : `Còn ${hours} giờ`, urgent: true };
  const days = Math.ceil(diff / 86400000);
  return { text: `Còn ${days} ngày`, urgent: days <= 1 };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const days = ["CN","T2","T3","T4","T5","T6","T7"];
  const dow = new Date(`${y}-${m}-${d}`).getDay();
  return `${days[dow]}, ${d}/${m}/${y}`;
};

const TABS = [
  { key: "all",      label: "Tất cả",     icon: "📋" },
  { key: "upcoming", label: "Sắp tới",    icon: "📅" },
  { key: "pending",  label: "Chờ duyệt",  icon: "⏳" },
  { key: "approved", label: "Đã duyệt",   icon: "✅" },
  { key: "rejected", label: "Đã hủy",     icon: "❌" },
];

export default function BookingHistory({
  bookingRequests,
  user,
  cancelBooking,
  adminPhone,
  highlightBookingId,
  setPage,
  setSelectedCourt,
  setSelectedDate,
  setSelectedHour,
  setDuration,
  courts = [],
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Lọc booking của user
  const myBookings = useMemo(() => {
    return bookingRequests
      .filter(req => {
        const uid = req.userId?._id || req.userId;
        return String(uid) === String(user?.id || user?._id);
      })
      .sort((a, b) => {
        const da = new Date(`${a.date}T${String(a.hour).padStart(2,"0")}:00:00`);
        const db = new Date(`${b.date}T${String(b.hour).padStart(2,"0")}:00:00`);
        return db - da;
      });
  }, [bookingRequests, user]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = myBookings.filter(b => {
      const t = new Date(`${b.date}T${String(b.hour).padStart(2,"0")}:00:00`);
      return t > now && b.status === "approved";
    });
    const totalSpent = myBookings
      .filter(b => b.status === "approved" || b.status === "done")
      .reduce((s, b) => s + (b.total || 0), 0);
    const pending = myBookings.filter(b => b.status === "pending");
    return { total: myBookings.length, upcoming: upcoming.length, pending: pending.length, totalSpent };
  }, [myBookings]);

  // Filter
  const filtered = useMemo(() => {
    const now = new Date();
    if (activeTab === "all") return myBookings;
    if (activeTab === "upcoming") {
      return myBookings.filter(b => {
        const t = new Date(`${b.date}T${String(b.hour).padStart(2,"0")}:00:00`);
        return t > now && (b.status === "approved" || b.status === "pending");
      });
    }
    return myBookings.filter(b => b.status === activeTab);
  }, [myBookings, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const now = new Date();
    return {
      all: myBookings.length,
      upcoming: myBookings.filter(b => {
        const t = new Date(`${b.date}T${String(b.hour).padStart(2,"0")}:00:00`);
        return t > now && (b.status === "approved" || b.status === "pending");
      }).length,
      pending:  myBookings.filter(b => b.status === "pending").length,
      approved: myBookings.filter(b => b.status === "approved").length,
      rejected: myBookings.filter(b => b.status === "rejected").length,
    };
  }, [myBookings]);

  const handleRebook = (booking) => {
    const court = courts.find(c =>
      String(c.id) === String(booking.courtId) || c.name === booking.courtName
    );
    if (court && setSelectedCourt) {
      setSelectedCourt(court);
      if (setSelectedDate) setSelectedDate("");
      if (setSelectedHour) setSelectedHour("");
      if (setDuration) setDuration(1);
      if (setPage) setPage("court-detail");
    }
  };

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* ── Page title ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
          📋 Lịch đặt sân của tôi
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
          Xem lại lịch sử đặt sân, theo dõi trạng thái và quản lý đơn đặt.
        </p>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { icon: "🎯", label: "Tổng đặt",   value: stats.total,   color: "#4361ee", bg: "#eef2ff" },
          { icon: "📅", label: "Sắp tới",    value: stats.upcoming, color: "#059669", bg: "#ecfdf5" },
          { icon: "⏳", label: "Chờ duyệt",  value: stats.pending,  color: "#d97706", bg: "#fffbeb" },
          { icon: "💰", label: "Tổng chi",
            value: stats.totalSpent ? `${Math.round(stats.totalSpent/1000)}k` : "0đ",
            color: "#7c3aed", bg: "#f5f3ff" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 14, padding: "14px 16px",
            border: `1.5px solid ${s.color}22`,
          }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, overflowX: "auto",
        padding: "2px 0", scrollbarWidth: "none",
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const count = tabCounts[tab.key];
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 20, border: "1.5px solid",
              borderColor: active ? "#4361ee" : "#e2e8f0",
              background: active ? "#4361ee" : "#fff",
              color: active ? "#fff" : "#64748b",
              fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              whiteSpace: "nowrap", transition: "all .15s",
              boxShadow: active ? "0 2px 10px rgba(67,97,238,.25)" : "none",
            }}>
              {tab.icon} {tab.label}
              {count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,.25)" : "#f1f5f9",
                  color: active ? "#fff" : "#475569",
                  borderRadius: 99, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 800,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Booking cards ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "#f8faff", borderRadius: 18, border: "1.5px dashed #c7d2fe",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏸</div>
          <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontWeight: 700 }}>
            {activeTab === "all" ? "Bạn chưa có đơn đặt sân nào" : "Không có đơn nào trong mục này"}
          </h3>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.9rem" }}>
            {activeTab === "all"
              ? "Hãy đặt sân đầu tiên của bạn ngay hôm nay!"
              : "Thử chọn tab khác để xem các đơn khác."}
          </p>
          {activeTab === "all" && setPage && (
            <button onClick={() => setPage("home")} style={{
              background: "linear-gradient(135deg,#4361ee,#3a0ca3)", color: "#fff",
              border: "none", borderRadius: 12, padding: "12px 28px",
              fontWeight: 700, fontSize: "0.92rem", cursor: "pointer",
            }}>
              🏸 Đặt sân ngay
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(req => {
            const id = req._id || req.id;
            const isHighlight = String(id) === String(highlightBookingId);
            const statusCfg = getStatus(req);
            const daysLeft = getDaysLeft(req.date, req.hour);
            const startH = parseInt(req.hour);
            const dur = req.duration || 1;
            const endH = startH + dur;
            const expanded = expandedId === id;
            const isPending = req.status === "pending";
            const isApproved = req.status === "approved";
            const isPast = !daysLeft && isApproved;

            return (
              <div key={id} style={{
                background: "#fff",
                border: `1.5px solid ${isHighlight ? "#4361ee" : "#e8ecf6"}`,
                borderRadius: 16,
                boxShadow: isHighlight
                  ? "0 0 0 3px rgba(67,97,238,.15), 0 4px 20px rgba(0,0,0,.07)"
                  : "0 2px 12px rgba(0,0,0,.05)",
                overflow: "hidden",
                transition: "all .2s",
              }}>
                {/* Card header – always visible */}
                <div
                  onClick={() => setExpandedId(expanded ? null : id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                  }}
                >
                  {/* Left: court icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg,#4361ee,#3a0ca3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", flexShrink: 0,
                  }}>🏸</div>

                  {/* Middle: info */}
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: 2 }}>
                      {req.courtName}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>📅 {formatDate(req.date)}</span>
                      <span>🕐 {String(startH).padStart(2,"0")}:00 – {String(endH).padStart(2,"0")}:00</span>
                      <span>⏱ {dur} giờ</span>
                    </div>
                    {/* Countdown badge */}
                    {daysLeft && (
                      <div style={{
                        display: "inline-block", marginTop: 5,
                        padding: "2px 10px", borderRadius: 99,
                        background: daysLeft.urgent ? "#fee2e2" : "#dcfce7",
                        color: daysLeft.urgent ? "#b91c1c" : "#15803d",
                        fontSize: "0.72rem", fontWeight: 700,
                      }}>
                        {daysLeft.urgent ? "⚡" : "⏳"} {daysLeft.text}
                      </div>
                    )}
                  </div>

                  {/* Right: status + chevron */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <div style={{
                      padding: "4px 12px", borderRadius: 99,
                      background: statusCfg.bg, color: statusCfg.color,
                      border: `1.5px solid ${statusCfg.border}`,
                      fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
                    }}>
                      {statusCfg.icon} {statusCfg.label}
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {expanded ? "▲ Thu gọn" : "▼ Chi tiết"}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{
                    borderTop: "1px solid #f1f5f9",
                    padding: "16px 20px",
                    background: "#fafbff",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 24px",
                  }}>
                    {[
                      ["Sân",         req.courtName],
                      ["Ngày",        formatDate(req.date)],
                      ["Giờ bắt đầu", `${String(startH).padStart(2,"0")}:00`],
                      ["Giờ kết thúc",`${String(endH).padStart(2,"0")}:00`],
                      ["Thời lượng",  `${dur} giờ`],
                      ["Tổng tiền",   req.total ? `${req.total.toLocaleString()} VNĐ` : "—"],
                      ["Đặt cọc 50%", req.total ? `${Math.floor(req.total*0.5).toLocaleString()} VNĐ` : "—"],
                      ["Trạng thái",  `${statusCfg.icon} ${statusCfg.label}`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: "0.88rem", color: "#1e293b", fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}

                    {/* Actions */}
                    <div style={{ gridColumn: "1/-1", display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                      {isPending && (
                        <button onClick={() => {
                          if (window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) cancelBooking(id);
                        }} style={{
                          padding: "8px 18px", borderRadius: 10, border: "1.5px solid #fca5a5",
                          background: "#fff", color: "#b91c1c", fontWeight: 700,
                          fontSize: "0.82rem", cursor: "pointer",
                        }}>
                          🗑 Hủy yêu cầu
                        </button>
                      )}
                      {(isPast || req.status === "rejected") && courts.length > 0 && setPage && (
                        <button onClick={() => handleRebook(req)} style={{
                          padding: "8px 18px", borderRadius: 10, border: "none",
                          background: "linear-gradient(135deg,#4361ee,#3a0ca3)",
                          color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                        }}>
                          🔄 Đặt lại sân này
                        </button>
                      )}
                      <a href={`https://zalo.me/${adminPhone}`} target="_blank" rel="noopener noreferrer" style={{
                        padding: "8px 18px", borderRadius: 10, border: "1.5px solid #bae6fd",
                        background: "#f0f9ff", color: "#0369a1", fontWeight: 700,
                        fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center",
                      }}>
                        💬 Liên hệ hỗ trợ
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Support bar ── */}
      <div style={{
        marginTop: 36, background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
        borderRadius: 16, padding: "20px 24px", border: "1.5px solid #bae6fd",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>📞 Cần hỗ trợ?</div>
          <div style={{ fontSize: "0.85rem", color: "#475569" }}>Liên hệ admin để được giải đáp nhanh nhất.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`tel:${adminPhone}`} style={{
            padding: "9px 20px", borderRadius: 10, background: "#4361ee",
            color: "#fff", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
          }}>
            📞 Gọi ngay
          </a>
          <a href={`https://zalo.me/${adminPhone}`} target="_blank" rel="noopener noreferrer" style={{
            padding: "9px 20px", borderRadius: 10, background: "#fff",
            border: "1.5px solid #4361ee", color: "#4361ee",
            fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
          }}>
            💬 Zalo
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .bh-stats { grid-template-columns: repeat(2,1fr) !important; }
          .bh-card-header { grid-template-columns: auto 1fr !important; }
          .bh-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}