import React, { useEffect, useState } from 'react';
import { Activity, Calendar, DollarSign, BarChart3 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, gradient, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    if (target === 0) return;

    const increment = target / 20;
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + increment;
        return next >= target ? target : next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [value]);

  const animationDelay = `${delay * 50}ms`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 transition-all duration-500 hover:shadow-lg hover:bg-white/95 hover:-translate-y-1"
      style={{
        animation: `fadeInUp 0.6s ease-out`,
        animationDelay,
        animationFillMode: 'both'
      }}
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${gradient}`}
      ></div>

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${gradient} bg-gradient-to-br`}>
        <Icon size={24} className="text-white" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? Math.floor(displayValue).toLocaleString() : value}
        </p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
      </div>

      {/* Accent line */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${gradient}`}></div>
    </div>
  );
};

export default function DashboardStats({ activeCourts, totalBookingsToday, revenueToday, totalBookingsAll }) {
  return (
    <section id="overview" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
        <p className="text-sm text-gray-600 mt-1">Các chỉ số thời gian thực và chỉ báo hiệu suất</p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          label="Sân đang hoạt động"
          value={activeCourts}
          subtext="Đang sử dụng"
          gradient="from-blue-600 to-cyan-600"
          delay={0}
        />
        <StatCard
          icon={Calendar}
          label="Đặt sân hôm nay"
          value={totalBookingsToday}
          subtext="Tổng đặt chỗ"
          gradient="from-purple-600 to-pink-600"
          delay={1}
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu hôm nay"
          value={`${revenueToday.toLocaleString()}đ`}
          subtext="Tổng thu nhập"
          gradient="from-emerald-600 to-teal-600"
          delay={2}
        />
        <StatCard
          icon={BarChart3}
          label="Tổng đặt sân"
          value={totalBookingsAll}
          subtext="Tất cả thời gian"
          gradient="from-orange-600 to-red-600"
          delay={3}
        />
      </div>
    </section>
  );
}
