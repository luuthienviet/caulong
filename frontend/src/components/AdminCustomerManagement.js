import { useMemo, useState } from 'react';
import API from '../api';

const getUserName = (user) => user?.name || user?.username || 'Khách';
const getUserEmail = (user) => user?.email || 'Chưa có';
const getUserPhone = (user) => user?.phone || 'Chưa có';
const formatMoney = (value) => (value || 0).toLocaleString('vi-VN') + ' VNĐ';

export default function AdminCustomerManagement({ users = [], bookingRequests = [], refreshUsers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const customers = useMemo(() => {
    return users.map((user) => {
      const userId = String(user._id || user.id || '');
      const bookings = bookingRequests.filter((booking) => {
        const bookingUserId = booking.userId?._id || booking.userId;
        if (bookingUserId && String(bookingUserId) === userId) return true;
        if ((!bookingUserId || bookingUserId === '') && booking.customerName) {
          const username = getUserName(user).toLowerCase();
          return booking.customerName.toLowerCase() === username;
        }
        return false;
      });

      const totalBookings = bookings.length;
      const totalSpent = bookings
        .filter((booking) => booking.status === 'approved')
        .reduce((sum, booking) => sum + (booking.total || 0), 0);
      const lastBooking = bookings
        .map((booking) => booking.date)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || null;

      return {
        ...user,
        userId,
        bookings,
        totalBookings,
        totalSpent,
        lastBooking,
      };
    });
  }, [users, bookingRequests]);

  const filteredCustomers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      getUserName(customer).toLowerCase().includes(term) ||
      getUserEmail(customer).toLowerCase().includes(term) ||
      getUserPhone(customer).toLowerCase().includes(term)
    );
  }, [customers, searchQuery]);

  const selectedCustomer = filteredCustomers.find((customer) => customer.userId === selectedCustomerId);

  const handleToggleLock = async (customer) => {
    setError('');
    setActionLoading(true);
    try {
      await API.put(`/auth/users/${customer.userId}/lock`, { isLocked: !customer.isLocked });
      await refreshUsers?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Cập nhật trạng thái tài khoản thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel = (customer) => {
    if (customer.isLocked) return 'Bị khóa';
    if (customer.totalBookings === 0) return 'Chưa đặt';
    return 'Hoạt động';
  };

  return (
    <section className="mt-14 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Khách hàng</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Quản lý khách hàng</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Danh sách khách, thống kê đặt sân và lịch sử đơn hàng của từng khách.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            className="w-full min-w-[280px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setSearchQuery('')}
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
                <th className="px-4 py-4 font-medium">Khách hàng</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Số điện thoại</th>
                <th className="px-4 py-4 font-medium">Đơn đã đặt</th>
                <th className="px-4 py-4 font-medium">Tổng chi</th>
                <th className="px-4 py-4 font-medium">Lần đặt gần nhất</th>
                <th className="px-4 py-4 font-medium">Trạng thái</th>
                <th className="px-4 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy khách hàng.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.userId} className="border-t border-slate-200 hover:bg-white">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                          {getUserName(customer).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{getUserName(customer)}</div>
                          <div className="text-xs text-slate-500">{customer.username || customer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{getUserEmail(customer)}</td>
                    <td className="px-4 py-4 text-slate-600">{getUserPhone(customer)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{customer.totalBookings}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{formatMoney(customer.totalSpent)}</td>
                    <td className="px-4 py-4 text-slate-600">{customer.lastBooking ? new Date(customer.lastBooking).toLocaleDateString('vi-VN') : 'Chưa có'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {statusLabel(customer)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.userId === selectedCustomerId ? null : customer.userId)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {selectedCustomerId === customer.userId ? 'Ẩn lịch sử' : 'Lịch sử'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleLock(customer)}
                          disabled={actionLoading}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition ${customer.isLocked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                        >
                          {customer.isLocked ? 'Mở khóa' : 'Khóa'}
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
          {filteredCustomers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Không tìm thấy khách hàng.</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.userId} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {getUserName(customer).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{getUserName(customer)}</div>
                    <div className="text-xs text-slate-500">{getUserEmail(customer)}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-900">SĐT:</span> {getUserPhone(customer)}</div>
                  <div><span className="font-semibold text-slate-900">Đơn đã đặt:</span> {customer.totalBookings}</div>
                  <div><span className="font-semibold text-slate-900">Tổng chi:</span> {formatMoney(customer.totalSpent)}</div>
                  <div><span className="font-semibold text-slate-900">Trạng thái:</span> {statusLabel(customer)}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerId(customer.userId === selectedCustomerId ? null : customer.userId)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {selectedCustomerId === customer.userId ? 'Ẩn lịch sử' : 'Lịch sử'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLock(customer)}
                    disabled={actionLoading}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${customer.isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                  >
                    {customer.isLocked ? 'Mở khóa' : 'Khóa'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Lịch sử đặt sân của {getUserName(selectedCustomer)}</h3>
              <p className="text-sm text-slate-500">Xem các đơn đặt sân đã tạo bởi khách này.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCustomerId(null)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Đóng
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[22px] border border-slate-200 bg-white p-4">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Giờ</th>
                  <th className="px-4 py-3">Sân</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomer.bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">Chưa có lịch sử đặt sân.</td>
                  </tr>
                ) : (
                  selectedCustomer.bookings
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((booking) => (
                      <tr key={booking._id || booking.id} className="border-t border-slate-200">
                        <td className="px-4 py-4">{booking.date}</td>
                        <td className="px-4 py-4">{booking.hour}:00</td>
                        <td className="px-4 py-4">{booking.courtName || '—'}</td>
                        <td className="px-4 py-4">{formatMoney(booking.total)}</td>
                        <td className="px-4 py-4">{booking.status === 'approved' ? 'Đã duyệt' : booking.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
    </section>
  );
}
