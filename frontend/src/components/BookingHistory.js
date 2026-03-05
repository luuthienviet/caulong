import React from "react";

export default function BookingHistory({
  bookingRequests,
  user,
  cancelBooking,
  adminPhone
}) {

  const myBookings = bookingRequests.filter(
    req => req.customerName === user?.name
  );

  return (
    <section style={{ padding: "40px 10%" }}>
      <h2 style={{ color: "var(--green)" }}>
        LỊCH SỬ ĐẶT SÂN
      </h2>

      {myBookings.length === 0 ? (
        <p>📭 Bạn chưa có yêu cầu đặt sân nào.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sân</th>
              <th>Ngày</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Số giờ</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {myBookings.map(req => {

              const startHour = parseInt(req.hour);
              const duration = req.duration || 1;
              const endHour = startHour + duration;

              return (
                <tr key={req.id}>
                  <td>{req.courtName}</td>
                  <td>{req.date}</td>
                  <td>{startHour}:00</td>
                  <td>{endHour}:00</td>
                  <td>{duration} giờ</td>

                  <td>
                    {req.total
                      ? req.total.toLocaleString() + " VNĐ"
                      : "Chưa tính"}
                  </td>

                  <td
                    style={{
                      fontWeight: "bold",
                      color:
                        req.status === "approved"
                          ? "green"
                          : req.status === "rejected"
                          ? "red"
                          : "orange"
                    }}
                  >
                    {req.status === "approved"
                      ? "Đã duyệt"
                      : req.status === "rejected"
                      ? "Đã hủy"
                      : "Đang chờ duyệt"}
                  </td>

                  <td>
                    {req.status === "pending" && (
                      <button
                        className="btn-cancel"
                        onClick={() => cancelBooking(req.id)}
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    <div className="contact-admin-box">
  <p>📞 Cần hỗ trợ về đặt sân?</p>

  <div className="contact-buttons">
    <a href={`tel:${adminPhone}`} className="btn-call">
      Gọi quản trị
    </a>

    <a
      href={`https://zalo.me/${adminPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-message"
    >
      Chat Zalo
    </a>
  </div>
</div>
    </section>
  );
}