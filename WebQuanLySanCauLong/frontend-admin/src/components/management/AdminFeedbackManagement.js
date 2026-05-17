import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function AdminFeedbackManagement() {
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'contacts'
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchReviews(), fetchContacts()]);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get('/reviews');
      setReviews(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await API.get('/contacts');
      setContacts(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải tin nhắn liên hệ:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
      alert('Đã xóa đánh giá thành công.');
    } catch (err) {
      console.error('Lỗi xóa đánh giá:', err);
      alert('Có lỗi xảy ra khi xóa đánh giá.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?')) return;
    try {
      await API.delete(`/contacts/${id}`);
      fetchContacts();
      alert('Đã xóa tin nhắn liên hệ thành công.');
    } catch (err) {
      console.error('Lỗi xóa tin nhắn liên hệ:', err);
      alert('Có lỗi xảy ra khi xóa tin nhắn.');
    }
  };

  const handleUpdateContactStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      await API.put(`/contacts/${id}/status`, { status: nextStatus });
      fetchContacts();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <span key={idx} className={`text-lg ${idx < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Tiêu đề & Subnav */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">⭐ Quản lý ý kiến & Phản hồi</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý toàn bộ bình luận đánh giá và tin nhắn góp ý từ khách hàng.</p>
        </div>
        
        {/* Nút Tabs lựa chọn */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-center">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'reviews' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⭐ Đánh giá sân ({reviews.length})
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'contacts' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📨 Tin nhắn liên hệ ({contacts.filter(c => c.status === 'unread').length} mới)
          </button>
        </div>
      </div>

      {/* HIỂN THỊ TAB ĐÁNH GIÁ SÂN */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="text-gray-500 font-medium">Chưa có phản hồi nào từ khách hàng.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {(review.userId?.name || review.userId?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{review.userId?.name || review.userId?.username || 'Khách hàng ẩn danh'}</h4>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-slate-600">Sân: </span>
                      <span className="text-sm font-bold text-indigo-600">{review.courtId?.name || 'Sân không xác định'}</span>
                    </div>

                    <div className="flex gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                      {review.comment || <span className="text-gray-400 italic">Không có nhận xét</span>}
                    </p>
                  </div>

                  <div className="flex items-start justify-end md:w-32">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HIỂN THỊ TAB TIN NHẮN LIÊN HỆ */}
      {activeTab === 'contacts' && (
        <div>
          {contacts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="text-gray-500 font-medium">Chưa có tin nhắn liên hệ nào từ khách hàng.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map(contact => {
                const isUnread = contact.status === 'unread';
                return (
                  <div 
                    key={contact._id} 
                    className={`p-5 border rounded-xl hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 ${
                      isUnread 
                        ? 'border-blue-100 bg-blue-50/30' 
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            isUnread 
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-200' 
                              : 'bg-slate-400'
                          }`}>
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800">{contact.name}</h4>
                              {isUnread && (
                                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>

                        {/* Chủ đề tin nhắn */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          contact.subject === 'Báo lỗi hệ thống' 
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : contact.subject === 'Góp ý dịch vụ'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {contact.subject}
                        </span>
                      </div>

                      {/* Thông tin liên hệ phụ */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3 bg-white/50 p-2 rounded-lg border border-slate-100/50">
                        <div>
                          <span className="font-semibold text-slate-500">📞 SĐT: </span>
                          <a href={`tel:${contact.phone}`} className="font-bold text-blue-600 hover:underline">{contact.phone}</a>
                        </div>
                        {contact.email && (
                          <div>
                            <span className="font-semibold text-slate-500">✉️ Email: </span>
                            <a href={`mailto:${contact.email}`} className="font-medium text-slate-700 hover:underline">{contact.email}</a>
                          </div>
                        )}
                      </div>

                      {/* Lời nhắn */}
                      <div className="bg-white p-4 rounded-xl border border-slate-100">
                        <span className="text-xs font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">Nội dung tin nhắn:</span>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{contact.message}</p>
                      </div>
                    </div>

                    {/* Các hành động xử lý */}
                    <div className="flex md:flex-col justify-end gap-2 md:w-36 self-end md:self-start">
                      <button
                        onClick={() => handleUpdateContactStatus(contact._id, contact.status)}
                        className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors text-center flex-1 md:flex-none ${
                          isUnread 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isUnread ? '👁️ Đọc xong' : '📥 Chưa đọc'}
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs transition-colors text-center flex-1 md:flex-none"
                      >
                        🗑️ Xóa tin
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
