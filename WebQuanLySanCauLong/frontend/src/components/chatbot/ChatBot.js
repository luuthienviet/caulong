import React, { useState, useEffect, useRef } from 'react';

// Hàm loại bỏ dấu tiếng Việt để đối sánh từ khóa linh hoạt hơn
const removeDiacritics = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Xin chào! Tôi là Trợ lý ảo AI của **KONTUM BADMINTON**. Tôi có thể giúp bạn giải đáp mọi thông tin về bảng giá, đặt sân theo tháng, hướng dẫn thanh toán hoặc các nghiệp vụ khác. Bạn cần tôi hỗ trợ gì hôm nay?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    // Thêm tin nhắn của người dùng
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');

    // Hiển thị trạng thái đang nhập
    setIsTyping(true);

    // Giả lập phản hồi AI sau 1.2s
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = generateAIResponse(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  // Trình xử lý nghiệp vụ AI thông minh (Local NLP Engine)
  const generateAIResponse = (rawInput) => {
    const input = removeDiacritics(rawInput.toLowerCase().trim());
    
    // 1. CHÀO HỎI & GIỚI THIỆU
    if (/\b(chao|hello|hi|alo|xin chao|chao bot|helo)\b/.test(input)) {
      return '👋 Xin chào bạn! Rất vui được hỗ trợ bạn. Tôi là Trợ lý ảo của sân cầu lông KONTUM BADMINTON. Bạn có thể hỏi tôi về giá sân, cách đặt lịch, lịch tập cố định theo tháng hoặc bất kỳ câu hỏi nào khác nhé!';
    }

    if (/\b(ban la ai|ten gi|gioi thieu|ai|chatbot|tro ly)\b/.test(input)) {
      return '🤖 Tôi là **Trợ lý ảo AI của KONTUM BADMINTON**, được lập trình để xử lý nhanh các nghiệp vụ đặt sân, tư vấn bảng giá, cung cấp thông tin câu lạc bộ và hướng dẫn khách hàng 24/7. Bạn cứ đặt câu hỏi, tôi sẽ trả lời ngay!';
    }

    // 2. BẢNG GIÁ SÂN
    if (/\b(gia|gia ca|bao nhieu|tien san|phi|bang gia|gia thue|gia gio|bao nhieu tien|sieu vip)\b/.test(input)) {
      return `🏸 **BẢNG GIÁ THUÊ SÂN KONTUM BADMINTON (Cập nhật mới nhất):**\n\n` +
             `* **Sân Số 01 & 04 (Sân VIP - Yonex cao cấp):** **200.000 đ/giờ**\n` +
             `  *(Thảm Yonex đạt chuẩn thi đấu quốc tế BWF, không gian rộng rãi, ánh sáng chống chói cao cấp)*\n\n` +
             `* **Sân Số 02 (Sân Tiêu chuẩn):** **120.000 đ/giờ**\n` +
             `  *(Thảm PVC chất lượng cao, độ đàn hồi cực tốt, phù hợp mọi cấp độ)*\n\n` +
             `* **Sân Số 03 & 05 (Sân Thường/Tiết kiệm):** **100.000 đ/giờ**\n` +
             `  *(Thảm thường sạch sẽ, thoáng mát, thích hợp tập luyện hằng ngày)*\n\n` +
             `💡 *Mẹo:* Bạn nên đặt lịch sớm vào các khung giờ vàng (17h - 21h) vì các khung giờ này rất nhanh hết sân!`;
    }

    // 3. ĐỊA CHỈ & LIÊN HỆ & BẢN ĐỒ
    if (/\b(dia chi|o dau|duong nao|vi tri|ban do|chi duong|tim duong|cho nao|sdt|hotline|lien he|email|gmail)\b/.test(input)) {
      return `📍 **Thông tin Vị trí & Liên hệ KONTUM BADMINTON:**\n\n` +
             `* 🏢 **Địa chỉ:** 704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam.\n` +
             `* 📞 **Hotline hỗ trợ:** **0339 310 915** (Liên hệ trực tiếp để xử lý khẩn cấp hoặc hợp tác).\n` +
             `* ✉️ **Email:** kontumbadminton@gmail.com\n` +
             `* 🕒 **Giờ mở cửa:** **05:00 - 22:00** (Tất cả các ngày trong tuần, kể cả ngày Lễ/Tết).\n\n` +
             `🗺️ Bạn cũng có thể chọn mục **BẢN ĐỒ** trên thanh menu của trang web để xem trực tiếp chỉ đường qua Google Maps nhé!`;
    }

    // 4. NGHIỆP VỤ ĐẶT SÂN
    if (/\b(dat lich|dat san|huong dan dat|cach dat|book san|muon dat|co san|con trong|trong lich)\b/.test(input)) {
      return `📅 **HƯỚNG DẪN ĐẶT SÂN NHANH CHÓNG:**\n\n` +
             `1. Nhấp vào mục **LỊCH ĐẶT SÂN** trên thanh điều hướng để xem trực quan các khung giờ trống của từng sân.\n` +
             `2. Quay lại **TRANG CHỦ**, rê chuột đến sân bạn thích và bấm nút **"Đặt lịch"**.\n` +
             `3. Điền thông tin đặt sân (Họ tên, SĐT, Ngày chơi, Giờ bắt đầu & Thời lượng chơi).\n` +
             `4. Tiến hành quét mã chuyển khoản thanh toán trực tuyến bảo mật.\n` +
             `5. Sau khi thanh toán, đơn đặt sân của bạn sẽ tự động được gửi tới ban quản lý để duyệt trong vòng 5-10 phút!`;
    }

    // 5. NGHIỆP VỤ ĐẶT THEO THÁNG (GÓI THÁNG / CỐ ĐỊNH)
    if (/\b(theo thang|goi thang|dang ky thang|san co dinh|tap co dinh|thang|choi co dinh)\b/.test(input)) {
      return `📅 **NGHIỆP VỤ ĐẶT SÂN CỐ ĐỊNH THEO THÁNG (Gói Thành Viên):**\n\n` +
             `Để hỗ trợ các hội nhóm tập luyện lâu dài và tiết kiệm chi phí, KONTUM BADMINTON cung cấp gói đặt sân cố định theo tháng:\n\n` +
             `* **Quyền lợi:**\n` +
             `  - Giữ cố định khung giờ đẹp cho đội của bạn (không sợ bị tranh sân).\n` +
             `  - Chiết khấu giảm ngay **10% - 15%** trên tổng hóa đơn tháng.\n` +
             `  - Được ưu tiên hỗ trợ đổi lịch nếu thông báo trước 24 giờ.\n` +
             `* **Cách đăng ký:**\n` +
             `  - Vui lòng vào trang **LIÊN HỆ**, chọn chủ đề "Đặt sân & Hợp tác", điền thông tin và gửi lời nhắn cho chúng tôi.\n` +
             `  - Hoặc gọi trực tiếp đến Hotline **0339 310 915** để nhân viên tư vấn chọn khung giờ trống và chốt lịch ngay lập tức!`;
    }

    // 6. PHƯƠNG THỨC THANH TOÁN
    if (/\b(thanh toan|chuyen khoan|momo|tien mat|banking|banking|qr code|quet ma|ngan hang|pay)\b/.test(input)) {
      return `💳 **CÁC PHƯƠNG THỨC THANH TOÁN ĐƯỢC CHẤP NHẬN:**\n\n` +
             `Hệ thống hỗ trợ 3 phương thức thanh toán an toàn:\n` +
             `1. **Quét mã QR Chuyển khoản (Khuyên dùng):** Hệ thống tự động tạo mã QR chứa số tiền và nội dung chuyển khoản chính xác khi bạn đặt sân trực tuyến. Duyệt sân tự động cực nhanh.\n` +
             `2. **Ví điện tử Momo:** Quét mã QR thanh toán nhanh qua ví Momo.\n` +
             `3. **Thanh toán tiền mặt:** Thanh toán trực tiếp cho nhân viên trực sân khi bạn đến chơi.\n\n` +
             `⚠️ *Lưu ý:* Đối với khung giờ vàng (17h - 21h), chúng tôi khuyến khích thanh toán trước trực tuyến để đảm bảo sân của bạn được giữ chắc chắn 100%.`;
    }

    // 7. HỦY ĐẶT LỊCH / HOÀN TIỀN / ĐỔI GIỜ
    if (/\b(huy|huy lich|huy san|hoan tien|doi lich|doi gio|ban viec|khong choi nua|doi san)\b/.test(input)) {
      return `🔄 **CHÍNH SÁCH HỦY SÂN & ĐỔI LỊCH:**\n\n` +
             `Chúng tôi luôn hỗ trợ linh hoạt tối đa cho khách hàng:\n\n` +
             `* **Đổi giờ chơi:** Bạn được đổi giờ chơi miễn phí nếu thông báo cho câu lạc bộ trước ít nhất **12 tiếng** so với giờ đặt ban đầu (áp dụng khi còn sân trống).\n` +
             `* **Hủy sân & Hoàn tiền:**\n` +
             `  - Hủy trước **24 tiếng:** Hoàn tiền **100%** hoặc quy đổi thành voucher cho lần đặt sau.\n` +
             `  - Hủy trước **12 tiếng:** Hoàn tiền **50%**.\n` +
             `  - Hủy dưới **12 tiếng:** Không hỗ trợ hoàn tiền do sân đã được giữ riêng cho bạn và từ chối các khách hàng khác.\n\n` +
             `📞 Để hủy hoặc đổi lịch gấp, vui lòng gọi ngay Hotline **0339 310 915** đọc mã hóa đơn/số điện thoại đặt sân để nhân viên xử lý ngay lập tức!`;
    }

    // 8. KIẾN THỨC CẦU LÔNG & LUẬT CHƠI
    if (/\b(luat choi|luat cau long|tinh diem|giao cau|phat cau|luat giao cau|kich thuoc san|don|doi|luat)\b/.test(input)) {
      return `🏸 **LUẬT CHƠI CẦU LÔNG CƠ BẢN (Chuẩn BWF):**\n\n` +
             `* **Cách tính điểm:** Mỗi trận đấu gồm 3 séc (chạm 21 điểm). Đội nào ghi điểm trước khi cầu chạm đất hoặc đối thủ phạm lỗi sẽ được cộng 1 điểm.\n` +
             `* **Luật Giao cầu:**\n` +
             `  - Điểm chẵn (0, 2, 4...): Giao cầu từ ô bên phải chéo sang ô bên phải đối phương.\n` +
             `  - Điểm lẻ (1, 3, 5...): Giao cầu từ ô bên trái chéo sang ô bên trái đối phương.\n` +
             `  - Vợt phải tiếp xúc cầu dưới thắt lưng (chiều cao tối đa 1.15m so với mặt đất) khi thực hiện cú giao.\n` +
             `* **Kích thước sân đấu chuẩn:** Rộng 6.1m (đánh đôi), Rộng 5.18m (đánh đơn), Dài 13.4m, Chiều cao lưới ở giữa là 1.524m.`;
    }

    // 9. TRANG PHỤC & DỤNG CỤ (GIÀY, VỢT, NƯỚC UỐNG)
    if (/\b(giay|vot|cho thue vot|cho thue giay|cho thue|nuoc uong|trang phuc|quan ao|mang giay|cang vot)\b/.test(input)) {
      return `👟 **DỊCH VỤ DỤNG CỤ & NƯỚC UỐNG TẠI CÂU LẠC BỘ:**\n\n` +
             `Bạn không cần lo lắng nếu thiếu dụng cụ, câu lạc bộ có đầy đủ dịch vụ hỗ trợ:\n\n` +
             `* **Thuê vợt cầu lông:** **20.000 đ/cây** (Các dòng vợt chất lượng, dễ chơi, đã căng sẵn cước).\n` +
             `* **Thuê giày cầu lông chuyên dụng:** **20.000 đ/đôi** (Đầy đủ size từ 36 - 45).\n` +
             `  *⚠️ Yêu cầu bắt buộc:* Khách hàng chơi trên thảm cao cấp Yonex phải mang giày chuyên dụng đế gum (non-marking) hoặc giày sạch, không mang giày đinh, giày tây, cao gót tránh làm hỏng thảm.\n` +
             `* **Dịch vụ căng vợt:** Có máy căng vợt điện tử chuyên nghiệp tại quầy lễ tân.\n` +
             `* **Nước uống & Cầu:** Có bán sẵn nước suối, Revive, bò húc và các ống cầu Hải Yến, Thành Công với giá đại lý tốt nhất!`;
    }

    // 10. ĐẤU GIAO LƯU / TỔ CHỨC GIẢI ĐẤU
    if (/\b(giao luu|giai dau|to chuc giai|giai|giao luu cau lac bo|clb|choi chung|ghep doi)\b/.test(input)) {
      return `🏆 **TỔ CHỨC GIẢI ĐẤU & GIAO LƯU KẾT NỐI:**\n\n` +
             `* **Tổ chức giải đấu:** KONTUM BADMINTON hỗ trợ cho thuê trọn gói cụm 5 sân để tổ chức các giải đấu cơ quan, doanh nghiệp, giải phong trào với mức giá chiết khấu đặc biệt cực tốt. Hỗ trợ băng rôn, bục trao giải và trọng tài điều hành.\n` +
             `* **Giao lưu kết nối:** Bạn đi một mình hoặc nhóm ít người muốn ghép giao lưu? Hãy đến trực tiếp câu lạc bộ vào các buổi tối thứ 3, 5, 7 hoặc nhắn lễ tân, chúng tôi sẽ hỗ trợ kết nối bạn vào các hội nhóm phong trào thân thiện, vui vẻ tại sân!`;
    }

    // 11. LỜI CẢM ƠN
    if (/\b(cam on|thank|thanks|great|tot qua|tuyet voi|cam on bot)\b/.test(input)) {
      return '💖 Rất sẵn lòng! Rất vui vì đã giúp ích được cho bạn. Chúc bạn có những giờ phút chơi cầu lông thật vui vẻ, tràn đầy sức khỏe và nhiều cú đập cầu uy lực tại **KONTUM BADMINTON** nhé! 🏸';
    }

    // 12. TẠM BIỆT
    if (/\b(tam biet|tampiet|bye|hen gap lai|g9|ngu ngon)\b/.test(input)) {
      return '👋 Tạm biệt bạn! Hẹn sớm gặp lại bạn tại sân cầu lông. Nếu cần hỗ trợ thêm bất cứ điều gì, bạn cứ nhắn tôi ở đây nhé. Chúc bạn một ngày tuyệt vời!';
    }

    // 13. CHƯA RÕ Ý ĐỊNH - PHẢN HỒI THÔNG MINH
    return `🤔 Tôi chưa hiểu hoàn toàn câu hỏi của bạn. \n\n` +
           `Tuy nhiên, là Trợ lý AI chuyên nghiệp của **KONTUM BADMINTON**, tôi gợi ý bạn có thể hỏi tôi các nội dung sau:\n` +
           `* 💰 **"Bảng giá thuê sân?"** - Chi tiết giá sân VIP, sân chuẩn, sân thường.\n` +
           `* 📅 **"Đặt sân theo tháng?"** - Cách đăng ký lịch tập cố định và chiết khấu giảm giá.\n` +
           `* 💳 **"Hướng dẫn thanh toán?"** - Chuyển khoản QR, ví Momo hoặc tiền mặt.\n` +
           `* 📍 **"Địa chỉ ở đâu?"** - Xem địa chỉ, hotline hỗ trợ, giờ mở cửa.\n` +
           `* 🔄 **"Chính sách hủy sân?"** - Quy trình hủy sân, hoàn tiền và đổi lịch chơi.\n\n` +
           `📞 Hoặc bạn có thể gọi trực tiếp Hotline chăm sóc khách hàng: **0339 310 915** để gặp trực tiếp tổng đài viên nhé!`;
  };

  return (
    <>
      {/* Nút bong bóng chat nổi ở góc phải dưới */}
      <button 
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý ảo KONTUM AI"
      >
        <div className="trigger-pulse"></div>
        <img src="/ai_avatar.png" alt="bot avatar" className="trigger-avatar-img" />
      </button>

      {/* Cửa sổ Chatbot chính */}
      {isOpen && (
        <div className="chatbot-window">
          
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar-container">
                <img src="/ai_avatar.png" alt="bot avatar" className="bot-header-img" />
                <span className="online-indicator"></span>
              </div>
              <div>
                <h4>Trợ Lý Ảo KONTUM AI</h4>
                <p>⚡ Hỗ trợ nghiệp vụ & Giải đáp 24/7</p>
              </div>
            </div>
            <button className="btn-close-chat" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <img src="/ai_avatar.png" alt="bot avatar" className="bot-mini-avatar-img" />
                )}
                <div className="message-bubble">
                  <div className="message-text">
                    {msg.text.split('\n').map((line, idx) => {
                      // Xử lý định dạng in đậm đơn giản **text**
                      let formattedLine = line;
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      let match;
                      const elements = [];
                      let lastIndex = 0;

                      while ((match = boldRegex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                          elements.push(line.substring(lastIndex, match.index));
                        }
                        elements.push(<strong key={match.index}>{match[1]}</strong>);
                        lastIndex = boldRegex.lastIndex;
                      }
                      if (lastIndex < line.length) {
                        elements.push(line.substring(lastIndex));
                      }

                      return (
                        <p key={idx} style={{ margin: '0 0 8px 0', lineHeight: '1.5' }}>
                          {elements.length > 0 ? elements : line}
                        </p>
                      );
                    })}
                  </div>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Hiệu ứng gõ chữ AI */}
            {isTyping && (
              <div className="message-row bot">
                <img src="/ai_avatar.png" alt="bot avatar" className="bot-mini-avatar-img" />
                <div className="message-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh (Subnav) */}
          <div className="chatbot-suggestions">
            <button onClick={() => handleSend('Bảng giá thuê sân như thế nào?')}>🏸 Bảng giá sân?</button>
            <button onClick={() => handleSend('Địa chỉ và giờ mở cửa câu lạc bộ?')}>📍 Địa chỉ & Giờ?</button>
            <button onClick={() => handleSend('Đặt lịch sân cố định theo tháng?')}>📅 Đặt theo tháng?</button>
            <button onClick={() => handleSend('Chính sách hủy sân và hoàn tiền?')}>🔄 Hủy lịch & Đổi giờ?</button>
          </div>

          {/* Thanh nhập tin nhắn */}
          <form className="chatbot-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi của bạn tại đây..." 
            />
            <button type="submit" className="btn-send-message" disabled={!inputValue.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Styled Components CSS */}
      <style>{`
        /* Nút kích hoạt */
        .chatbot-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          border: 2px solid #ffffff;
          box-shadow: 0 10px 25px -5px rgba(13, 110, 253, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          outline: none;
          padding: 0;
          overflow: hidden;
        }

        .chatbot-trigger:hover {
          transform: scale(1.08) translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(13, 110, 253, 0.6);
        }

        .chatbot-trigger.active {
          transform: rotate(360deg) scale(0.95);
          background: #1e293b;
          box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.4);
        }

        .trigger-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .trigger-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(13, 110, 253, 0.4);
          animation: triggerPulse 2s infinite;
          z-index: -1;
        }

        @keyframes triggerPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Cửa sổ Chatbot chính */
        .chatbot-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 520px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.15);
          border: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
          font-family: 'Outfit', 'Inter', sans-serif;
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        }

        @keyframes slideUp {
          from { transform: translateY(40px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 32px);
            height: calc(100vh - 120px);
            bottom: 84px;
            right: 16px;
          }
        }

        /* Header */
        .chatbot-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 16px 20px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-avatar-container {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .bot-header-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .online-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background-color: #22c55e;
          border: 2px solid #0f172a;
          border-radius: 50%;
        }

        .header-info h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .header-info p {
          margin: 2px 0 0 0;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .btn-close-chat {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .btn-close-chat:hover {
          color: #ffffff;
        }

        /* Danh sách tin nhắn */
        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 85%;
        }

        .message-row.bot {
          align-self: flex-start;
        }

        .message-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
          max-width: 80%;
        }

        .bot-mini-avatar-img {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          flex-shrink: 0;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          font-size: 13.5px;
          line-height: 1.45;
          position: relative;
        }

        .message-row.bot .message-bubble {
          background-color: #ffffff;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .message-row.user .message-bubble {
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          color: #ffffff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 10px rgba(13, 110, 253, 0.15);
        }

        .message-time {
          display: block;
          font-size: 10px;
          margin-top: 5px;
          text-align: right;
          opacity: 0.6;
        }

        .message-row.bot .message-time {
          color: #64748b;
        }

        .message-row.user .message-time {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Gợi ý câu hỏi nhanh (Suggestions) */
        .chatbot-suggestions {
          padding: 10px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none; /* Firefox */
        }

        .chatbot-suggestions::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .chatbot-suggestions button {
          background-color: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .chatbot-suggestions button:hover {
          background-color: #dbeafe;
          border-color: #93c5fd;
          transform: translateY(-1px);
        }

        /* Input Area */
        .chatbot-input-area {
          padding: 12px 16px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chatbot-input-area input {
          flex: 1;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #334155;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-input-area input:focus {
          border-color: #3b82f6;
        }

        .btn-send-message {
          background: #3b82f6;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }

        .btn-send-message:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .btn-send-message:disabled {
          background-color: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        /* typing indicator */
        .typing-bubble {
          padding: 12px 20px !important;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 14px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background-color: #94a3b8;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </>
  );
}
