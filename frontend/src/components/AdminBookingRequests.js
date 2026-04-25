import React, { useState } from "react";

export default function AdminBookingRequests({
  bookingRequests,
  approveBooking,
  rejectBooking,
  deleteBooking,
  clearOldBookings
}) {
  const [expandedId, setExpandedId] = useState(null);

  // Kiểm tra xem booking đã kết thúc chưa (chỉ hiển thị cảnh báo)
  const isExpired = (req) => {
    if (req.status !== "approved") return false;
    const now = new Date();
    const startHour = parseInt(req.hour);
    const duration = req.duration || 1;
    const start = new Date(req.date + " " + startHour + ":00");
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    return now > end;
  };

  // Kiểm tra sân đang hoạt động (đang trong giờ)
  const isCourtPlaying = (req) => {
    if (req.status !== "approved") return false;
    const now = new Date();
    const startHour = parseInt(req.hour);
    const duration = req.duration || 1;
    const start = new Date(req.date + " " + startHour + ":00");
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    return now >= start && now < end;
  };

  // Sắp xếp: mới nhất lên đầu
  const sortedRequests = [...bookingRequests].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
        <button className="btn-reject" onClick={() => {
          if (window.confirm("Xóa tất cả các booking đã hết hạn?")) {
            clearOldBookings && clearOldBookings();
          }
        }}>
          🗑 Dọn lịch cũ
        </button>
      </div>

      {sortedRequests.length === 0 ? (
        <p>📭 Không có yêu cầu nào.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Sân</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((req) => {
              const startHour = parseInt(req.hour);
              const duration = req.duration || 1;
              const endHour = startHour + duration;
              const isOpen = expandedId === req.id;

              return (
                <React.Fragment key={req.id}>
                  <tr>
                    <td>{req.userId?.username || req.customerName || "Khách"}</td>
                    <td>{req.courtName || req.courtId?.name || "Không xác định"}</td>
                    <td>{req.date}</td>
                    <td>{startHour}:00 - {endHour}:00</td>
                    <td className={`status-${req.status}`}>
                      {isCourtPlaying(req)
                        ? "🟢 Đang hoạt động"
                        : req.status === "pending"
                        ? "⏳ Chờ duyệt"
                        : req.status === "approved"
                        ? "✅ Đã duyệt"
                        : "❌ Đã hủy"}
                    </td>
                    <td>
                      <button onClick={() => setExpandedId(isOpen ? null : req.id)}>
                        {isOpen ? "Ẩn bớt" : "Xem chi tiết"}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan="6" style={{ background: "#f9f9f9", padding: "15px" }}>
                        <div><strong>📞 Số điện thoại:</strong> {req.phone || "Chưa cập nhật"}</div>
                        <div><strong>⏱ Số giờ thuê:</strong> {duration} giờ</div>
                        <div><strong>💰 Tổng tiền:</strong> {req.total?.toLocaleString()} VNĐ</div>
                        {req.paymentImage && (
                          <div>
                            <strong>🧾 Ảnh chuyển khoản (cọc):</strong><br />
                            <img
                              src={req.paymentImage}
                              alt="payment proof"
                              style={{ width: "200px", borderRadius: "8px", marginTop: "8px", cursor: "pointer" }}
                              onClick={() => window.open(req.paymentImage)}
                            />
                          </div>
                        )}
                        <div style={{ marginTop: "15px" }}>
                          {req.status === "pending" && (
                            <>
                              <button
                                className="btn-approve"
                                onClick={() => {
                                  if (window.confirm("Duyệt đơn đặt sân này?")) approveBooking(req.id);
                                }}
                              >
                                ✅ Duyệt
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => {
                                  if (window.confirm("Từ chối đơn này?")) rejectBooking(req.id);
                                }}
                                style={{ marginLeft: "10px" }}
                              >
                                ❌ Từ chối
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("Xóa booking này khỏi hệ thống?")) deleteBooking(req.id);
                            }}
                            style={{ marginLeft: "10px", background: "#444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            🗑 Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}