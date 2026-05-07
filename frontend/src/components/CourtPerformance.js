import React from 'react';
import { Award, Target } from 'lucide-react';

const CourtPerformance = ({ courtRevenueData, maxCourtRevenue, currentPeriodBookings }) => {
  return (
    <section id="courts" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Court Performance</h2>
        <p className="text-sm text-gray-600 mt-1">Revenue and booking metrics by court</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Court */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Court</h3>
              <p className="text-xs text-gray-500">Performance metrics</p>
            </div>
          </div>

          <div className="space-y-4">
            {courtRevenueData.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.court.name}</p>
                      <p className="text-xs text-gray-500">
                        {currentPeriodBookings.filter(b => String(b.courtId) === String(item.court.id || item.court._id)).length} bookings
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}đ</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 group-hover:shadow-lg"
                    style={{
                      width: `${maxCourtRevenue > 0 ? (item.value / maxCourtRevenue) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/80 border border-white/60 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <p className="text-xs text-gray-500">Highest revenue courts</p>
            </div>
          </div>

          <div className="space-y-3">
            {courtRevenueData
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Medal */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                        : 'bg-gradient-to-br from-orange-300 to-amber-400'
                    }`}
                  >
                    {index === 0 ? '🏆' : index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.court.name}</p>
                    <p className="text-xs text-gray-500">Revenue performance</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.value.toLocaleString()}đ</p>
                    <p className="text-xs text-gray-500">
                      {maxCourtRevenue > 0 ? Math.round((item.value / maxCourtRevenue) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourtPerformance;
