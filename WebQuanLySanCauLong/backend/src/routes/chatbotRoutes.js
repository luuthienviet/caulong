import express from 'express';

const router = express.Router();

// System prompt chứa toàn bộ kiến thức về sân cầu lông LTV
const SYSTEM_PROMPT = `Bạn là Trợ lý ảo AI thông minh của **LTV COURT** — hệ thống quản lý và đặt sân chuyên nghiệp (đa dạng các loại sân thể thao).

===== THÔNG TIN CƠ SỞ =====
• Tên: LTV BADMINTON (trước đây là Kontum Badminton)
• Địa chỉ: 704 Phan Đình Phùng, Phường Quang Trung, TP. Kon Tum, Tỉnh Kon Tum, Việt Nam
• Hotline: 0339 310 915
• Email: kontumbadminton@gmail.com
• Giờ mở cửa: 05:00 - 22:00 (Tất cả các ngày trong tuần, kể cả Lễ/Tết)

===== BẢNG GIÁ SÂN =====
• Sân Số 01 & 04 (VIP - Yonex cao cấp): 200.000 đ/giờ — Thảm Yonex chuẩn thi đấu quốc tế BWF, ánh sáng chống chói
• Sân Số 02 (Tiêu chuẩn): 120.000 đ/giờ — Thảm PVC chất lượng cao
• Sân Số 03 & 05 (Thường/Tiết kiệm): 100.000 đ/giờ — Thảm thường, thoáng mát
• Phụ thu 30% cho khung giờ vàng từ 17h trở đi

===== DỊCH VỤ =====
• Thuê vợt: 20.000 đ/cây
• Thuê giày chuyên dụng: 20.000 đ/đôi (size 36-45)
• Căng vợt điện tử chuyên nghiệp tại quầy
• Nước uống, bóng, cầu, và các phụ kiện thể thao bán tại quầy
• Yêu cầu: Sân VIP bắt buộc mang giày đế gum (non-marking)

===== CÁCH ĐẶT SÂN =====
1. Chọn mục "LỊCH ĐẶT SÂN" trên thanh điều hướng để xem khung giờ trống
2. Về "TRANG CHỦ", chọn sân và bấm "Đặt lịch"
3. Điền Họ tên, SĐT, Ngày, Giờ, Thời lượng
4. Thanh toán qua QR chuyển khoản, Momo hoặc tiền mặt
5. Đợi admin duyệt trong 5-10 phút

===== GÓI THÁNG =====
• Giữ cố định khung giờ đẹp
• Chiết khấu 10%-15% tổng hóa đơn tháng
• Đổi lịch miễn phí nếu báo trước 24h
• Đăng ký: Liên hệ Hotline 0339 310 915 hoặc trang LIÊN HỆ trên website

===== CHÍNH SÁCH HỦY/ĐỔI =====
• Hủy trước 24h: Hoàn 100% hoặc voucher
• Hủy trước 12h: Hoàn 50%
• Hủy dưới 12h: Không hoàn tiền
• Đổi giờ miễn phí nếu báo trước 12h (khi còn sân trống)

===== GIẢI ĐẤU & GIAO LƯU =====
• Cho thuê trọn gói 5 sân tổ chức giải đấu với chiết khấu đặc biệt
• Hỗ trợ băng rôn, bục trao giải, trọng tài
• Giao lưu ghép đôi các buổi tối Thứ 3, 5, 7

===== QUY TẮC TRẢ LỜI =====
1. Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp.
2. Sử dụng emoji phù hợp để tạo cảm giác sinh động.
3. Nếu câu hỏi liên quan đến sân, sử dụng kiến thức ở trên.
4. Nếu câu hỏi KHÔNG liên quan đến sân (ví dụ: toán học, lịch sử, khoa học, cuộc sống, v.v.), bạn VẪN trả lời bình thường như một AI thông minh đa năng, không từ chối.
5. Giữ câu trả lời ngắn gọn, súc tích nhưng đầy đủ (tối đa 400 từ).
6. Khi trả lời về giá hoặc thông tin sân, luôn dùng format danh sách rõ ràng.
7. Sử dụng **in đậm** cho thông tin quan trọng.`;

// ===== GROQ API (Llama 3) =====
async function callGroqAPI(message, history) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  // Add history
  for (const msg of history.slice(-10)) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq fetch error:', error.message);
    return null;
  }
}

