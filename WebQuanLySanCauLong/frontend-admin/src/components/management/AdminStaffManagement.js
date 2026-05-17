import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Mail, Phone, Calendar, Shield, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import API from '../../api';

export default function AdminStaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Nhân viên trực sân',
    phone: '',
    email: '',
    shift: 'Ca sáng (06:00 - 14:00)',
    salary: '',
    status: 'Hoạt động'
  });

  const roles = ["Quản lý", "Nhân viên trực sân", "Nhân viên thu ngân", "Kỹ thuật viên bảo trì sân"];
  const shifts = ["Ca sáng (06:00 - 14:00)", "Ca chiều (14:00 - 22:00)", "Ca tối (17:00 - 22:00)", "Cả ngày", "Ca gãy (theo lịch)"];

  // Fetch staff list from backend on mount
  const fetchStaff = async () => {
    try {
      const res = await API.get('/auth/staff');
      setStaffList(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách nhân viên:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Open modal for add or edit
  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name || '',
        username: staff.username || '',
        password: '', // Keep password blank when opening edit modal
        role: staff.role === 'manager' ? 'Quản lý' : (staff.role === 'staff' ? 'Nhân viên trực sân' : staff.role),
        phone: staff.phone || '',
        email: staff.email || '',
        shift: staff.shift || 'Ca sáng (06:00 - 14:00)',
        salary: staff.salary || '',
        status: staff.status || 'Hoạt động'
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'Nhân viên trực sân',
        phone: '',
        email: '',
        shift: 'Ca sáng (06:00 - 14:00)',
        salary: '',
        status: 'Hoạt động'
      });
    }
    setShowModal(true);
  };

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // If editing and no password is set, remove it from payload
      if (editingStaff && !payload.password) {
        delete payload.password;
      }

      if (editingStaff) {
        // Edit API
        await API.put(`/auth/staff/${editingStaff._id || editingStaff.id}`, payload);
        alert('Cập nhật nhân viên thành công!');
      } else {
        // Add API
        await API.post('/auth/staff', payload);
        alert('Thêm nhân viên thành công!');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Lỗi khi lưu nhân viên:', err);
      alert(err.response?.data?.message || 'Lưu nhân viên thất bại');
    }
  };

  // Delete Staff
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) {
      try {
        await API.delete(`/auth/staff/${id}`);
        alert('Xóa nhân viên thành công!');
        fetchStaff();
      } catch (err) {
        console.error('Lỗi khi xóa nhân viên:', err);
        alert(err.response?.data?.message || 'Xóa nhân viên thất bại');
      }
    }
  };

  // Toggle Status
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'Hoạt động' ? 'Tạm nghỉ' : 'Hoạt động';
    try {
      await API.put(`/auth/staff/${staff._id || staff.id}`, { status: nextStatus });
      fetchStaff();
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái:', err);
      alert(err.response?.data?.message || 'Đổi trạng thái thất bại');
    }
  };

  // Filtered and searched list
  const filteredStaff = useMemo(() => {
    return staffList.filter(item => {
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.phone || '').includes(searchQuery);
      
      // Map display roles to system roles
      let matchesRole = false;
      if (roleFilter === 'All') {
        matchesRole = true;
      } else {
        const itemRoleLower = (item.role || '').toLowerCase();
        if (roleFilter === 'Quản lý') {
          matchesRole = itemRoleLower === 'manager' || itemRoleLower === 'admin';
        } else if (roleFilter === 'Nhân viên trực sân') {
          matchesRole = itemRoleLower === 'staff' && (item.shift || '').toLowerCase().includes('trực sân');
        } else if (roleFilter === 'Nhân viên thu ngân') {
          matchesRole = itemRoleLower === 'staff' && (item.shift || '').toLowerCase().includes('thu ngân');
        } else {
          matchesRole = itemRoleLower === 'staff';
        }
      }

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter]);

  // Calculations for stats cards
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(item => item.status === 'Hoạt động').length;
    const totalPayroll = staffList.reduce((sum, item) => sum + (item.salary || 0), 0);
    return { total, active, totalPayroll };
  }, [staffList]);

  return (
    <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">👷 HỆ THỐNG NHÂN SỰ</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Quản lý nhân viên</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Quản lý danh sách nhân sự, phân ca trực, theo dõi lương và trạng thái hoạt động của nhân viên sân cầu lông.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md hover:shadow-lg self-start md:self-auto"
        >
          <UserPlus size={18} />
          Thêm nhân viên mới
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Tổng nhân sự</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total} thành viên</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active} nhân viên</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Tổng quỹ lương</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPayroll.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-slate-100 pt-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="All">Tất cả vai trò</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Tạm nghỉ">Tạm nghỉ</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Ca làm việc</th>
                <th className="px-6 py-4">Mức lương</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 bg-white">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff._id || staff.id} className="bg-white hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white shadow-sm">
                          {(staff.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{staff.name || 'Chưa đặt tên'}</div>
                          <div className="text-xs text-slate-500">@{staff.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        staff.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        staff.role === 'manager' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {staff.role === 'admin' ? 'Quản trị viên' : staff.role === 'manager' ? 'Quản lý' : (staff.role === 'staff' ? 'Nhân viên' : staff.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Phone size={12} className="text-slate-400" />
                          {staff.phone || 'Chưa cập nhật'}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          {staff.email || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{staff.shift || 'Chưa xếp ca'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {(staff.salary || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition border ${
                          staff.status === 'Hoạt động'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {staff.status === 'Hoạt động' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {staff.status || 'Hoạt động'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(staff)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(staff._id || staff.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStaff ? "✏️ Chỉnh sửa thông tin nhân viên" : "➕ Thêm nhân viên mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên nhân viên"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Tên đăng nhập (Username)</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingStaff}
                    placeholder="Tên viết liền không dấu"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  {editingStaff ? "Mật khẩu mới (Bỏ trống nếu không thay đổi)" : "Mật khẩu đăng nhập *"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingStaff}
                  placeholder={editingStaff ? "Nhập mật khẩu mới nếu muốn thay đổi" : "Tạo mật khẩu cho nhân viên"}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Ví dụ: 0987xxxxxx"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="nhanvien@kontumbadminton.vn"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Vai trò / Chức vụ</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Ca làm việc</label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
                  >
                    {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Mức lương (VNĐ)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    placeholder="Ví dụ: 6000000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm nghỉ">Tạm nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition"
                >
                  {editingStaff ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
