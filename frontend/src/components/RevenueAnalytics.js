import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const RevenueAnalytics = ({ chartData, revenueFilter, setRevenueFilter, revenueCurrent, revenuePrevious, growthPct, peakRevenue, offPeakRevenue, peakPercent }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(revenueFilter);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setRevenueFilter(period);
  };

  const growthColor = revenueCurrent >= revenuePrevious ? '#10b981' : '#ef4444';
  const growthLabel = revenueCurrent >= revenuePrevious ? `+${growthPct}%` : `${growthPct}%`;

  const peakData = [
    { name: 'Peak Hours (17-21)', value: peakRevenue, fill: '#3b82f6' },
    { name: 'Off-Peak Hours', value: offPeakRevenue, fill: '#9ca3af' }
  ];

  return (
    <section id="analytics" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Performance and revenue insights</p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['today', 'week', 'month'].map(period => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Current Period
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{revenueCurrent.toLocaleString()}đ</p>
          <p className="text-xs text-gray-500 mt-2">vs. previous period</p>
        </div>

        {/* Growth */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              growthColor === '#10b981'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-red-600 bg-red-50'
            }`}>
              {growthLabel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Growth Rate</p>
          <p className="text-3xl font-bold" style={{ color: growthColor }}>
            {growthLabel}
          </p>
          <p className="text-xs text-gray-500 mt-2">compared to previous period</p>
        </div>

        {/* Peak Revenue */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Peak Hours
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Peak Hours Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{peakRevenue.toLocaleString()}đ</p>
          <p className="text-xs text-gray-500 mt-2">17:00 - 21:00</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dayLabel" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Peak vs Off-Peak */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={peakData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {peakData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {peakData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{peakPercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevenueAnalytics;