// ===== GEMINI API =====
async function callGeminiAPI(message, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const contents = [];
  for (const msg of history.slice(-10)) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 1024 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini fetch error:', error.message);
    return null;
  }
}

// ===== LOCAL FALLBACK ENGINE =====
function generateLocalResponse(rawInput) {
  const removeDiacritics = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const input = removeDiacritics(rawInput.toLowerCase().trim());

  if (/\b(chao|hello|hi|alo|xin chao|chao bot|helo)\b/.test(input)) {
    return '👋 Xin chào bạn! Tôi là Trợ lý ảo AI của **LTV BADMINTON**. Tôi có thể giúp bạn giải đáp mọi thông tin về bảng giá, đặt sân, thanh toán hoặc bất kỳ câu hỏi nào khác. Bạn cần hỗ trợ gì hôm nay?';
  }

  if (/\b(ban la ai|ten gi|gioi thieu|chatbot|tro ly)\b/.test(input)) {
    return '🤖 Tôi là **Trợ lý ảo AI của LTV BADMINTON**, được lập trình để xử lý nhanh các nghiệp vụ đặt sân, tư vấn bảng giá, cung cấp thông tin câu lạc bộ và hướng dẫn khách hàng 24/7. Bạn cứ đặt câu hỏi, tôi sẽ trả lời ngay!';
  }

  if (/\b(gia|gia ca|bao nhieu|tien san|phi|bang gia|gia thue|bao nhieu tien)\b/.test(input)) {
    return `🏸 **BẢNG GIÁ THUÊ SÂN LTV BADMINTON:**\n\n` +
           `• **Sân 01 & 04 (VIP - Yonex cao cấp):** 200.000 đ/giờ\n` +
           `• **Sân 02 (Tiêu chuẩn):** 120.000 đ/giờ\n` +
           `• **Sân 03 & 05 (Thường):** 100.000 đ/giờ\n\n` +
           `💡 Phụ thu 30% cho khung giờ vàng (17h trở đi)`;
  }

  if (/\b(dia chi|o dau|vi tri|lien he|sdt|hotline|email|duong nao|ban do)\b/.test(input)) {
    return `📍 **LTV BADMINTON:**\n• 🏢 704 Phan Đình Phùng, TP. Kon Tum\n• 📞 0339 310 915\n• ✉️ kontumbadminton@gmail.com\n• 🕒 05:00 - 22:00 (mọi ngày)\n\n🗺️ Chọn mục **BẢN ĐỒ** trên menu để xem chỉ đường Google Maps!`;
  }

  if (/\b(dat san|dat lich|huong dan dat|cach dat|book san|muon dat|co san|con trong)\b/.test(input)) {
    return `📅 **HƯỚNG DẪN ĐẶT SÂN:**\n1. Chọn **LỊCH ĐẶT SÂN** trên menu để xem giờ trống\n2. Về **TRANG CHỦ**, chọn sân bấm **"Đặt lịch"**\n3. Điền thông tin & chọn giờ\n4. Thanh toán QR/Momo/Tiền mặt\n5. Chờ admin duyệt 5-10 phút`;
  }

  if (/\b(theo thang|goi thang|san co dinh|tap co dinh|choi co dinh)\b/.test(input)) {
    return `📅 **GÓI ĐẶT SÂN THEO THÁNG:**\n• Giữ cố định khung giờ đẹp\n• Chiết khấu **10%-15%** tổng hóa đơn\n• Đổi lịch miễn phí nếu báo trước 24h\n\n📞 Đăng ký: Gọi Hotline **0339 310 915** hoặc vào trang **LIÊN HỆ**`;
  }

  if (/\b(thanh toan|chuyen khoan|momo|qr|tien mat|ngan hang)\b/.test(input)) {
    return `💳 **PHƯƠNG THỨC THANH TOÁN:**\n• 📱 QR Chuyển khoản (khuyên dùng)\n• 💜 Ví Momo\n• 💵 Tiền mặt tại sân\n\n⚠️ Khung giờ vàng (17h-21h) nên thanh toán trước để giữ sân chắc chắn!`;
  }

  if (/\b(huy|huy lich|hoan tien|doi lich|doi gio|doi san)\b/.test(input)) {
    return `🔄 **CHÍNH SÁCH HỦY/ĐỔI:**\n• Trước 24h: Hoàn **100%**\n• Trước 12h: Hoàn **50%**\n• Dưới 12h: Không hoàn\n• Đổi giờ miễn phí nếu báo trước 12h\n\n📞 Gọi ngay **0339 310 915** để xử lý!`;
  }

  if (/\b(luat choi|luat the thao|tinh diem|giao cau|kich thuoc san)\b/.test(input)) {
    return `⚽ **LUẬT THỂ THAO CƠ BẢN:**\n• Tuỳ từng bộ môn có luật và thời gian thi đấu riêng.\n• Vui lòng liên hệ quản lý sân để được tư vấn chi tiết bộ môn bạn quan tâm.`;
  }

  if (/\b(giay|vot|cho thue|nuoc uong|bong|dung cu)\b/.test(input)) {
    return `👟 **DỊCH VỤ TẠI SÂN:**\n• Thuê dụng cụ: **20.000 đ/món**\n• Thuê giày: **20.000 đ/đôi** (size 36-45)\n• Nước uống & phụ kiện thể thao bán tại quầy\n\n⚠️ Sân VIP bắt buộc giày thể thao chuyên dụng!`;
  }

  if (/\b(giao luu|giai dau|to chuc|clb|ghep doi)\b/.test(input)) {
    return `🏆 **GIẢI ĐẤU & GIAO LƯU:**\n• Cho thuê trọn gói 5 sân tổ chức giải\n• Hỗ trợ băng rôn, bục trao giải, trọng tài\n• Giao lưu ghép đôi: Tối Thứ 3, 5, 7\n\n📞 Liên hệ **0339 310 915** để đặt lịch!`;
  }

  if (/\b(cam on|thank|thanks|great|tot qua|tuyet voi)\b/.test(input)) {
    return '💖 Rất vui vì đã giúp được bạn! Chúc bạn có những giờ chơi thể thao thật tuyệt vời tại **LTV COURT**! 🏸';
  }

  if (/\b(tam biet|bye|hen gap lai)\b/.test(input)) {
    return '👋 Tạm biệt bạn! Hẹn sớm gặp lại tại sân. Nếu cần hỗ trợ, bạn cứ nhắn tôi bất cứ lúc nào nhé! 😊';
  }

  // Fallback khi không khớp bất kỳ pattern nào
  return `🤔 Tôi chưa hiểu hoàn toàn câu hỏi của bạn.\n\n` +
         `Là Trợ lý AI của **LTV BADMINTON**, tôi có thể giúp bạn:\n` +
         `• 💰 **"Bảng giá sân?"** — Chi tiết giá từng loại sân\n` +
         `• 📅 **"Cách đặt sân?"** — Hướng dẫn đặt sân nhanh\n` +
         `• 💳 **"Thanh toán?"** — QR, Momo, tiền mặt\n` +
         `• 📍 **"Địa chỉ?"** — Vị trí & liên hệ\n` +
         `• 🔄 **"Hủy/đổi lịch?"** — Chính sách hoàn tiền\n` +
         `• ⚽ **"Luật thể thao?"** — Luật chơi cơ bản\n` +
         `• 👟 **"Dịch vụ?"** — Thuê dụng cụ, giày, nước uống\n\n` +
         `📞 Hoặc gọi Hotline: **0339 310 915**`;
}

// POST /api/chatbot
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi' });
    }

    // Thử Groq trước (nhanh hơn), rồi Gemini, cuối cùng Local
    let reply = null;
    let source = 'local';

    // 1. Thử Groq API
    reply = await callGroqAPI(message, history);
    if (reply) {
      source = 'groq';
    }

    // 2. Nếu Groq fail, thử Gemini
    if (!reply) {
      reply = await callGeminiAPI(message, history);
      if (reply) {
        source = 'gemini';
      }
    }

    // 3. Nếu cả hai đều fail, dùng Local
    if (!reply) {
      reply = generateLocalResponse(message);
      source = 'local';
    }

    return res.json({ success: true, reply, source });

  } catch (error) {
    console.error('Chatbot error:', error);
    return res.json({
      success: true,
      reply: generateLocalResponse(req.body?.message || ''),
      source: 'local'
    });
  }
});

export default router;
