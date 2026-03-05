import React, { useState } from "react";

export default function AdminBookingRequests({
  
  bookingRequests,
  approveBooking,
  rejectBooking
}) {
const [expandedId, setExpandedId] = useState(null);
  return (
    <section style={{ padding: "40px 10%" }}>
      <h2 style={{ color: "var(--green)" }}>
        YÊU CẦU ĐẶT SÂN MỚI
      </h2>

      {bookingRequests.length === 0 ? (
        <p>📭 Chưa có yêu cầu nào.</p>
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
  {bookingRequests.map(req => {

    const startHour = parseInt(req.hour);
    const duration = req.duration || 1;
    const endHour = startHour + duration;
    const isOpen = expandedId === req.id;

    return (
      <React.Fragment key={req.id}>

        {/* DÒNG CHÍNH */}
        <tr>
          <td>{req.customerName}</td>
          <td>{req.courtName}</td>
          <td>{req.date}</td>
          <td>{startHour}:00 - {endHour}:00</td>

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
              : "Chờ duyệt"}
          </td>

          <td>
            <button
              onClick={() =>
                setExpandedId(isOpen ? null : req.id)
              }
            >
              {isOpen ? "Ẩn" : "Xem chi tiết"}
            </button>
          </td>
        </tr>

        {/* DÒNG CHI TIẾT */}
        {isOpen && (
          <tr>
            <td colSpan="6" style={{ background: "#f5f5f5" }}>
              <div style={{ padding: "15px" }}>
                <p><strong>SĐT:</strong> {req.phone}</p>
                <p><strong>Số giờ:</strong> {duration} giờ</p>
                <p><strong>Tổng tiền:</strong> {req.total?.toLocaleString()} VNĐ</p>

                {req.status === "pending" && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      className="btn-approve"
                      onClick={() => approveBooking(req.id)}
                    >
                      Duyệt
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() => rejectBooking(req.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Hủy
                    </button>
                  </div>
                )}
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
    </section>
  );
}