import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, Layers, ShoppingBag, AlertTriangle, ChevronRight } from 'lucide-react';
import API from '../../api';

export default function AdminServiceManagement({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Nước uống',
    price: '',
    stock: '',
    desc: '',
    image: ''
  });

  const categories = ["Nước uống", "Đồ ăn", "Thuê dụng cụ", "Phụ kiện"];

  // Fetch from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/services');
      const raw = res.data.data ?? res.data ?? [];
      const formatted = raw.map(s => ({
        id: s._id || s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        stock: s.stock,
        desc: s.desc || '',
        image: s.image || ''
      }));
      setServices(formatted);
    } catch (err) {
      console.error('Lỗi lấy dịch vụ từ API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Open modal
  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        price: service.price,
        stock: service.stock,
        desc: service.desc,
        image: service.image
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: 'Nước uống',
        price: '',
        stock: '',
        desc: '',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' // Placeholder
      });
    }
    setShowModal(true);
  };

  // Change input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'stock') ? Number(value) || '' : value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const res = await API.put(`/services/${editingService.id}`, formData);
        const updated = res.data.data;
        setServices(prev => prev.map(item => item.id === editingService.id ? {
          ...item,
          id: updated._id || updated.id,
          name: updated.name,
          category: updated.category,
          price: updated.price,
          stock: updated.stock,
          desc: updated.desc || '',
          image: updated.image || ''
        } : item));
        alert('Cập nhật thành công!');
      } else {
        const res = await API.post('/services', formData);
        const created = res.data.data;
        setServices(prev => [...prev, {
          id: created._id || created.id,
          name: created.name,
          category: created.category,
          price: created.price,
          stock: created.stock,
          desc: created.desc || '',
          image: created.image || ''
        }]);
        alert('Thêm dịch vụ thành công!');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Lỗi lưu dịch vụ:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu!');
    }
  };

  // Delete Service
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await API.delete(`/services/${id}`);
        setServices(prev => prev.filter(item => item.id !== id));
        alert('Xóa thành công!');
      } catch (err) {
        console.error('Lỗi xóa dịch vụ:', err);
        alert('Xóa thất bại!');
      }
    }
  };

  // Quick stock change
  const adjustStock = async (id, amount) => {
    const service = services.find(item => item.id === id);
    if (!service) return;
    const nextStock = Math.max(0, service.stock + amount);
    try {
      const res = await API.put(`/services/${id}`, { stock: nextStock });
      const updated = res.data.data;
      setServices(prev => prev.map(item => item.id === id ? {
        ...item,
        stock: updated.stock
      } : item));
    } catch (err) {
      console.error('Lỗi lưu tồn kho:', err);
    }
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      let matchesStock = true;
      if (stockFilter === 'outOfStock') matchesStock = item.stock === 0;
      else if (stockFilter === 'lowStock') matchesStock = item.stock > 0 && item.stock <= 10;
      else if (stockFilter === 'inStock') matchesStock = item.stock > 10;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [services, searchQuery, selectedCategory, stockFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = services.length;
    const categoriesCount = new Set(services.map(s => s.category)).size;
    const outOfStock = services.filter(s => s.stock === 0).length;
    const lowStock = services.filter(s => s.stock > 0 && s.stock <= 10).length;
    return { total, categoriesCount, outOfStock, lowStock };
  }, [services]);

  if (loading) {
    return (
      <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-12 shadow-sm text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 text-sm font-semibold">Đang tải danh sách dịch vụ...</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">🛒 CỬA HÀNG TIỆN ÍCH</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Quản lý dịch vụ đi kèm</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Quản lý sản phẩm căng tin, đồ uống, phụ kiện cầu lông và dịch vụ thuê vợt/giày ngay tại quầy.</p>
        </div>
        {user?.role !== 'staff' && (
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md hover:shadow-lg self-start md:self-auto"
          >
            <Plus size={18} />
            Thêm dịch vụ mới
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Tổng sản phẩm</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total} dịch vụ</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Danh mục</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.categoriesCount} nhóm hàng</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Đã hết hàng</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.outOfStock} sản phẩm</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Sắp hết hàng</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.lowStock} dịch vụ</p>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-slate-100 pt-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên dịch vụ, mô tả..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${selectedCategory === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${selectedCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          >
            <option value="All">Tất cả kho hàng</option>
            <option value="inStock">Còn hàng dồi dào (&gt;10)</option>
            <option value="lowStock">Sắp hết hàng (1-10)</option>
            <option value="outOfStock">Hết hàng (0)</option>
          </select>
        </div>
      </div>

      {/* Grid view of services */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500">
            Không tìm thấy dịch vụ/sản phẩm nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="group relative flex flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm hover:shadow-md transition duration-300">
              {/* Image & Category Tag */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
                  }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-2xs font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">
                  {service.category}
                </span>

                {service.stock === 0 ? (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-2xs">
                    <span className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
                      🚫 HẾT HÀNG
                    </span>
                  </div>
                ) : service.stock <= 10 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-2xs font-extrabold uppercase tracking-widest text-white shadow-sm animate-pulse">
                    ⚠️ SẮP HẾT CA: {service.stock}
                  </span>
                ) : null}
              </div>

              {/* Service details */}
              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
                  {service.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 h-8">
                  {service.desc}
                </p>

                {/* Stock Controls & Price */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-2xs font-semibold uppercase text-slate-400">Đơn giá</p>
                    <p className="text-lg font-extrabold text-blue-600">
                      {service.price.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-2xs font-semibold uppercase text-slate-400">Tồn kho</span>
                    <div className="mt-1 flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                      <button
                        onClick={() => adjustStock(service.id, -1)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:bg-white hover:text-rose-600 flex items-center justify-center font-bold transition shadow-2xs hover:shadow-sm"
                      >
                        -
                      </button>
                      <span className="mx-2.5 text-xs font-bold text-slate-800 w-6 text-center">
                        {service.stock}
                      </span>
                      <button
                        onClick={() => adjustStock(service.id, 1)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:bg-white hover:text-emerald-600 flex items-center justify-center font-bold transition shadow-2xs hover:shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                {user?.role !== 'staff' && (
                  <div className="mt-5 flex gap-2 border-t border-slate-100/80 pt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(service)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                    >
                      <Edit2 size={13} />
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id)}
                      className="flex items-center justify-center rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? "✏️ Chỉnh sửa thông tin dịch vụ" : "➕ Thêm dịch vụ tiện ích mới"}
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
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Tên sản phẩm / Dịch vụ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ví dụ: Revive Chanh Muối 500ml"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Nhóm danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Đơn giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="Ví dụ: 15000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Số lượng tồn kho ban đầu</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="Ví dụ: 100"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Đường dẫn ảnh sản phẩm (URL)</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Nhập link ảnh (https://...)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Mô tả chi tiết</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Mô tả công dụng, tính chất sản phẩm..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                ></textarea>
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
                  {editingService ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
