import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import RevenueAnalytics from './RevenueAnalytics';
import CourtPerformance from './CourtPerformance';
import API from '../api';

export default function AdminDashboardModern({ 
  bookingRequests = [], 
  users = [],
  approveBooking, 
  rejectBooking, 
  deleteBooking, 
  clearOldBookings, 
  courts = [], 
  setCourts,
  refreshBookings,
  user,
  setPage
}) {
  const [revenueFilter, setRevenueFilter] = useState('week');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Utility functions
  const parseBookingDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getBookingEndTime = (booking) => {
    if (!booking || !booking.date || !booking.hour) return new Date();
    const [year, month, day] = booking.date.split('-');
    const y = parseInt(year);
    if (isNaN(y) || y < 2020 || y > 2030) return new Date();
    const start = new Date(y, parseInt(month) - 1, parseInt(day), parseInt(booking.hour), 0, 0);
    return new Date(start.getTime() + (booking.duration || 1) * 60 * 60 * 1000);
  };

  const isBookingCompleted = (booking) => {
    if (booking.status !== 'approved') return false;
    return currentTime > getBookingEndTime(booking).getTime();
  };

  // Get period bounds
  const getPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') return { start: new Date(end), end: new Date(end) };
    if (filter === 'month') return { start: new Date(end.getFullYear(), end.getMonth(), 1), end: new Date(end) };
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { start, end };
  };

  // Calculate metrics
  const currentDate = new Date().toISOString().split('T')[0];
  const bookingsToday = bookingRequests.filter(b => b.date === currentDate);
  const approvedToday = bookingsToday.filter(b => b.status === 'approved');
  const revenueToday = approvedToday.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalBookingsToday = bookingsToday.length;
  const activeCourts = courts.filter(c => c.status === 'Đang sử dụng').length;
  const totalBookingsAll = bookingRequests.length;

  // Revenue calculations
  const getRevenueTotal = (bookings) => bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const { start, end } = getPeriodBounds(revenueFilter);
  const currentPeriodBookings = bookingRequests.filter(b => {
    if (b.status !== 'approved') return false;
    const d = parseBookingDate(b.date);
    return d >= start && d <= end;
  });

  const getPreviousPeriodBounds = (filter) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === 'today') {
      const prev = new Date(end);
      prev.setDate(prev.getDate() - 1);
      return { start: new Date(prev), end: new Date(prev) };
    }
    if (filter === 'month') {
      return {
        start: new Date(end.getFullYear(), end.getMonth() - 1, 1),
        end: new Date(end.getFullYear(), end.getMonth(), 0)
      };
    }
    const start = new Date(end);
    start.setDate(start.getDate() - 13);
    const middle = new Date(end);
    middle.setDate(middle.getDate() - 7);
    return { start, end: middle };
  };

  const previousPeriodBookings = bookingRequests.filter(b => {
    if (b.status !== 'approved') return false;
    const d = parseBookingDate(b.date);
    const { start, end } = getPreviousPeriodBounds(revenueFilter);
    return d >= start && d <= end;
  });

  const revenueCurrent = getRevenueTotal(currentPeriodBookings);
  const revenuePrevious = getRevenueTotal(previousPeriodBookings);
  const growthPct = revenuePrevious === 0
    ? revenueCurrent === 0 ? 0 : 100
    : Math.round(((revenueCurrent - revenuePrevious) / revenuePrevious) * 100);

  // Chart data
  const chartDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = getRevenueTotal(
      bookingRequests.filter(
        b => b.status === 'approved' && parseBookingDate(b.date)?.getTime() === date.setHours(0, 0, 0, 0)
      )
    );
    return { dayLabel, amount };
  });

  const lineMax = Math.max(1, ...chartDates.map(item => item.amount));

  // Court revenue
  const safeCourts = Array.isArray(courts) ? courts.filter(c => c && typeof c === 'object' && c.id) : [];
  const courtRevenueData = safeCourts.map(court => ({
    court,
    value: getRevenueTotal(
      currentPeriodBookings.filter(b => String(b.courtId) === String(court.id || court._id))
    )
  }));
  const maxCourtRevenue = Math.max(1, ...courtRevenueData.map(item => item.value));

  // Peak vs Off-peak
  const peakRevenue = getRevenueTotal(
    currentPeriodBookings.filter(b => {
      const h = Number(b.hour);
      return h >= 17 && h <= 21;
    })
  );
  const offPeakRevenue = getRevenueTotal(
    currentPeriodBookings.filter(b => {
      const h = Number(b.hour);
      return h < 17 || h > 21;
    })
  );
  const totalPeak = peakRevenue + offPeakRevenue || 1;
  const peakPercent = Math.round((peakRevenue / totalPeak) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <DashboardHeader user={user} onLogout={() => setPage('home')} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Dashboard Stats */}
        <DashboardStats
          activeCourts={activeCourts}
          totalBookingsToday={totalBookingsToday}
          revenueToday={revenueToday}
          totalBookingsAll={totalBookingsAll}
        />

        <div className="my-12 border-t border-gray-200/50"></div>

        {/* Revenue Analytics */}
        <RevenueAnalytics
          chartData={chartDates}
          revenueFilter={revenueFilter}
          setRevenueFilter={setRevenueFilter}
          revenueCurrent={revenueCurrent}
          revenuePrevious={revenuePrevious}
          growthPct={growthPct}
          peakRevenue={peakRevenue}
          offPeakRevenue={offPeakRevenue}
          peakPercent={peakPercent}
        />

        <div className="my-12 border-t border-gray-200/50"></div>

        {/* Court Performance */}
        <CourtPerformance
          courtRevenueData={courtRevenueData}
          maxCourtRevenue={maxCourtRevenue}
          currentPeriodBookings={currentPeriodBookings}
        />

        {/* Footer Spacing */}
        <div className="mt-12 mb-6 text-center text-sm text-gray-500">
          <p>Kontum Badminton Management System © 2026 | Last updated: {new Date().toLocaleString()}</p>
        </div>
      </main>
    </div>
  );
}
