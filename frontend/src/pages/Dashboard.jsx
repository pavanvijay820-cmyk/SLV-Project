import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ExecutiveDashboard from '../components/ExecutiveDashboard';
import ManagerDashboard from '../components/ManagerDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      if (response.data.success) {
        setData(response.data);
      } else {
        showToast('Failed to load dashboard metrics.', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard reports:', error);
      showToast('Server error loading dashboard analytics.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/dashboard/analytics');
      if (response.data.success) {
        setAnalyticsData(response.data);
      } else {
        showToast('Failed to load chart analytics.', 'error');
      }
    } catch (error) {
      console.error('Error fetching chart analytics:', error);
      showToast('Server error loading chart analytics.', 'error');
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, []);

  if (isLoading || isAnalyticsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading workspace dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalEnquiries: 0,
    newEnquiries: 0,
    todaysEnquiries: 0,
    pendingFollowups: 0,
    confirmedBookings: 0,
    revenue: 0
  };

  const charts = {
    monthlyTrend: data?.charts?.monthlyTrend || analyticsData?.monthlyEnquiries || [],
    bookingStatus: data?.charts?.bookingStatus || (analyticsData?.bookingStatus ? [
      { name: 'Confirmed', value: analyticsData.bookingStatus.confirmed || 0 },
      { name: 'Pending', value: analyticsData.bookingStatus.pending || 0 },
      { name: 'Completed', value: analyticsData.bookingStatus.completed || 0 },
      { name: 'Cancelled', value: analyticsData.bookingStatus.cancelled || 0 }
    ] : []),
    eventTypes: data?.charts?.eventTypes || analyticsData?.rentalCategories || []
  };

  const refreshData = () => {
    fetchDashboardData();
    fetchAnalyticsData();
  };

  // Switch between role-based dashboards
  if (user?.role === 'booking_executive') {
    return (
      <ExecutiveDashboard 
        summary={summary}
        charts={charts}
        refreshData={refreshData}
      />
    );
  }

  // Fallback to ManagerDashboard for managers & administrators
  return (
    <ManagerDashboard 
      summary={summary}
      charts={charts}
      refreshData={refreshData}
    />
  );
};

export default Dashboard;
