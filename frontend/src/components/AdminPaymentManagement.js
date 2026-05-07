import { useMemo, useState } from 'react';

const statusLabels = {
  success: { label: 'Thành công', badge: 'bg-emerald-100 text-emerald-800' },
  processing: { label: 'Đang xử lý', badge: 'bg-amber-100 text-amber-800' },
  failed: { label: 'Thất bại', badge: 'bg-rose-100 text-rose-700' }
};

const mapPaymentStatus = (booking) => {
  if (booking.status === 'rejected') return 'failed';
  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'remaining_paid') return 'success';
  if (booking.paymentStatus === 'deposit_sent' || booking.paymentStatus === 'pending') return 'processing';
  return 'processing';
};

const formatCurrency = (value) => (value || 0).toLocaleString('vi-VN') + ' VNĐ';
const formatDateTime = (value) => {
  if (!value) return 'Không rõ';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', { hour12: false });
};

const getPaymentMethodLabel = (method) => {
  if (!method) return 'Chưa rõ';
  const key = method.toLowerCase();
  if (key.includes('cash') || key.includes('tại sân')) return 'Tiền mặt';
  if (key.includes('transfer') || key.includes('chuyển khoản')) return 'Chuyển khoản';
  return method;
};

const printInvoice = (booking) => {
  const invoiceHtml = `
    <html>
      <head>
        <title>Hóa đơn ${booking._id || booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; padding: 24px; }
          .wrapper { max-width: 720px; margin: auto; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .badge { padding: 8px 14px; border-radius: 9999px; display: inline-block; font-size: 0.9rem; }
          .line { height: 1px; background: #e2e8f0; margin: 18px 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { text-align: left; padding: 12px 0; }
          .table th { color: #4b5563; }
          .table td { font-weight: 600; }
          .total-row { font-size: 1.05rem; font-weight: 700; }
          .footer { margin-top: 32px; color: #6b7280; font-size: 0.95rem; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div>
              <h1 style="margin:0;font-size:28px;color:#111827;">Hóa đơn thanh toán</h1>
              <div style="margin-top:8px;color:#6b7280;">Mã đơn: ${booking._id || booking.id}</div>
            </div>
            <div class="badge" style="background:#d1fae5;color:#065f46;">${statusLabels[mapPaymentStatus(booking)].label}</div>
          </div>

          <div><strong>Khách hàng:</strong> ${booking.userId?.username || booking.customerName || 'Khách'}</div>
          <div><strong>Email:</strong> ${booking.userId?.email || 'Chưa có'}</div>
          <div><strong>SĐT:</strong> ${booking.userId?.phone || booking.customerPhone || 'Chưa có'}</div>
          <div><strong>Thời gian:</strong> ${formatDateTime(booking.createdAt || booking.updatedAt || booking.date)}</div>
          <div><strong>Phương thức:</strong> ${getPaymentMethodLabel(booking.paymentMethod)}</div>

          <div class="line"></div>

          <table class="table">
            <tr><th>Thông tin</th><th>Giá trị</th></tr>
            <tr><td>Mã giao dịch</td><td>${booking._id || booking.id}</td></tr>
            <tr><td>Sân</td><td>${booking.courtName || 'Không xác định'}</td></tr>
            <tr><td>Ngày</td><td>${booking.date || 'Không rõ'}</td></tr>
            <tr><td>Giờ bắt đầu</td><td>${booking.hour ? `${booking.hour}:00` : 'Không rõ'}</td></tr>
            <tr><td>Thời lượng</td><td>${booking.duration || 1} giờ</td></tr>
            <tr class="total-row"><td>Tổng tiền</td><td>${formatCurrency(booking.total)}</td></tr>
          </table>

          <div class="footer">Hóa đơn được tạo bởi Kontum Badminton Management. Vui lòng lưu bản này để đối chiếu.</div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export default function AdminPaymentManagement({ bookingRequests = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const transactions = useMemo(() => {
    return bookingRequests.map((booking) => ({
      booking,
      id: booking._id || booking.id,
      customer: booking.userId?.username || booking.customerName || 'Khách',
      amount: booking.total || 0,
      time: booking.createdAt || booking.updatedAt || booking.date,
      method: getPaymentMethodLabel(booking.paymentMethod),
      status: mapPaymentStatus(booking)
    }));
  }, [bookingRequests]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((tx) =>
      String(tx.id).toLowerCase().includes(term) ||
      String(tx.customer).toLowerCase().includes(term) ||
      String(tx.method).toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  const selectedTransaction = filteredTransactions.find((tx) => tx.id === selectedPaymentId);

  return (
    <section className="mt-14 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Thanh toán</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Quản lý giao dịch</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Xem lịch sử thanh toán, trạng thái và xuất hóa đơn nhanh.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã, khách hàng hoặc phương thức"
            className="w-full min-w-[280px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-4 font-medium">Mã giao dịch</th>
                <th className="px-4 py-4 font-medium">Khách hàng</th>
                <th className="px-4 py-4 font-medium">Số tiền</th>
                <th className="px-4 py-4 font-medium">Thời gian</th>
                <th className="px-4 py-4 font-medium">Phương thức</th>
                <th className="px-4 py-4 font-medium">Trạng thái</th>
                <th className="px-4 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy giao dịch.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-200 hover:bg-white">
                    <td className="px-4 py-4 font-mono text-slate-700">{tx.id}</td>
                    <td className="px-4 py-4 text-slate-900">{tx.customer}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(tx.amount)}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDateTime(tx.time)}</td>
                    <td className="px-4 py-4 text-slate-600">{tx.method}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusLabels[tx.status].badge}`}>
                        {statusLabels[tx.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentId(tx.id === selectedPaymentId ? null : tx.id)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {selectedPaymentId === tx.id ? 'Ẩn' : 'Chi tiết'}
                        </button>
                        <button
                          type="button"
                          onClick={() => printInvoice(tx.booking)}
                          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Xuất PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 px-4 py-4 md:hidden">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Không tìm thấy giao dịch.</div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{tx.customer}</div>
                    <div className="mt-1 text-xs text-slate-500">{tx.id}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusLabels[tx.status].badge}`}>{statusLabels[tx.status].label}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-900">Số tiền:</span> {formatCurrency(tx.amount)}</div>
                  <div><span className="font-semibold text-slate-900">Thời gian:</span> {formatDateTime(tx.time)}</div>
                  <div><span className="font-semibold text-slate-900">PP thanh toán:</span> {tx.method}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentId(tx.id === selectedPaymentId ? null : tx.id)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {selectedPaymentId === tx.id ? 'Ẩn' : 'Chi tiết'}
                  </button>
                  <button
                    type="button"
                    onClick={() => printInvoice(tx.booking)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Xuất PDF
                  </button>
                </div>
                {selectedPaymentId === tx.id && (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div><strong>Mã giao dịch:</strong> {tx.id}</div>
                    <div><strong>Khách hàng:</strong> {tx.customer}</div>
                    <div><strong>Số tiền:</strong> {formatCurrency(tx.amount)}</div>
                    <div><strong>Thời gian:</strong> {formatDateTime(tx.time)}</div>
                    <div><strong>Thanh toán:</strong> {tx.method}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
