import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/formatters';
import {
  Menu,
  Plus,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Code,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left section: Hamburger for mobile & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">DevTrack</span>
          <span>/</span>
          <span className="text-slate-600 capitalize">Workspace</span>
        </div>
      </div>

      {/* Right section: Action Buttons & User Menu */}
      <div className="flex items-center space-x-3">
        {/* Create Issue Quick Action */}
        <Link
          to="/issues/new"
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Issue</span>
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 line-clamp-1">{user?.name}</div>
              <div className="text-[10px] text-slate-500 font-medium flex items-center">
                {isAdmin ? (
                  <ShieldCheck className="w-3 h-3 text-brand-600 mr-0.5" />
                ) : (
                  <Code className="w-3 h-3 text-slate-500 mr-0.5" />
                )}
                {user?.role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in divide-y divide-slate-100">
                <div className="px-4 py-2.5">
                  <p className="text-xs font-medium text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      {user?.role} Account
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                    My Profile & Tasks
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
