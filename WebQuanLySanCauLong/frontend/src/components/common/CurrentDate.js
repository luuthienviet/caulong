import React, { useState, useEffect } from 'react';

export default function CurrentDate() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // cập nhật mỗi phút (có thể để 1000 nếu muốn giây)
    return () => clearInterval(timer);
  }, []);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('vi-VN', options);
  const timeString = currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="current-date">
      <span className="date-icon">📅</span>
      <span className="date-text">{formattedDate}</span>
      <span className="time-text">⏰ {timeString}</span>
    </div>
  );
}