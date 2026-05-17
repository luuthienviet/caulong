import React, { useState } from 'react';
import { Bell, Settings, LogOut, Menu, X } from 'lucide-react';

export default function DashboardHeader({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Kontum Badminton</h1>
                <p className="text-xs text-gray-500">Hệ thống quản lý</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#overview" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Tổng quan
              </a>
              <a href="#analytics" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Phân tích
              </a>
              <a href="#courts" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Sân 
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition group">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <p className="text-sm text-gray-600">Không có thông báo mới</p>
                </div>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Settings size={20} />
              </button>

              {/* User Profile */}
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              >
                <LogOut size={20} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
              <a href="#overview" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition py-2">
                Tổng quan
              </a>
              <a href="#analytics" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition py-2">
                Phân tích
              </a>
              <a href="#courts" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition py-2">
                Sân
              </a>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
