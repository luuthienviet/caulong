import React, { useState, useMemo } from "react";
import API from "../api";

export default function AdminBookingRequests({
  bookingRequests = [],
  approveBooking,
  rejectBooking,
  deleteBooking,
  clearOldBookings,
  courts = [],
  refreshBookings,
  selectedDate,
  setSelectedDate,
}) {
  const [activeSubTab, setActiveSubTab] = useState("online");
  const [expandedId, setExpandedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);

  // Walk-in states
  const [quickBooking, setQuickBooking] = useState(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInDuration, setWalkInDuration] = useState(1);
  const [walkInPayment, setWalkInPayment] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];
  const date = selectedDate || today;
  const scheduleHours = Array.from({ length: 17 }, (_, i) => i + 5);
  const safeCourts = Array.isArray(courts) ? courts.filter(c => c && c.id) : [];

  const pendingCount = bookingRequests.filter(b => b.status === "pending").length;

  const isExpired = (req) => {
    if (req.status !== "approved") return false;
    const now = new Date();
    const start = new Date(`${req.date}T${String(req.hour).padStart(2, "0")}:00:00`);
    const end = new Date(start.getTime() + (req.duration || 1) * 3600000);
    return now > end;
  };

  const isCourtPlaying = (req) => {
    if (req.status !== "approved") return false;
    const now = new Date();
    const start = new Date(`${req.date}T${String(req.hour).padStart(2, "0")}:00:00`);
    const end = new Date(start.getTime() + (req.duration || 1) * 3600000);
    return now >= start && now < end;
  };

  const getSlotBooking = (court, hour) => {
    const hourStr = String(hour).padStart(2, "0");
    return bookingRequests.find(
      b => String(b.courtId) === String(court.id) &&
           b.date === date &&
           String(b.hour) === hourStr &&
           b.status !== "rejected"
    );
  };

  const getSlotStyle = (booking) => {
    if (!booking) return { bg: "#d1f5d3", color: "#1e6b21", label: "Trống", clickable: true };
    if (booking.status === "pending") return { bg: "#fff3cd", color: "#92600a", label: "Chờ duyệt", clickable: false };
    if (booking.status === "approved") {
      if (isExpired(booking)) return { bg: "#e0e0e0", color: "#555", label: "Kết thúc", clickable: false };
      if (isCourtPlaying(booking)) return { bg: "#d6eaff", color: "#0057b7", label: "🟢 Đang đánh", clickable: false };
      return { bg: "#ffd6d6", color: "#b91c1c", label: "Đã đặt", clickable: false };
    }
    return { bg: "#f5f5f5", color: "#ccc", label: "—", clickable: false };
  };

  const getStatusKey = (req) => {
    if (req.status === "rejected") return "rejected";
    if (req.status === "pending") return "pending";
    if (req.status === "approved") {
      if (isCourtPlaying(req)) return "playing";
      if (isExpired(req)) return "completed";
      return "approved";
    }
    return "pending";
  };

  const getPaymentLabel = (req) => {
    if (req.paymentImage || req.paymentMethod === "transfer") return "Chuyển khoản";
    if (req.paymentMethod === "cash") return "Tiền mặt";
    return req.paymentMethod || "Chưa rõ";
  };

  const normalizeText = (value) => String(value || "").toLowerCase();

  const filteredRequests = useMemo(() => {
    const query = normalizeText(searchQuery);
    return bookingRequests.filter((req) => {
      const statusKey = getStatusKey(req);
      const matchesStatus = statusFilter === "all" || statusKey === statusFilter;
      const matchesSearch = !query || [
        req.customerName,
        req.userId?.username,
        req.phone,
        req.userId?.phone,
      ].some((value) => normalizeText(value).includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [bookingRequests, searchQuery, statusFilter]);

  const calculatePrice = (court, hour, duration) => {
    if (!court || hour == null) return 0;
    const h = Number(hour);
    const pricePerHour = h >= 17 ? Math.floor(court.price * 1.3) : court.price;
    return pricePerHour * duration;
  };

  const handleSlotClick = (court, hour) => {
    const booking = getSlotBooking(court, hour);
    if (booking) return;
    setQuickBooking({ court, hour: String(hour).padStart(2, "0"), date });
    setWalkInName("");
    setWalkInPhone("");
    setWalkInDuration(1);
    setWalkInPayment("cash");
  };

  const submitWalkIn = async () => {
    if (!walkInName.trim()) return alert("Vui lòng nhập tên khách hàng!");
    if (!quickBooking) return;
    const total = calculatePrice(quickBooking.court, quickBooking.hour, walkInDuration);
    setLoading(true);
    try {
      await API.post("/bookings/admin-booking", {
        courtId: quickBooking.court.id,
        courtName: quickBooking.court.name,
        date: quickBooking.date,
        hour: quickBooking.hour,
        duration: walkInDuration,
        total,
        customerName: walkInName,
        phone: walkInPhone,
        paymentMethod: walkInPayment,
        status: "approved",
      });
      alert(`✅ Đã đặt sân cho ${walkInName}!\nTổng tiền: ${total.toLocaleString()} VNĐ`);
      setQuickBooking(null);
      refreshBookings && refreshBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Đặt sân thất bại!");
    }
    setLoading(false);
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div style={{ padding: "0" }}>
      {/* Sub-tab switcher */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderRadius: "14px", overflow: "hidden", border: "2px solid #e8ecf4", width: "fit-content" }}>
        <button
          onClick={() => setActiveSubTab("online")}
          style={{
            padding: "12px 24px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem",
            background: activeSubTab === "online" ? "#00a651" : "#f8f9fa",
            color: activeSubTab === "online" ? "white" : "#555",
            display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
          }}
        >
          📱 ĐƠN ONLINE
          {pendingCount > 0 && (
            <span style={{ background: "#dc3545", color: "white", borderRadius: "20px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 800 }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("walkin")}
          style={{
            padding: "12px 24px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem",
            background: activeSubTab === "walkin" ? "#0057b7" : "#f8f9fa",
            color: activeSubTab === "walkin" ? "white" : "#555",
            transition: "all 0.2s"
          }}
        >
          🏸 ĐẶT WALK-IN
        </button>
      </div>

      {/* ===== TAB ONLINE ===== */}
      {activeSubTab === "online" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">📱 Đơn đặt sân trực tuyến</h3>
              <p className="mt-2 text-sm text-slate-500">Khách đặt qua website — cần duyệt và quản lý ngay trong admin dashboard.</p>
            </div>
            <button
              onClick={() => { if (window.confirm("Xóa tất cả đơn cũ?")) clearOldBookings && clearOldBookings(); }}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              🗑 Dọn lịch cũ
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Tất cả" },
                { key: "pending", label: "Chờ xác nhận" },
                { key: "approved", label: "Đã xác nhận" },
                { key: "playing", label: "Đang chơi" },
                { key: "completed", label: "Hoàn thành" },
                { key: "rejected", label: "Đã hủy" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${statusFilter === option.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Khách hàng</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">SĐT</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Sân</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Ngày</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Giờ bắt đầu</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Giờ kết thúc</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Trạng thái</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Thanh toán</th>
                    <th className="whitespace-nowrap px-4 py-4 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center text-sm text-slate-500">
                        Không tìm thấy đơn đặt sân phù hợp.
                      </td>
                    </tr>
                  ) : (
                    sortedRequests.map((req) => {
                      const id = req._id || req.id;
                      const endHour = parseInt(req.hour || 0, 10) + (req.duration || 1);
                      const status = getStatusKey(req);
                      const statusLabel = status === "pending" ? "Chờ xác nhận" : status === "approved" ? "Đã xác nhận" : status === "playing" ? "Đang chơi" : status === "completed" ? "Hoàn thành" : "Đã hủy";
                      const statusClasses = status === "pending" ? "bg-amber-100 text-amber-800" : status === "approved" ? "bg-emerald-100 text-emerald-800" : status === "playing" ? "bg-sky-100 text-sky-800" : status === "completed" ? "bg-slate-100 text-slate-800" : "bg-rose-100 text-rose-800";
                      return (
                        <tr key={id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-4">{req.customerName || req.userId?.username || "Khách"}</td>
                          <td className="px-4 py-4">{req.phone || req.userId?.phone || "—"}</td>
                          <td className="px-4 py-4">{req.courtName || "—"}</td>
                          <td className="px-4 py-4">{req.date || "—"}</td>
                          <td className="px-4 py-4">{String(req.hour || "0").padStart(2, "0")}:00</td>
                          <td className="px-4 py-4">{String(endHour).padStart(2, "0")}:00</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4">{getPaymentLabel(req)}</td>
                          <td className="px-4 py-4 space-x-2 whitespace-nowrap">
                            {req.status === "pending" && (
                              <button
                                onClick={() => { if (window.confirm("Xác nhận đơn này?")) approveBooking(id); }}
                                className="rounded-full bg-emerald-600 px-3 py-1 text-white transition hover:bg-emerald-700"
                              >
                                Xác nhận
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedId(expandedId === id ? null : id)}
                              className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-slate-200"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => { if (window.confirm("Hủy lịch này?")) deleteBooking(id); }}
                              className="rounded-full bg-rose-600 px-3 py-1 text-white transition hover:bg-rose-700"
                            >
                              Hủy lịch
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 px-4 py-4 md:hidden">
              {sortedRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">Không tìm thấy đơn đặt sân phù hợp.</div>
              ) : (
                sortedRequests.map((req) => {
                  const id = req._id || req.id;
                  const endHour = parseInt(req.hour || 0, 10) + (req.duration || 1);
                  const status = getStatusKey(req);
                  const statusLabel = status === "pending" ? "Chờ xác nhận" : status === "approved" ? "Đã xác nhận" : status === "playing" ? "Đang chơi" : status === "completed" ? "Hoàn thành" : "Đã hủy";
                  const statusClasses = status === "pending" ? "bg-amber-100 text-amber-800" : status === "approved" ? "bg-emerald-100 text-emerald-800" : status === "playing" ? "bg-sky-100 text-sky-800" : status === "completed" ? "bg-slate-100 text-slate-800" : "bg-rose-100 text-rose-800";
                  return (
                    <div key={id} className="space-y-3 rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{req.customerName || req.userId?.username || "Khách"}</div>
                          <div className="mt-1 text-xs text-slate-500">{req.courtName || "—"} · {req.date}</div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>{statusLabel}</span>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600">
                        <div><span className="font-semibold text-slate-900">SĐT:</span> {req.phone || req.userId?.phone || "—"}</div>
                        <div><span className="font-semibold text-slate-900">Giờ:</span> {String(req.hour || "0").padStart(2, "0")}:00 – {String(endHour).padStart(2, "0")}:00</div>
                        <div><span className="font-semibold text-slate-900">Thanh toán:</span> {getPaymentLabel(req)}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {req.status === "pending" && (
                          <button
                            onClick={() => { if (window.confirm("Xác nhận đơn này?")) approveBooking(id); }}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === id ? null : id)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Hủy lịch này?")) deleteBooking(id); }}
                          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          Hủy lịch
                        </button>
                      </div>
                      {expandedId === id && (
                        <div className="rounded-3xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div><span className="font-semibold text-slate-900">Email:</span> {req.userId?.email || "—"}</div>
                            <div><span className="font-semibold text-slate-900">Số giờ:</span> {req.duration || 1}</div>
                            <div><span className="font-semibold text-slate-900">Tổng tiền:</span> {(req.total || 0).toLocaleString()} VNĐ</div>
                            <div><span className="font-semibold text-slate-900">Hình thức:</span> {getPaymentLabel(req)}</div>
                          </div>
                          {req.paymentImage && (
                            <div className="mt-4">
                              <div className="mb-2 text-xs uppercase tracking-[0.15em] text-slate-500">Ảnh thanh toán</div>
                              <img src={req.paymentImage} alt="payment proof" className="h-28 w-full rounded-2xl object-cover" onClick={() => window.open(req.paymentImage)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB WALK-IN ===== */}
      {activeSubTab === "walkin" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 4px" }}>🏸 Đặt sân Walk-in</h3>
            <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>Khách lên trực tiếp — bấm ô trống để đặt ngay, duyệt luôn</p>
          </div>

          {/* Date picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, color: "#555" }}>Chọn ngày:</label>
            <input type="date" value={date} min={today}
              onChange={e => setSelectedDate && setSelectedDate(e.target.value)}
              style={{ border: "1.5px solid #dde3f0", borderRadius: "10px", padding: "7px 12px", fontSize: "0.9rem" }} />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
            {[
              { bg: "#d1f5d3", color: "#1e6b21", label: "Trống — bấm để đặt" },
              { bg: "#d6eaff", color: "#0057b7", label: "Đang đánh" },
              { bg: "#ffd6d6", color: "#b91c1c", label: "Đã đặt" },
              { bg: "#fff3cd", color: "#92600a", label: "Chờ duyệt (online)" },
              { bg: "#e0e0e0", color: "#555", label: "Kết thúc" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.bg, border: `1.5px solid ${item.color}`, flexShrink: 0 }} />
                <span style={{ color: "#555" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Schedule grid */}
          {safeCourts.length === 0 ? (
            <p style={{ color: "#aaa" }}>Không có sân nào.</p>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: "12px", border: "1.5px solid #eaecf4" }}>
              <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${safeCourts.length}, minmax(130px, 1fr))`, minWidth: "500px" }}>
                {/* Header */}
                <div style={{ background: "#f5f7ff", padding: "11px 14px", fontSize: "0.8rem", fontWeight: 700, color: "#888", textAlign: "center", borderBottom: "2px solid #eaecf4", borderRight: "1.5px solid #eaecf4" }}>
                  Giờ / Sân
                </div>
                {safeCourts.map(court => (
                  <div key={court.id} style={{ padding: "10px 8px", textAlign: "center", borderBottom: "2px solid #eaecf4", borderRight: "1px solid #eaecf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ display: "inline-block", background: "linear-gradient(135deg,#00a651,#007a3d)", color: "white", borderRadius: "20px", padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {court.name}
                    </span>
                  </div>
                ))}

                {/* Rows */}
                {scheduleHours.map(hour => (
                  <React.Fragment key={hour}>
                    <div style={{ padding: "9px 10px", textAlign: "center", fontSize: "0.88rem", fontWeight: 700, color: "#444", background: "#fafbff", borderRight: "1.5px solid #eaecf4", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    {safeCourts.map(court => {
                      const booking = getSlotBooking(court, hour);
                      const style = getSlotStyle(booking);
                      const isSelected = quickBooking && String(quickBooking.court.id) === String(court.id) && quickBooking.hour === String(hour).padStart(2, "0") && quickBooking.date === date;
                      return (
                        <button key={`${court.id}-${hour}`} type="button"
                          disabled={!style.clickable}
                          onClick={() => style.clickable && handleSlotClick(court, hour)}
                          style={{
                            border: "none", borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0",
                            background: isSelected ? "#eef2ff" : "transparent",
                            padding: "7px 6px", cursor: style.clickable ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s"
                          }}
                          onMouseEnter={e => { if (style.clickable) e.currentTarget.style.background = "#eef2ff"; }}
                          onMouseLeave={e => { if (style.clickable && !isSelected) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{
                            display: "inline-block", padding: "5px 12px", borderRadius: "20px",
                            fontSize: "0.75rem", fontWeight: 700,
                            background: isSelected ? "#0057b7" : style.bg,
                            color: isSelected ? "white" : style.color,
                            whiteSpace: "nowrap", transition: "all 0.15s"
                          }}>
                            {isSelected ? "✓ Đã chọn" : style.label}
                            {booking && !isSelected && <span style={{ display: "block", fontSize: "0.65rem", opacity: 0.8 }}>{booking.userId?.username || booking.customerName || ""}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== WALK-IN MODAL ===== */}
      {quickBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#0057b7" }}>🏸 Đặt sân Walk-in</h3>
              <button onClick={() => setQuickBooking(null)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ background: "#f0f7ff", borderRadius: "12px", padding: "12px 16px", marginBottom: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
              <div><span style={{ color: "#888" }}>Sân</span><br /><strong>{quickBooking.court.name}</strong></div>
              <div><span style={{ color: "#888" }}>Ngày</span><br /><strong>{quickBooking.date}</strong></div>
              <div><span style={{ color: "#888" }}>Giờ bắt đầu</span><br /><strong>{quickBooking.hour}:00</strong></div>
              <div><span style={{ color: "#888" }}>Giá/giờ</span><br /><strong>{(Number(quickBooking.hour) >= 17 ? Math.floor(quickBooking.court.price * 1.3) : quickBooking.court.price).toLocaleString()} VNĐ</strong></div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444", display: "block", marginBottom: "6px" }}>Tên khách hàng *</label>
                <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Nhập tên khách..."
                  style={{ width: "100%", border: "1.5px solid #dde3f0", borderRadius: "10px", padding: "9px 12px", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444", display: "block", marginBottom: "6px" }}>Số điện thoại</label>
                <input value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} placeholder="0xxxxxxxxx"
                  style={{ width: "100%", border: "1.5px solid #dde3f0", borderRadius: "10px", padding: "9px 12px", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444", display: "block", marginBottom: "6px" }}>Số giờ</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => setWalkInDuration(Math.max(1, walkInDuration - 1))}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #dde3f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: "1.1rem" }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", minWidth: "30px", textAlign: "center" }}>{walkInDuration}</span>
                    <button onClick={() => setWalkInDuration(Math.min(6, walkInDuration + 1))}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #dde3f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: "1.1rem" }}>+</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444", display: "block", marginBottom: "6px" }}>Thanh toán</label>
                  <select value={walkInPayment} onChange={e => setWalkInPayment(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #dde3f0", borderRadius: "10px", padding: "8px 10px", fontSize: "0.85rem" }}>
                    <option value="cash">💵 Tiền mặt</option>
                    <option value="transfer">🏦 Chuyển khoản</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Total */}
            <div style={{ margin: "18px 0", padding: "14px 16px", background: "#f0fff4", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#555", fontWeight: 600 }}>Tổng tiền:</span>
              <span style={{ color: "#00a651", fontWeight: 800, fontSize: "1.2rem" }}>
                {calculatePrice(quickBooking.court, quickBooking.hour, walkInDuration).toLocaleString()} VNĐ
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setQuickBooking(null)}
                style={{ flex: 1, padding: "11px", border: "1.5px solid #dde3f0", borderRadius: "10px", background: "white", cursor: "pointer", fontWeight: 600, color: "#555" }}>
                Hủy
              </button>
              <button onClick={submitWalkIn} disabled={loading}
                style={{ flex: 2, padding: "11px", border: "none", borderRadius: "10px", background: "#0057b7", color: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
                {loading ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt sân"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "380px" }}>
            <h3 style={{ margin: "0 0 12px", color: "#dc3545" }}>❌ Từ chối đơn</h3>
            <p style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "#555" }}>
              Khách: <strong>{showRejectModal.userId?.username || showRejectModal.customerName}</strong><br />
              Sân: <strong>{showRejectModal.courtName}</strong> — {showRejectModal.date} {showRejectModal.hour}:00
            </p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="Nhập lý do từ chối..."
              style={{ width: "100%", border: "1.5px solid #dde3f0", borderRadius: "10px", padding: "10px", fontSize: "0.9rem", boxSizing: "border-box", resize: "none" }} />
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(""); }}
                style={{ flex: 1, padding: "10px", border: "1.5px solid #dde3f0", borderRadius: "10px", background: "white", cursor: "pointer", fontWeight: 600 }}>
                Hủy
              </button>
              <button onClick={() => {
                if (!rejectReason.trim()) return alert("Nhập lý do từ chối!");
                rejectBooking(showRejectModal._id || showRejectModal.id, rejectReason);
                setShowRejectModal(null);
                setRejectReason("");
              }}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#dc3545", color: "white", cursor: "pointer", fontWeight: 700 }}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}