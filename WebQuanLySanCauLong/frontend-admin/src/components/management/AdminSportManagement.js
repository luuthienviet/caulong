import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tag, Activity, MapPin } from 'lucide-react';
import API from '../../api';

export default function AdminSportManagement({ courts = [] }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    icon: '🎾'
  });

  const fetchSports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sports');
      setSports(res.data);
      if (res.data.length > 0) setSelectedSport(res.data[0]);
    } catch (err) {
      console.error('Lỗi lấy môn thể thao:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleOpenModal = (sport = null) => {
    if (sport) {
      setEditingSport(sport);
      setFormData({ name: sport.name, code: sport.code, icon: sport.icon });
    } else {
      setEditingSport(null);
      setFormData({ name: '', code: '', icon: '🎾' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSport) {
        const res = await API.put(`/sports/${editingSport._id}`, formData);
        setSports(prev => prev.map(s => s._id === editingSport._id ? res.data : s));
      } else {
        const res = await API.post('/sports', formData);
        setSports(prev => [...prev, res.data].sort((a,b) => a.name.localeCompare(b.name)));
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa môn thể thao này?")) return;
    try {
      await API.delete(`/sports/${id}`);
      setSports(prev => prev.filter(s => s._id !== id));
      if (selectedSport?._id === id) setSelectedSport(null);
    } catch (err) {
      alert('Lỗi xóa');
    }
  };

  // Branch names mapping
  const branchNames = {
    kt: 'LTV Kon Tum',
    hn: 'LTV Hà Nội',
    hcm: 'LTV TP.HCM',
    dn: 'LTV Đà Nẵng',
    ct: 'LTV Cần Thơ',
    hp: 'LTV Hải Phòng',
    qn: 'LTV Quảng Ninh',
    nt: 'LTV Nha Trang',
    dl: 'LTV Đà Lạt',
    vt: 'LTV Vũng Tàu',
    bd: 'LTV Bình Dương',
    dni: 'LTV Đồng Nai',
    bn: 'LTV Bắc Ninh',
    th: 'LTV Thanh Hóa',
    na: 'LTV Nghệ An',
    hue: 'LTV Huế',
    pq: 'LTV Phú Quốc'
  };

  // Calculate stats for selected sport
  const stats = useMemo(() => {
    if (!selectedSport) return null;
    
    const sportCourts = courts.filter(c => c.sport === selectedSport.code || (selectedSport.code === 'badminton' && !c.sport));
    const total = sportCourts.length;
    
    const branchCounts = {};
    sportCourts.forEach(c => {
      const b = c.branch || 'kt';
      branchCounts[b] = (branchCounts[b] || 0) + 1;
    });

    return { total, branchCounts };
  }, [selectedSport, courts]);

  const renderIcon = (iconStr, sizeClass = "text-2xl") => {
    if (!iconStr) return <span className={sizeClass}>🎾</span>;
    if (iconStr.startsWith('http://') || iconStr.startsWith('https://') || iconStr.startsWith('/') || iconStr.startsWith('data:image')) {
      return <img src={iconStr} alt="icon" className="w-full h-full object-contain p-1 rounded-xl" />;
    }
    return <span className={sizeClass}>{iconStr}</span>;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for icon
        alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, icon: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="mt-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">🏆 HỆ THỐNG MÔN THỂ THAO</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Quản lý môn thể thao</h2>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm môn mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: List of sports */}
        <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 flex flex-col gap-2 max-h-[600px] overflow-y-auto shadow-sm">
          {loading ? (
            <p className="text-center text-slate-500 py-10">Đang tải...</p>
          ) : sports.length === 0 ? (
            <p className="text-center text-slate-500 py-10">Chưa có môn thể thao nào.</p>
          ) : (
            sports.map(sport => (
              <div 
                key={sport._id}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition border ${
                  selectedSport?._id === sport._id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="bg-white w-10 h-10 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                    {renderIcon(sport.icon, "text-2xl")}
                  </span>
                  <div>
                    <h3 className={`font-bold ${selectedSport?._id === sport._id ? 'text-blue-700' : 'text-slate-700'}`}>
                      {sport.name}
                    </h3>
                    <p className="text-xs text-slate-400">Mã: {sport.code}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleOpenModal(sport)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(sport._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column: Stats */}
        <div className="md:col-span-2">
          {selectedSport && stats ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md overflow-hidden">
                    {renderIcon(selectedSport.icon, "text-4xl")}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedSport.name}</h3>
                    <p className="text-blue-100 font-medium">Thống kê cơ sở vật chất trên toàn quốc</p>
                  </div>
                </div>
                
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest">Tổng số sân cả nước</p>
                    <p className="text-5xl font-extrabold mt-1">{stats.total} <span className="text-lg font-medium text-blue-200">sân</span></p>
                  </div>
                  <Activity size={48} className="text-white/30" />
                </div>
              </div>

              <div className="p-8">
                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <MapPin className="text-blue-600" />
                  Phân bổ theo chi nhánh
                </h4>
                
                {Object.keys(stats.branchCounts).length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500">Chưa có sân nào thuộc môn này.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(stats.branchCounts)
                      .sort((a,b) => b[1] - a[1])
                      .map(([branch, count]) => (
                      <div key={branch} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {branch.toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">{branchNames[branch] || branch}</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{count} sân</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center h-full min-h-[400px]">
              <p className="text-slate-500">Chọn một môn thể thao để xem thống kê</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingSport ? 'Sửa môn thể thao' : 'Thêm môn thể thao'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên môn thể thao</label>
                <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl px-4 py-2" placeholder="Ví dụ: Cầu lông" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mã (không dấu)</label>
                <input required type="text" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} className="w-full border rounded-xl px-4 py-2" placeholder="Ví dụ: badminton" disabled={!!editingSport} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Biểu tượng (Emoji, URL, hoặc Tải ảnh lên)</label>
                <div className="flex flex-col gap-2">
                  <input type="text" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full border rounded-xl px-4 py-2" placeholder="🎾 hoặc https://..." />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Hoặc tải ảnh từ máy (PNG/JPG &lt; 1MB):</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border bg-slate-50 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
