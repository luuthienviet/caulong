import React, { useState, useEffect } from 'react';
import API from '../api';

export default function RatingModal({ court, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(court.avgRating || 0);
  const [reviewCount, setReviewCount] = useState(court.reviewCount || 0);

  useEffect(() => {
    fetchReviews();
  }, [court._id]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${court._id}`);
      setReviews(res.data.data);
    } catch (err) { console.error(err); }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  // Lấy courtId an toàn
  const courtId = court._id || court.id;
  if (!courtId) {
    alert('Không xác định được sân');
    return;
  }
  try {
    await API.post('/reviews', { courtId, rating, comment });
    // ... phần còn lại (fetch lại reviews, cập nhật avgRating...)
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi gửi đánh giá');
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>Đánh giá sân: {court.name}</h3>
        <div>⭐ {avgRating.toFixed(1)} ({reviewCount} đánh giá)</div>
        <form onSubmit={handleSubmit}>
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            {[5,4,3,2,1].map(r => <option key={r}>{r} sao</option>)}
          </select>
          <textarea placeholder="Nhận xét của bạn..." value={comment} onChange={e => setComment(e.target.value)} required rows="3" style={{ width: '100%', margin: '10px 0' }} />
          <button type="submit" className="btn-auth-submit">Gửi đánh giá</button>
        </form>
        <hr />
        <h4>Các đánh giá</h4>
        {reviews.map(r => (
          <div key={r._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <b>{r.userId.username}</b> ({r.rating}⭐) <br />
            <p>{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}
        <button onClick={onClose} className="btn-cancel">Đóng</button>
      </div>
    </div>
  );
}