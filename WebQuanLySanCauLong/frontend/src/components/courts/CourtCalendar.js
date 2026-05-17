import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CourtCalendar({ court, bookings, onDateSelect }) {
  const [bookedDates, setBookedDates] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    if (!court || !bookings) return;
    const approvedBookings = bookings.filter(b => b.courtId === court._id && b.status === 'approved');
    const dates = approvedBookings.map(b => b.date);
    setBookedDates(dates);
  }, [court, bookings]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (bookedDates.includes(dateStr)) {
        return 'booked-day';
      }
    }
    return null;
  };

  // Hàm format ngày để tránh lỗi múi giờ
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (newValue) => {
    setValue(newValue);
    if (newValue && onDateSelect) {
      const selected = formatDate(newValue);
      console.log('📅 Ngày được chọn từ lịch:', selected);
      onDateSelect(selected);
    }
  };

  return (
    <div className="court-calendar">
      <h4>📅 Lịch trống - đã đặt</h4>
      <Calendar
        value={value}
        tileClassName={tileClassName}
        minDate={new Date()}
        onChange={handleDateChange}
      />
      <style>{`
        .booked-day {
          background: #ffcccc;
          border-radius: 50%;
          color: #cc0000;
          font-weight: bold;
        }
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: #f9f9f9;
          border-radius: 12px;
          padding: 10px;
        }
        .react-calendar__tile {
          padding: 10px;
        }
      `}</style>
    </div>
  );
}