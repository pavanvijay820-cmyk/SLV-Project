import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  CalendarCheck, 
  PhoneCall, 
  BarChart3, 
  LogOut, 
  Car,
  UserCheck,
  Activity,
  Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return 'Admin';
      case 'event_manager':
        return 'Branch Manager';
      case 'booking_executive':
        return 'Sales Executive';
      default:
        return 'Staff';
    }
  };

  const getMenuItems = () => {
    if (user?.role === 'booking_executive') {
      return [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
          name: 'Enquiries',
          path: '/enquiries',
          icon: <FileText className="h-5 w-5" />
        },
        {
          name: 'Follow-ups',
          path: '/followups',
          icon: <PhoneCall className="h-5 w-5" />
        },
        {
          name: 'Bookings',
          path: '/bookings',
          icon: <CalendarCheck className="h-5 w-5" />
        },
        {
          name: 'Quotations',
          path: '/quotations',
          icon: <FileText className="h-5 w-5" />
        },
        {
          name: 'Profile',
          path: '/profile',
          icon: <UserCheck className="h-5 w-5" />
        }
      ];
    }

    // Default for manager/admin
    return [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />
      },
      {
        name: 'Enquiries',
        path: '/enquiries',
        icon: <FileText className="h-5 w-5" />
      },
      {
        name: 'Bookings',
        path: '/bookings',
        icon: <CalendarCheck className="h-5 w-5" />
      },
      {
        name: 'Follow-ups',
        path: '/followups',
        icon: <PhoneCall className="h-5 w-5" />
      },
      {
        name: 'Reports',
        path: '/reports',
        icon: <BarChart3 className="h-5 w-5" />
      },
      {
        name: 'Analytics',
        path: '/analytics',
        icon: <Activity className="h-5 w-5" />
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: <Settings className="h-5 w-5" />
      }
    ];
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 shadow-md">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">SLV Events</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">CRM Portal</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 text-slate-200">
              <UserCheck className="h-5 w-5 text-brand-350" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className="inline-flex items-center px-2 py-0.5 mt-1 text-[10px] font-bold tracking-wide text-brand-100 bg-brand-900/60 rounded-full border border-brand-800/40 uppercase">
                {getRoleBadge(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {getMenuItems().map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => lgCheckToggle(toggleSidebar)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow-lg shadow-brand-950/40 font-semibold border-l-4 border-amber-500' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-800/65">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Helper to close sidebar on mobile click
const lgCheckToggle = (toggleFunc) => {
  if (window.innerWidth < 1024) {
    toggleFunc();
  }
};

export default Sidebar;
