import React, { useState } from 'react';
import API from '../api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Đặt sân & Hợp tác',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert("⚠️ Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)");
      return;
    }
    setLoading(true);
    try {
      await API.post('/contacts', formData);
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: 'Đặt sân & Hợp tác', message: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Gửi phản hồi thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page fade-in">
      {/* Banner liên hệ */}
      <section className="contact-hero">
        <div className="hero-overlay-dark"></div>
        <div className="hero-content">
          <h1>LIÊN HỆ VỚI CHÚNG TÔI</h1>
          <p>KONTUM BADMINTON luôn sẵn sàng lắng nghe ý kiến đóng góp và hỗ trợ bạn 24/7</p>
        </div>
      </section>

      {/* Nội dung chính */}
      <div className="contact-container">
        <div className="contact-grid">
          
          {/* Cột 1: Thông tin liên hệ */}
          <div className="contact-info-column">
            <h2 className="column-title">🏢 Thông Tin Liên Hệ</h2>
            <p className="column-subtitle">Hãy ghé thăm hoặc kết nối với chúng tôi qua các kênh sau để được hỗ trợ nhanh nhất.</p>
            
            <div className="info-cards-list">
              <div className="info-card">
                <div className="card-icon">📍</div>
                <div className="card-text">
                  <h3>Địa chỉ câu lạc bộ</h3>
                  <p>704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam</p>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">📞</div>
                <div className="card-text">
                  <h3>Hotline hỗ trợ</h3>
                  <p className="highlight-text">0339 310 915</p>
                  <span className="small-note">(Liên hệ đặt lịch trực tiếp / báo sự cố)</span>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">✉️</div>
                <div className="card-text">
                  <h3>Hộp thư điện tử</h3>
                  <p>kontumbadminton@gmail.com</p>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">🕒</div>
                <div className="card-text">
                  <h3>Giờ hoạt động</h3>
                  <p>05:00 - 22:00</p>
                  <span className="small-note">(Tất cả các ngày trong tuần, kể cả ngày lễ)</span>
                </div>
              </div>
            </div>

            {/* Trang trí thêm */}
            <div className="quote-box">
              <span className="quote-icon">"</span>
              <p>Thể thao nâng tầm cuộc sống. Hãy để KONTUM BADMINTON đồng hành cùng mỗi cú đập cầu đẳng cấp của bạn!</p>
            </div>
          </div>

          {/* Cột 2: Form gửi ý kiến */}
          <div className="contact-form-column">
            <h2 className="column-title">📨 Gửi Ý Kiến Phản Hồi</h2>
            <p className="column-subtitle">Bạn có thắc mắc, đề xuất hợp tác hoặc phản ánh dịch vụ? Hãy gửi tin nhắn cho chúng tôi.</p>

            {submitted ? (
              <div className="form-success-box">
                <div className="success-icon">✅</div>
                <h3>Gửi liên hệ thành công!</h3>
                <p>Cảm ơn bạn đã gửi phản hồi. Chúng tôi đã nhận được thông tin và sẽ phản hồi lại bạn sớm nhất trong vòng 24 giờ tới.</p>
                <button onClick={() => setSubmitted(false)} className="btn-success-reset">
                  Gửi thêm tin nhắn mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modern-contact-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Họ tên của bạn <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Nguyễn Văn A" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại <span className="required">*</span></label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="09xxxxxxxx" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ Email (Không bắt buộc)</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="example@gmail.com" 
                  />
                </div>

                <div className="form-group">
                  <label>Chủ đề liên hệ</label>
                  <select name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="Đặt sân & Hợp tác">Đặt sân & Hợp tác</option>
                    <option value="Góp ý dịch vụ">Góp ý dịch vụ</option>
                    <option value="Báo lỗi hệ thống">Báo lỗi hệ thống</option>
                    <option value="Khác">Vấn đề khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nội dung lời nhắn <span className="required">*</span></label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows="5" 
                    placeholder="Hãy viết câu hỏi hoặc lời nhắn của bạn ở đây..." 
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className="btn-submit-contact">
                  {loading ? '⏳ Đang gửi lời nhắn...' : '🚀 Gửi Lời Nhắn Ngay'}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>

      <style>{`
        .contact-page {
          background-color: #f8fafc;
          font-family: 'Outfit', 'Inter', 'Segoe UI', sans-serif;
          min-height: 100vh;
          padding-bottom: 60px;
        }

        /* Hero Banner */
        .contact-hero {
          position: relative;
          height: 320px;
          background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #ffffff;
        }

        .hero-overlay-dark {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(13, 110, 253, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding: 0 20px;
        }

        .hero-content h1 {
          font-size: clamp(2rem, 3.5vw, 3.2rem);
          font-weight: 900;
          letter-spacing: 0.05em;
          text-shadow: 0 4px 15px rgba(0,0,0,0.4);
          margin-bottom: 12px;
          background: linear-gradient(to right, #ffffff, #fdb913);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-content p {
          font-size: clamp(0.95rem, 1.2vw, 1.25rem);
          max-width: 700px;
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }

        /* Container & Grid Layout */
        .contact-container {
          max-width: 1200px;
          margin: -50px auto 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 5;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        @media (max-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .contact-container {
            margin-top: -30px;
          }
        }

        /* Cột Thông Tin */
        .contact-info-column, .contact-form-column {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .contact-info-column:hover, .contact-form-column:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.1);
        }

        .column-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .column-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        /* Info Cards */
        .info-cards-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          transition: background-color 0.2s ease;
        }

        .info-card:hover {
          background: #f1f5f9;
        }

        .card-icon {
          font-size: 28px;
          background: #eff6ff;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #3b82f6;
          border: 1px solid #dbeafe;
          flex-shrink: 0;
        }

        .card-text h3 {
          font-size: 15px;
          font-weight: 700;
          color: #475569;
          margin: 0 0 6px 0;
        }

        .card-text p {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
        }

        .card-text .highlight-text {
          color: #2563eb;
          font-size: 18px;
          font-weight: 800;
        }

        .card-text .small-note {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Quote Box */
        .quote-box {
          border-left: 4px solid #fdb913;
          padding-left: 20px;
          margin-top: 30px;
          background: #fffdf5;
          padding: 18px 24px;
          border-radius: 0 16px 16px 0;
        }

        .quote-icon {
          font-size: 32px;
          color: #fdb913;
          line-height: 1;
          display: block;
          margin-bottom: -10px;
          font-family: serif;
        }

        .quote-box p {
          font-style: italic;
          color: #78350f;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Modern Form Styles */
        .modern-contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 500px) {
          .form-group-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .form-group .required {
          color: #ef4444;
          font-weight: bold;
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 12px 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .btn-submit-contact {
          width: 100%;
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          padding: 14px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 16px -4px rgba(13, 110, 253, 0.25);
          margin-top: 10px;
        }

        .btn-submit-contact:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -4px rgba(13, 110, 253, 0.35);
        }

        .btn-submit-contact:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success State */
        .form-success-box {
          text-align: center;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 20px;
          animation: scaleUp 0.3s ease-out;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .success-icon {
          font-size: 54px;
          margin-bottom: 16px;
        }

        .form-success-box h3 {
          font-size: 20px;
          font-weight: 800;
          color: #166534;
          margin: 0 0 10px 0;
        }

        .form-success-box p {
          font-size: 14px;
          color: #16a34a;
          margin: 0 0 24px 0;
          line-height: 1.5;
          max-width: 320px;
        }

        .btn-success-reset {
          background: #16a34a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-success-reset:hover {
          background: #15803d;
        }
      `}</style>
    </div>
  );
}
