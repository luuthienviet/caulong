import React, { useState } from 'react';

export default function CourtEditModal({ court, onSave, onClose }) {
  const [name, setName] = useState(court?.name || '');
  const [price, setPrice] = useState(court?.price || 0);
  const [desc, setDesc] = useState(court?.desc || '');
  const [image, setImage] = useState(court?.image || '');
  const [status, setStatus] = useState(court?.status || 'Trống');
  const [imagePreview, setImagePreview] = useState(court?.image || '');

  const handleImageChange = (e) => {
    const url = e.target.value;
    setImage(url);
    setImagePreview(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Vui lòng nhập tên và giá sân');
      return;
    }
    if (price <= 0) {
      alert('Giá sân phải lớn hơn 0');
      return;
    }
    onSave({ ...court, name, price: Number(price), desc, image, status });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: '550px', maxWidth: '90%' }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
          {court ? '✏️ Sửa sân' : '➕ Thêm sân mới'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Tên sân <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: SÂN SỐ 05 - VIP"
              required
            />
          </div>

          <div className="form-row">
            <label>Giá / giờ (VNĐ) <span style={{ color: 'red' }}>*</span></label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="VD: 250000"
              min="0"
              step="10000"
              required
            />
          </div>

          <div className="form-row">
            <label>Mô tả</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows="3"
              placeholder="Mô tả ngắn về sân (ví dụ: sân thoáng mát, ánh sáng tốt, thảm cao cấp...)"
            />
          </div>

          <div className="form-row">
            <label>URL hình ảnh</label>
            <input
              type="text"
              value={image}
              onChange={handleImageChange}
              placeholder="https://example.com/court.jpg"
            />
            {imagePreview && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Xem trước"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '140px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    objectFit: 'cover'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <label>Trạng thái</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Trống</option>
              <option>Đang sử dụng</option>
              <option>Đang bảo trì</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn-cancel-modal">
              Hủy
            </button>
            <button type="submit" className="btn-save-modal">
              Lưu
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-row {
          margin-bottom: 18px;
        }
        .form-row label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #333;
          font-size: 14px;
        }
        .form-row input,
        .form-row textarea,
        .form-row select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          transition: 0.2s;
        }
        .form-row input:focus,
        .form-row textarea:focus,
        .form-row select:focus {
          border-color: #00a651;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0,166,81,0.2);
        }
        .btn-cancel-modal {
          background: #6c757d;
          color: white;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: 0.2s;
        }
        .btn-save-modal {
          background: #00a651;
          color: white;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: 0.2s;
        }
        .btn-cancel-modal:hover {
          background: #5a6268;
        }
        .btn-save-modal:hover {
          background: #008f45;
        }
      `}</style>
    </div>
  );
}