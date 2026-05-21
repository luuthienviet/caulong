import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Xin chào! Tôi là Trợ lý ảo AI của **LTV BADMINTON**. Tôi có thể giải đáp mọi câu hỏi — từ đặt sân, bảng giá, đến kiến thức cầu lông, học tập, cuộc sống hay bất cứ điều gì bạn thắc mắc. Hỏi tôi đi nào! 🏸',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      // Gửi tin nhắn kèm lịch sử hội thoại để AI hiểu ngữ cảnh
      const historyForAPI = updatedMessages.slice(-12).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await API.post('/chatbot', {
        message: text,
        history: historyForAPI.slice(0, -1) // Không gửi tin nhắn hiện tại trong history
      });

      setIsTyping(false);

      const botReply = res.data?.reply || 'Xin lỗi, tôi không thể xử lý câu hỏi này lúc này. Vui lòng thử lại!';

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: '⚠️ Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ Hotline **0339 310 915** để được hỗ trợ trực tiếp!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: '🔄 Cuộc trò chuyện đã được làm mới! Bạn cần tôi hỗ trợ gì nào? 😊',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Nút bong bóng chat nổi */}
      <button 
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý ảo LTV AI"
      >
        <div className="trigger-pulse"></div>
        <img src="/favicon.png" alt="bot avatar" className="trigger-avatar-img" />
      </button>

      {/* Cửa sổ Chatbot */}
      {isOpen && (
        <div className="chatbot-window">
          
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar-container">
                <img src="/favicon.png" alt="bot avatar" className="bot-header-img" />
                <span className="online-indicator"></span>
              </div>
              <div>
                <h4>Trợ Lý Ảo LTV AI</h4>
                <p>⚡ AI thông minh • Trả lời mọi câu hỏi 24/7</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-clear-chat" onClick={clearChat} title="Làm mới cuộc trò chuyện">🗑️</button>
              <button className="btn-close-chat" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {/* Tin nhắn */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <img src="/favicon.png" alt="bot avatar" className="bot-mini-avatar-img" />
                )}
                <div className="message-bubble">
                  <div className="message-text">
                    {msg.text.split('\n').map((line, idx) => {
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
                        <p key={idx} style={{ margin: '0 0 6px 0', lineHeight: '1.55' }}>
                          {elements.length > 0 ? elements : line}
                        </p>
                      );
                    })}
                  </div>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="message-row bot">
                <img src="/favicon.png" alt="bot avatar" className="bot-mini-avatar-img" />
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

          {/* Gợi ý câu hỏi nhanh */}
          <div className="chatbot-suggestions">
            <button onClick={() => handleSend('Bảng giá thuê sân bao nhiêu?')}>🏸 Bảng giá?</button>
            <button onClick={() => handleSend('Hướng dẫn đặt sân')}>📅 Đặt sân?</button>
            <button onClick={() => handleSend('Địa chỉ và giờ mở cửa')}>📍 Địa chỉ?</button>
            <button onClick={() => handleSend('Chính sách hủy sân')}>🔄 Hủy/Đổi?</button>
            <button onClick={() => handleSend('Luật chơi cầu lông cơ bản')}>📏 Luật chơi?</button>
            <button onClick={() => handleSend('Cho tôi mẹo chơi cầu lông hay')}>💡 Mẹo hay?</button>
          </div>

          {/* Input */}
          <form className="chatbot-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi bất cứ điều gì..." 
              disabled={isTyping}
            />
            <button type="submit" className="btn-send-message" disabled={!inputValue.trim() || isTyping}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* CSS */}
      <style>{`
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

        .chatbot-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 400px;
          height: 560px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.2);
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

        .chatbot-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 14px 18px;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-clear-chat {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-clear-chat:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
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
          font-size: 10.5px;
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

        .chatbot-messages {
          flex: 1;
          padding: 18px;
          overflow-y: auto;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          max-width: 88%;
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
          width: 28px;
          height: 28px;
          object-fit: cover;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          flex-shrink: 0;
        }

        .message-bubble {
          padding: 11px 15px;
          border-radius: 18px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          font-size: 13px;
          line-height: 1.5;
          position: relative;
          word-break: break-word;
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

        .chatbot-suggestions {
          padding: 8px 10px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 6px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }

        .chatbot-suggestions::-webkit-scrollbar {
          display: none;
        }

        .chatbot-suggestions button {
          background-color: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 11px;
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

        .chatbot-input-area {
          padding: 12px 14px;
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

        .chatbot-input-area input:disabled {
          background: #f1f5f9;
          color: #94a3b8;
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
