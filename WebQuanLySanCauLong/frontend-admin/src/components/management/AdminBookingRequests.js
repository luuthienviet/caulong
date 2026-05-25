import React, { useState, useMemo } from "react";
import API from "../../api";
import { 
  Check, 
  X, 
  Trash2, 
  Info, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  CreditCard, 
  Plus, 
  Minus,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);

  // Walk-in states
  const [quickBooking, setQuickBooking] = useState(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInDuration, setWalkInDuration] = useState(1);
  const [walkInPayment, setWalkInPayment] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [hoveredCell, setHoveredCell] = useState(null); // format: `${court.id}-${hour}`

  const today = new Date().toISOString().split("T")[0];
  const date = selectedDate || today;
  const scheduleHours = Array.from({ length: 17 }, (_, i) => i + 5);
  const safeCourts = Array.isArray(courts) ? courts.filter(c => c && c.id) : [];

  const pendingCount = bookingRequests.filter(b => b.status === "pending").length;

  // Helper to generate days of the week based on weekOffset
  const weekDays = useMemo(() => {
    const current = new Date();
    const dayOfWeek = current.getDay();
    // In JS: Sunday is 0, Monday is 1, Saturday is 6.
    // Distance to Monday:
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() + distanceToMonday + (weekOffset * 7));

    const days = [];
    const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      
      days.push({
        date: dateStr,
        label: labels[i],
        formattedDate: `${day}/${month}`,
        isToday: dateStr === today
      });
    }
    return days;
  }, [weekOffset, today]);

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
    return bookingRequests.find((b) => {
      if (String(b.courtId) !== String(court.id) || b.date !== date || b.status === "rejected") return false;
      
      const startH = parseInt(b.hour, 10);
      const dur = b.duration || 1;
      const endH = startH + dur;
      return hour >= startH && hour < endH;
    });
  };

  const getSlotStyle = (booking, hourStr, dateStr) => {
    let isPast = false;
    const now = new Date();
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const currentHour = now.getHours();

    if (dateStr < todayStr) isPast = true;
    if (dateStr === todayStr && Number(hourStr) < currentHour) isPast = true;

    if (!booking) {
      if (isPast) return { bg: "bg-slate-50 border-slate-200 text-slate-300", label: "Đã qua", clickable: false, isPast: true };
      return { bg: "bg-white hover:bg-emerald-50/50 border-slate-100 text-slate-400", label: "", clickable: true };
    }
    
    if (booking.status === "pending") return { bg: "bg-amber-50 border-l-4 border-l-amber-500 border-t-slate-150 border-b-slate-150 border-r-slate-150 text-amber-800", label: "Chờ duyệt", clickable: false };
    if (booking.status === "approved") {
      if (isExpired(booking)) return { bg: "bg-slate-50 border-l-4 border-l-slate-400 border-t-slate-150 border-b-slate-150 border-r-slate-150 text-slate-500", label: "Đã hoàn thành", clickable: false };
      if (isCourtPlaying(booking)) return { bg: "bg-blue-50 border-l-4 border-l-blue-500 border-t-slate-150 border-b-slate-150 border-r-slate-150 text-blue-800", label: "Đang đánh", clickable: false };
      return { bg: "bg-rose-50 border-l-4 border-l-rose-500 border-t-slate-150 border-b-slate-150 border-r-slate-150 text-rose-800", label: "Đã đặt", clickable: false };
    }
    return { bg: "bg-slate-50 border-slate-100 text-slate-400", label: "—", clickable: false };
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
        req.phone || req.customerPhone,
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
        customerPhone: walkInPhone,
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
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveSubTab("online")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            activeSubTab === "online"
              ? "bg-white text-emerald-700 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📱 ĐƠN ONLINE
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-extrabold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("walkin")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            activeSubTab === "walkin"
              ? "bg-white text-blue-700 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🏸 ĐẶT WALK-IN
        </button>
      </div>

      {/* ===== TAB ONLINE ===== */}
      {activeSubTab === "online" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-150 shadow-inner">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                📱 Đơn đặt sân trực tuyến
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Khách đặt qua website — duyệt nhanh, xem chi tiết và hủy đơn trực quan.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tất cả các đơn đặt sân cũ?")) {
                  clearOldBookings && clearOldBookings();
                }
              }}
              className="inline-flex items-center gap-2 justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-rose-100 active:scale-95"
            >
              <Trash2 size={16} />
              Dọn lịch cũ
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên khách hàng hoặc số điện thoại..."
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              {[
                { key: "pending", label: "Chờ duyệt" },
                { key: "approved", label: "Đã xác nhận" },
                { key: "playing", label: "Đang chơi" },
                { key: "completed", label: "Hoàn thành" },
                { key: "rejected", label: "Đã hủy" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    statusFilter === option.key
                      ? "bg-white text-slate-950 shadow-md"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* REDESIGNED CARD-STRIP LIST */}
          <div className="space-y-3">
            {sortedRequests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-250 bg-white p-16 text-center text-slate-450 font-bold shadow-sm">
                Không tìm thấy đơn đặt sân phù hợp ở danh mục này.
              </div>
            ) : (
              sortedRequests.map((req) => {
                const id = req._id || req.id;
                const endHour = parseInt(req.hour || 0, 10) + (req.duration || 1);
                const status = getStatusKey(req);
                
                const statusLabel =
                  status === "pending"
                    ? "Chờ duyệt"
                    : status === "approved"
                    ? "Đã xác nhận"
                    : status === "playing"
                    ? "Đang chơi"
                    : status === "completed"
                    ? "Hoàn thành"
                    : "Đã hủy";

                const statusClasses =
                  status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                    : status === "playing"
                    ? "bg-blue-50 text-blue-800 border-blue-200 animate-pulse"
                    : status === "completed"
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";

                const customerName = req.customerName || req.userId?.name || req.userId?.username || "Khách vãng lai";
                const customerPhone = req.phone || req.customerPhone || req.userId?.phone || "";

                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all duration-200 hover:scale-[1.005] group"
                  >
                    {/* Col 1: Customer Profile */}
                    <div className="flex items-center gap-3.5 min-w-[220px]">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-100 to-slate-50 flex items-center justify-center text-slate-700 font-extrabold text-sm border border-slate-200/80 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm tracking-wide">{customerName}</div>
                        {customerPhone ? (
                          <a
                            href={`tel:${customerPhone}`}
                            className="text-xs text-slate-450 hover:text-slate-700 flex items-center gap-1 mt-1 font-semibold transition-colors"
                          >
                            <Phone size={11} className="text-slate-350" />
                            {customerPhone}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-350 italic font-bold">Không có SĐT</span>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Court Info */}
                    <div className="min-w-[150px]">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Sân thi đấu</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-800 border border-slate-200/60 shadow-sm">
                        🏸 {req.courtName || "Chưa xác định"}
                      </span>
                    </div>

                    {/* Col 3: Playing Time */}
                    <div className="min-w-[200px]">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Khung giờ đặt</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          <Calendar size={13} className="text-slate-400" />
                          {req.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-455 font-bold">
                          <Clock size={13} className="text-slate-405" />
                          {String(req.hour || "0").padStart(2, "0")}:00 - {String(endHour).padStart(2, "0")}:00 ({req.duration || 1}h)
                        </div>
                      </div>
                    </div>

                    {/* Col 4: Status Indicator */}
                    <div className="min-w-[120px]">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Trạng thái</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Col 5: Payment Summary */}
                    <div className="min-w-[150px]">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Thanh toán</span>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-xs font-bold flex items-center gap-1 text-slate-755">
                          <CreditCard size={12} className="text-slate-450" />
                          {getPaymentLabel(req)}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-605 tracking-wide mt-0.5">
                          {(req.total || 0).toLocaleString()} VNĐ
                        </div>
                      </div>
                    </div>

                    {/* Col 6: Action buttons */}
                    <div className="flex items-center gap-2 justify-end whitespace-nowrap self-end md:self-auto border-t border-slate-100 pt-3 md:pt-0 md:border-none w-full md:w-auto">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveBooking(id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                          >
                            <Check size={12} className="stroke-[3]" />
                            Duyệt
                          </button>
                          <button
                            onClick={() => setShowRejectModal(req)}
                            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition active:scale-95 cursor-pointer"
                          >
                            <X size={12} className="stroke-[3]" />
                            Từ chối
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => setShowDetailModal(req)}
                        className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all active:scale-95 cursor-pointer bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
                      >
                        <Info size={12} />
                        Chi tiết
                      </button>

                      {status === "approved" ? (
                        <button
                          onClick={() => setShowRejectModal(req)}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2.5 text-xs font-bold hover:bg-rose-100 hover:border-rose-300 transition active:scale-95 cursor-pointer"
                        >
                          <X size={12} className="stroke-[3]" />
                          Hủy lịch
                        </button>
                      ) : status === "pending" ? null : (
                        <button
                          onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt sân này khỏi cơ sở dữ liệu?")) {
                              deleteBooking(id);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-105 text-slate-500 border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Xóa DB
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===== TAB WALK-IN ===== */}
      {activeSubTab === "walkin" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* PREMIUM WEEKDAY PICKER ROW - Slim and Compact Status Bar */}
          <div className="bg-slate-900 text-white rounded-2xl py-3 px-5 shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left label - written in a single horizontal line, compact and elegant */}
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-2 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0" />
                <h4 className="text-xs uppercase tracking-widest font-extrabold whitespace-nowrap">Sơ đồ sân trực tiếp</h4>
              </div>
              <span className="text-slate-700 font-light select-none">|</span>
              <h3 className="text-sm font-black text-white tracking-wide whitespace-nowrap flex items-center gap-1">
                🏸 ĐẶT WALK-IN
              </h3>
              <span className="text-slate-700 font-light select-none">|</span>
              <p className="text-slate-400 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                Lịch:{" "}
                <span className="text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-900 font-extrabold text-[11px]">
                  {date.split("-").reverse().join("/")}
                </span>
              </p>
            </div>

            {/* Premium Center Weekday Selector Track */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-inner w-full md:w-auto overflow-x-auto">
              
              {/* Previous Week Arrow */}
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90 cursor-pointer border border-slate-800"
                title="Tuần trước"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Weekdays Buttons (Thứ 2 - Chủ Nhật) */}
              {weekDays.map((day) => {
                const isSelected = date === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate && setSelectedDate(day.date)}
                    className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all cursor-pointer min-w-[70px] ${
                      isSelected
                        ? "bg-blue-600 text-white font-extrabold shadow-md scale-105 border border-blue-500"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black tracking-wider opacity-90">{day.label}</span>
                    <span className="text-xs font-black mt-0.5">{day.formattedDate}</span>
                    {day.isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                    )}
                  </button>
                );
              })}

              {/* Next Week Arrow */}
              <button
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90 cursor-pointer border border-slate-800"
                title="Tuần sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Schedule Grid (Clean, Spacious, Elegant) */}
          {safeCourts.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-sm text-slate-400 font-semibold">
              Không tìm thấy sân thi đấu hoạt động nào trên hệ thống.
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <div
                  className="grid min-w-[800px]"
                  style={{
                    gridTemplateColumns: `100px repeat(${safeCourts.length}, minmax(160px, 1fr))`,
                  }}
                >
                  {/* Grid Header Corner - Sticky Left */}
                  <div className="bg-slate-50 p-5 text-center font-bold text-xs uppercase text-slate-400 border-b border-r border-slate-200 flex flex-col items-center justify-center min-h-[75px] sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                    <Clock size={14} className="mb-1 text-slate-450" />
                    <span className="font-extrabold tracking-wider">GIỜ</span>
                  </div>
                  
                  {/* Grid Headers for Courts */}
                  {safeCourts.map((court) => (
                    <div
                      key={court.id}
                      className="bg-slate-50 p-4 text-center border-b border-r border-slate-200 flex items-center justify-center flex-col min-h-[75px]"
                    >
                      <span className="font-black text-slate-800 text-sm tracking-wide uppercase">
                        {court.name}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                        {court.price.toLocaleString()} VNĐ / h
                      </span>
                    </div>
                  ))}

                  {/* Grid Rows for Hours */}
                  {scheduleHours.map((hour) => (
                    <React.Fragment key={hour}>
                      {/* Hour Indicator - Sticky Left */}
                      <div className="p-4 text-center border-b border-r border-slate-200 bg-slate-50 text-sm font-extrabold text-slate-500 flex items-center justify-center min-h-[75px] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                      
                      {/* Court Slots */}
                      {safeCourts.map((court) => {
                        const booking = getSlotBooking(court, hour);
                        const style = getSlotStyle(booking, hour, date);
                        const isSelected =
                          quickBooking &&
                          String(quickBooking.court.id) === String(court.id) &&
                          quickBooking.hour === String(hour).padStart(2, "0") &&
                          quickBooking.date === date;
                        const cellId = `${court.id}-${hour}`;
                        const isCellHovered = hoveredCell === cellId;

                        return (
                          <button
                            key={cellId}
                            type="button"
                            disabled={!style.clickable}
                            onClick={() => style.clickable && handleSlotClick(court, hour)}
                            onMouseEnter={() => style.clickable && setHoveredCell(cellId)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`border-b border-r border-slate-200 p-2 min-h-[75px] flex items-center justify-center transition-all ${
                              style.clickable ? "cursor-pointer bg-white" : "cursor-default bg-slate-50/20"
                            } ${
                              isSelected
                                ? "bg-blue-50/60"
                                : isCellHovered
                                ? "bg-emerald-50/40"
                                : ""
                            }`}
                          >
                            {booking ? (
                              // Render a highly premium booked card with a solid left accent border
                              <div className={`w-full h-full min-h-[55px] p-2.5 rounded-2xl text-left border flex flex-col justify-between shadow-sm transition-all duration-200 ${style.bg}`}>
                                <div className="font-extrabold text-xs text-slate-850 truncate flex items-center gap-1.5">
                                  <User size={11} className="text-slate-400 flex-shrink-0" />
                                  <span className="truncate">{booking.customerName || booking.userId?.name || booking.userId?.username || "Khách"}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2.5 text-[9px] font-black uppercase tracking-wider opacity-85">
                                  <span className="px-1.5 py-0.5 bg-white/70 rounded-md border border-slate-200/50">{style.label}</span>
                                  <span className="font-extrabold text-slate-500">{String(booking.hour).padStart(2, "0")}:00-{String(parseInt(booking.hour) + (booking.duration || 1)).padStart(2, "0")}:00</span>
                                </div>
                              </div>
                            ) : isSelected ? (
                              // Render selected state
                              <div className="w-full h-full min-h-[55px] p-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md scale-102 shadow-blue-200 animate-in zoom-in-95 duration-100">
                                <Check size={12} className="stroke-[3]" />
                                ĐANG CHỌN
                              </div>
                            ) : style.isPast ? (
                              <div className="w-full h-full min-h-[55px] rounded-2xl flex items-center justify-center transition-all duration-150">
                                <span className="text-[10px] uppercase font-extrabold text-slate-300 opacity-60">
                                  ĐÃ QUA
                                </span>
                              </div>
                            ) : (
                              // Clean, silent empty cell (no text at all). Displays a delicate, round plus badge on hover that never overflows narrow columns!
                              <div className="w-full h-full min-h-[55px] rounded-2xl flex items-center justify-center transition-all duration-150">
                                <span className={`transition-all duration-200 flex items-center justify-center w-7 h-7 rounded-full text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-200/80 ${
                                  isCellHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                }`}>
                                  <Plus size={14} className="stroke-[3]" />
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[650px] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  ℹ️ Chi Tiết Đơn Đặt Sân
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Mã đơn: #{showDetailModal._id || showDetailModal.id}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2">
              {/* Section 1: Customer Contact info */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User size={13} className="text-slate-400" />
                  Thông tin liên hệ
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2.5 text-xs text-slate-650 font-medium">
                  <div>
                    <span className="font-bold text-slate-900">Khách hàng:</span> {showDetailModal.customerName || showDetailModal.userId?.name || showDetailModal.userId?.username || "Khách vãng lai"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Tên tài khoản:</span> {showDetailModal.userId?.username || "Guest (Vãng lai)"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Số điện thoại:</span> {showDetailModal.phone || showDetailModal.customerPhone || showDetailModal.userId?.phone || "—"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Email:</span> {showDetailModal.userId?.email || "—"}
                  </div>
                  {showDetailModal.customerNote && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                      <span className="font-bold text-slate-900 block mb-1">Ghi chú của khách:</span>
                      <p className="italic text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                        "{showDetailModal.customerNote}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Booking details */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Info size={13} className="text-slate-400" />
                  Chi tiết đặt sân & Thanh toán
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2.5 text-xs text-slate-650 font-medium">
                  <div>
                    <span className="font-bold text-slate-900">Sân đặt:</span> {showDetailModal.courtName}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Ngày chơi:</span> {showDetailModal.date}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Giờ chơi:</span> {String(showDetailModal.hour || "0").padStart(2, "0")}:00 - {String(parseInt(showDetailModal.hour || 0, 10) + (showDetailModal.duration || 1)).padStart(2, "0")}:00 ({showDetailModal.duration || 1} giờ)
                  </div>
                  <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-200/60">
                    <span className="font-bold text-slate-900">Tổng chi phí:</span>
                    <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 shadow-sm">
                      {(showDetailModal.total || 0).toLocaleString()} VNĐ
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Hình thức:</span> {getPaymentLabel(showDetailModal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payment image or Rejection Details at the bottom */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              {showDetailModal.status === "rejected" && showDetailModal.rejectReason ? (
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs text-rose-800 space-y-1.5 font-medium">
                  <p className="font-bold text-rose-900">Đơn đặt sân đã bị từ chối/hủy bỏ:</p>
                  <p className="italic bg-white p-3 rounded-xl border border-rose-200 text-rose-700 shadow-sm font-semibold">
                    "{showDetailModal.rejectReason}"
                  </p>
                </div>
              ) : showDetailModal.paymentImage ? (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-slate-400" />
                    Hình ảnh chuyển khoản minh chứng
                  </h4>
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm h-48 max-w-sm mx-auto">
                    <img
                      src={showDetailModal.paymentImage}
                      alt="payment proof"
                      className="h-full w-full object-cover cursor-zoom-in transition duration-300 group-hover:scale-105"
                      onClick={() => window.open(showDetailModal.paymentImage)}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold cursor-pointer" onClick={() => window.open(showDetailModal.paymentImage)}>
                      Bấm để phóng to ảnh bill 🔍
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-slate-450 flex items-center gap-3">
                  <span className="text-xl">ℹ️</span>
                  <p className="font-semibold leading-relaxed">Giao dịch thanh toán trực tiếp tại sân. Không cần hình ảnh minh chứng chuyển khoản.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              {showDetailModal.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      approveBooking(showDetailModal._id || showDetailModal.id);
                      setShowDetailModal(null);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer active:scale-95"
                  >
                    Duyệt Đơn
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(showDetailModal);
                      setShowDetailModal(null);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white rounded-2xl bg-amber-500 hover:bg-amber-600 transition cursor-pointer active:scale-95"
                  >
                    Từ Chối
                  </button>
                </>
              )}
              {showDetailModal.status === "approved" && (
                <button
                  onClick={() => {
                    setShowRejectModal(showDetailModal);
                    setShowDetailModal(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-2xl bg-rose-600 hover:bg-rose-700 transition cursor-pointer active:scale-95"
                >
                  Hủy Lịch Đặt
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-5 py-2.5 text-xs font-bold border border-slate-200 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== WALK-IN MODAL ===== */}
      {quickBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[460px] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-blue-700 flex items-center gap-1.5">
                  🏸 Đặt sân trực tiếp (Walk-in)
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Tạo đơn đặt sân trực tiếp tại quầy admin</p>
              </div>
              <button
                onClick={() => setQuickBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Court Detail Overview Box */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-700 mb-6 shadow-sm">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Sân thi đấu</span>
                <strong className="text-slate-900 font-extrabold text-sm flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {quickBooking.court.name}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Ngày chơi</span>
                <strong className="text-slate-900 font-extrabold text-sm flex items-center gap-1">
                  <Calendar size={13} className="text-blue-500" />
                  {quickBooking.date}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Giờ bắt đầu</span>
                <strong className="text-slate-900 font-extrabold text-sm flex items-center gap-1">
                  <Clock size={13} className="text-blue-500" />
                  {quickBooking.hour}:00
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Đơn giá/giờ</span>
                <strong className="text-emerald-700 font-extrabold text-sm flex items-center gap-0.5">
                  {(Number(quickBooking.hour) >= 17 ? Math.floor(quickBooking.court.price * 1.3) : quickBooking.court.price).toLocaleString()} VNĐ
                  {Number(quickBooking.hour) >= 17 && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded ml-1 font-bold">Cao điểm</span>}
                </strong>
              </div>
            </div>

            {/* Fields Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1.5">
                  Tên khách hàng *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Nhập họ tên khách hàng..."
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="0xxxxxxxxx (không bắt buộc)"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1.5">
                    Số giờ chơi
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full justify-between">
                    <button
                      onClick={() => setWalkInDuration(Math.max(1, walkInDuration - 1))}
                      className="w-8.5 h-8.5 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition cursor-pointer font-bold"
                    >
                      <Minus size={14} className="stroke-[3]" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">{walkInDuration}</span>
                    <button
                      onClick={() => setWalkInDuration(Math.min(6, walkInDuration + 1))}
                      className="w-8.5 h-8.5 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-650 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition cursor-pointer font-bold"
                    >
                      <Plus size={14} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1.5">
                    Thanh toán
                  </label>
                  <div className="relative">
                    <select
                      value={walkInPayment}
                      onChange={(e) => setWalkInPayment(e.target.value)}
                      className="w-full bg-slate-50 p-3 text-xs font-bold rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer h-11.5"
                    >
                      <option value="cash">💵 Tiền mặt tại quầy</option>
                      <option value="transfer">🏦 Chuyển khoản QR</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Price Summary Box */}
            <div className="mt-6 p-4.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center shadow-inner">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tổng tiền tạm tính:</span>
              <strong className="text-lg font-extrabold text-emerald-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-emerald-150">
                {calculatePrice(quickBooking.court, quickBooking.hour, walkInDuration).toLocaleString()} VNĐ
              </strong>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setQuickBooking(null)}
                className="flex-1 py-3.5 text-xs font-bold border border-slate-200 rounded-2xl bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitWalkIn}
                disabled={loading}
                className="flex-[2] py-3.5 text-xs font-bold text-white rounded-2xl bg-blue-600 hover:bg-blue-700 transition flex justify-center items-center shadow-md shadow-blue-200 cursor-pointer active:scale-95 font-bold"
              >
                {loading ? "⏳ Đang đặt sân..." : "✅ Xác nhận đặt sân"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-[400px] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center font-bold text-lg border border-rose-200 shadow-sm">✕</span>
              <h3 className="text-base font-extrabold">Từ chối/Hủy đơn đặt sân</h3>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-4 space-y-1.5 font-medium">
              <div>
                <span className="font-bold text-slate-800">Khách đặt:</span>{" "}
                {showRejectModal.customerName || showRejectModal.userId?.name || showRejectModal.userId?.username || "Khách"}
              </div>
              <div>
                <span className="font-bold text-slate-800">Sân cầu lông:</span>{" "}
                {showRejectModal.courtName}
              </div>
              <div>
                <span className="font-bold text-slate-800">Thời gian:</span>{" "}
                {showRejectModal.date} lúc {showRejectModal.hour}:00
              </div>
            </div>

            <label className="block text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-2">
              Lý do từ chối/hủy lịch *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do cụ thể để gửi thông báo và lưu lịch sử..."
              className="w-full border border-slate-200 rounded-2xl p-3.5 text-sm outline-none resize-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-semibold text-slate-800"
            />
            
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 py-3 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50 transition cursor-pointer active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) return alert("Nhập lý do!");
                  rejectBooking(showRejectModal._id || showRejectModal.id, rejectReason);
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 py-3 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 transition cursor-pointer active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}