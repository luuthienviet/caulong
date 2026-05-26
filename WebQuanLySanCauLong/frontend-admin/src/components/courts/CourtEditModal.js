import React, { useState, useEffect } from 'react';
import API from '../../api';
import CustomSelect from '../common/CustomSelect';

export default function CourtEditModal({ court, onSave, onClose }) {
  const [name, setName] = useState(court?.name || '');
  const [price, setPrice] = useState(court?.price || '');
  const [desc, setDesc] = useState(court?.desc || '');
  const [image, setImage] = useState(court?.image || '');
  const [imgPreview, setImgPreview] = useState(court?.image || '');
  const [imgError, setImgError] = useState(false);
  const [status, setStatus] = useState(court?.status || 'Trống');
  const [sport, setSport] = useState(court?.sport || 'badminton');
  const [branch, setBranch] = useState(court?.branch || 'kt');

  const [dbSports, setDbSports] = useState([]);
  
  useEffect(() => {
    API.get('/sports')
      .then(res => setDbSports(res.data))
      .catch(err => console.error('Error fetching sports:', err));
  }, []);

  const sportOptions = dbSports.map(s => ({ value: s.code, label: s.name, icon: s.icon }));

  const branchOptions = [
    { value: 'kt', label: '📍 LTV Kon Tum' },
    { value: 'hn', label: '📍 LTV Hà Nội' },
    { value: 'hcm', label: '📍 LTV TP.HCM' },
    { value: 'dn', label: '📍 LTV Đà Nẵng' },
    { value: 'ct', label: '📍 LTV Cần Thơ' },
    { value: 'hp', label: '📍 LTV Hải Phòng' },
    { value: 'qn', label: '📍 LTV Quảng Ninh' },
    { value: 'nt', label: '📍 LTV Nha Trang' },
    { value: 'dl', label: '📍 LTV Đà Lạt' },
    { value: 'vt', label: '📍 LTV Vũng Tàu' },
    { value: 'bd', label: '📍 LTV Bình Dương' },
    { value: 'dni', label: '📍 LTV Đồng Nai' },
    { value: 'bn', label: '📍 LTV Bắc Ninh' },
    { value: 'th', label: '📍 LTV Thanh Hóa' },
    { value: 'na', label: '📍 LTV Nghệ An' },
    { value: 'hue', label: '📍 LTV Huế' },
    { value: 'pq', label: '📍 LTV Phú Quốc' }
  ];

  const handleImageChange = (e) => {
    const url = e.target.value;
    setImage(url);
    setImgPreview(url);
    setImgError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return alert('Vui lòng nhập tên và giá sân');
    if (Number(price) <= 0) return alert('Giá sân phải lớn hơn 0');
    onSave({ ...court, name, price: Number(price), desc, image, status, sport, branch });
  };

  const statusConfig = {
    'Trống': { border: '#534ab7', bg: '#eeedfe', color: '#26215c', icon: '✓' },
    'Đang sử dụng': { border: '#ba7517', bg: '#faeeda', color: '#412402', icon: '▶' },
    'Đang bảo trì': { border: '#993c1d', bg: '#faece7', color: '#4a1b0c', icon: '⚙' },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerOrb1} />
          <div style={styles.headerOrb2} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={styles.headerIcon}>🎾</div>
            <div>
              <p style={styles.headerTitle}>{court ? 'Sửa sân' : 'Thêm sân mới'}</p>
              <p style={styles.headerSub}>Điền đầy đủ thông tin bên dưới</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Body */}
        <div style={styles.body}>

          {/* LEFT: Image */}
          <div style={styles.leftCol}>
            <p style={styles.fieldLabel}>Ảnh sân</p>
            <div
              style={{
                ...styles.imgBox,
                borderStyle: imgPreview && !imgError ? 'solid' : 'dashed',
                borderColor: imgPreview && !imgError ? '#7f77dd' : '#afa9ec',
              }}
            >
              {imgPreview && !imgError ? (
                <img
                  src={imgPreview}
                  alt="Xem trước"
                  style={styles.imgPreview}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div style={styles.imgPlaceholder}>
                  <div style={styles.imgIconWrap}>🖼️</div>
                  <span style={{ fontSize: 12, color: '#7f77dd', fontWeight: 500 }}>Chưa có ảnh</span>
                  <span style={{ fontSize: 10, color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
                    Nhập URL bên dưới để xem trước
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={styles.fieldLabel}>URL hình ảnh</label>
              <input
                type="text"
                value={image}
                onChange={handleImageChange}
                placeholder="https://example.com/court.jpg"
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#7f77dd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>

          {/* RIGHT: Fields */}
          <div style={styles.rightCol}>

            <div>
              <label style={styles.fieldLabel}>Tên sân <span style={{ color: '#e24b4a' }}>*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Sân số 05 – VIP"
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#7f77dd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                required
              />
            </div>

            <div>
              <label style={styles.fieldLabel}>Giá / giờ (VNĐ) <span style={{ color: '#e24b4a' }}>*</span></label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="250000"
                min="0"
                step="10000"
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#7f77dd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Chi nhánh</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} style={styles.input}>
                  {branchOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Môn thể thao</label>
                <CustomSelect
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  options={sportOptions}
                />
              </div>
            </div>

            <div>
              <label style={styles.fieldLabel}>Mô tả</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="Sân thoáng mát, ánh sáng tốt, thảm cao cấp..."
                style={{ ...styles.input, resize: 'none', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = '#7f77dd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div>
              <label style={styles.fieldLabel}>Trạng thái</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatus(key)}
                    style={{
                      flex: 1,
                      padding: '9px 6px',
                      borderRadius: 10,
                      border: `1.5px solid ${status === key ? cfg.border : '#e0e0e0'}`,
                      background: status === key ? cfg.bg : '#f5f5f5',
                      color: status === key ? cfg.color : '#888',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.btnCancel}>Hủy</button>
          <button type="button" onClick={handleSubmit} style={styles.btnSave}>💾 Lưu sân</button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20, boxSizing: 'border-box',
  },
  modal: {
    width: '100%', maxWidth: 700,
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    background: 'linear-gradient(135deg, #26215c 0%, #534ab7 55%, #7f77dd 100%)',
    padding: '24px 26px 20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerOrb1: {
    position: 'absolute', top: -35, right: -20,
    width: 130, height: 130, borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
  },
  headerOrb2: {
    position: 'absolute', bottom: -25, left: 40,
    width: 80, height: 80, borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: -0.3 },
  headerSub: { margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.68)' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1,
  },
  body: {
    display: 'grid', gridTemplateColumns: '210px 1fr',
  },
  leftCol: {
    padding: '22px 20px',
    borderRight: '0.5px solid #e8e8e8',
    display: 'flex', flexDirection: 'column',
  },
  rightCol: {
    padding: '22px 24px',
    display: 'flex', flexDirection: 'column', gap: 13,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 11, fontWeight: 500, color: '#888',
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: 6,
  },
  imgBox: {
    width: '100%', aspectRatio: '4/3',
    borderRadius: 12, border: '1.5px dashed #afa9ec',
    background: '#f8f7ff',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', cursor: 'pointer', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  imgPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8, padding: '0 8px',
  },
  imgIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    background: '#eeedfe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
  },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e0e0e0', borderRadius: 10,
    fontSize: 13.5, background: '#f9f9f9',
    color: '#222', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  footer: {
    padding: '14px 26px 20px',
    borderTop: '0.5px solid #eee',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  btnCancel: {
    padding: '10px 22px', borderRadius: 10,
    border: '1.5px solid #ddd', background: 'transparent',
    color: '#666', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  btnSave: {
    padding: '10px 26px', borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #26215c, #7f77dd)',
    color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
};