import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnquiryList from './pages/EnquiryList';
import EnquiryForm from './pages/EnquiryForm';
import EnquiryDetail from './pages/EnquiryDetail';
import BookingList from './pages/BookingList';
import Followups from './pages/Followups';
import Reports from './pages/Reports';
import PlaceholderPage from './pages/PlaceholderPage';

import { Loader2 } from 'lucide-react';

// Route Guard Component
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        <span className="text-slate-400 font-semibold text-xs uppercase tracking-widest mt-4">SLV Events loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// General App Layout Wrapper
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#fcfaff] flex">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Primary Page Canvas */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Sticky Header */}
        <Header onMenuToggle={toggleSidebar} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-5 md:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Core CRM Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'booking_executive', 'event_manager']} />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/enquiries" element={<EnquiryList />} />
                <Route path="/enquiries/new" element={<EnquiryForm />} />
                <Route path="/enquiries/edit/:id" element={<EnquiryForm />} />
                <Route path="/enquiries/:id" element={<EnquiryDetail />} />
                <Route path="/bookings" element={<BookingList />} />
                <Route path="/followups" element={<Followups />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/quotations" element={<PlaceholderPage />} />
                <Route path="/profile" element={<PlaceholderPage />} />
                <Route path="/analytics" element={<PlaceholderPage />} />
                <Route path="/settings" element={<PlaceholderPage />} />
              </Route>
            </Route>

            {/* Fallback redirects */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
