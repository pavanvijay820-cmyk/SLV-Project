import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Determine page title based on pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/enquiries/new')) return 'Register New Enquiry';
    if (path.startsWith('/enquiries/edit')) return 'Modify Enquiry Details';
    if (path.startsWith('/enquiries/')) return 'Enquiry Information Profile';
    if (path.startsWith('/enquiries')) return 'Lead Enquiry Directory';
    if (path.startsWith('/bookings')) return 'Confirmed Event Bookings';
    if (path.startsWith('/followups')) return 'Customer Follow-up Tasks';
    if (path.startsWith('/reports')) return 'Business Metrics & PDF Reports';
    return 'SLV Events CRM';
  };

  const getTodayDateString = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-150/80 shadow-sm">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-slate-100 text-slate-600 focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right section: Date, User info, Logout */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-brand-500" />
          <span>{getTodayDateString()}</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
            <span className="text-[10px] text-slate-400 capitalize mt-1 tracking-wider">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 shadow-inner">
            <User className="h-4 w-4 font-bold" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
