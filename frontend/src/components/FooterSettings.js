import React, { useState, useEffect } from 'react';

export default function FooterSettings({ onClose, onSave }) {
  const [settings, setSettings] = useState({
    address: "704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam",
    hotline: "0339 310 915",
    email: "kontumbadminton@gmail.com",
    hours: "05:00 - 22:00 (Tất cả các ngày trong tuần)"
  });

  useEffect(() => {
    const saved = localStorage.getItem('footerSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    localStorage.setItem('footerSettings', JSON.stringify(settings));
    if (onSave) onSave(settings);
    alert('Cập nhật thông tin footer thành công!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: '500px' }}>
        <h3>✏️ Cài đặt thông tin liên hệ</h3>
        <div className="input-field">
          <label>Địa chỉ</label>
          <textarea name="address" value={settings.address} onChange={handleChange} rows="2" />
        </div>
        <div className="input-field">
          <label>Hotline</label>
          <input type="text" name="hotline" value={settings.hotline} onChange={handleChange} />
        </div>
        <div className="input-field">
          <label>Email</label>
          <input type="email" name="email" value={settings.email} onChange={handleChange} />
        </div>
        <div className="input-field">
          <label>Giờ hoạt động</label>
          <input type="text" name="hours" value={settings.hours} onChange={handleChange} />
        </div>
        <div className="modal-actions">
          <button onClick={handleSubmit} className="btn-save">Lưu</button>
          <button onClick={onClose} className="btn-cancel">Hủy</button>
        </div>
      </div>
    </div>
  );
}