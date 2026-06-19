
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CalendarRange,
  ArrowUpDown,
  Plus,
  Loader2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EnquiryList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, hasRole } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rentalType, setRentalType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (rentalType) params.rental_type = rentalType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (sortBy) params.sort_by = sortBy;

      const response = await axios.get('/api/enquiries', { params });
      if (response.data.success) {
        setEnquiries(response.data.enquiries);
      } else {
        showToast('Failed to load enquiries directory.', 'error');
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      showToast('Error connecting to CRM database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input to avoid hitting endpoint repeatedly
    const handler = setTimeout(() => {
      fetchEnquiries();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, status, rentalType, startDate, endDate, sortBy]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this lead enquiry?')) {
      try {
        const response = await axios.delete(`/api/enquiries/${id}`);
        if (response.data.success) {
          showToast('Enquiry deleted successfully.', 'success');
          // Refresh list
          fetchEnquiries();
        } else {
          showToast(response.data.message || 'Failed to delete.', 'error');
        }
      } catch (err) {
        console.error('Delete enquiry error:', err);
        showToast(err.response?.data?.message || 'Server error deleting enquiry.', 'error');
      }
    }
  };

  // Convert status to styling classes
  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Contacted':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Follow-up':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Negotiation':
        return 'bg-cyan-50 text-cyan-750 border border-cyan-200';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  // Convert priority to styling classes
  const getPriorityBadge = (prioVal) => {
    switch (prioVal) {
      case 'Urgent':
        return 'bg-rose-600 text-white';
      case 'High':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'Normal':
      default:
        return 'bg-slate-100 text-slate-605 border border-slate-200';
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const rentalTypes = ['Self-Drive', 'Chauffeur Drive', 'Outstation Tour', 'Local Package', 'Airport Transfer', 'Other'];
  const statusValues = ['New', 'Contacted', 'Follow-up', 'Negotiation', 'Confirmed', 'Cancelled'];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header directory tools */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Customer Funnel</p>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Lead Enquiries</h1>
        </div>

        <button
          onClick={() => navigate('/enquiries/new')}
          className="btn-primary w-full md:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Lead Enquiry</span>
        </button>
      </div>

      {/* Filters Dashboard Panel */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute inset-y-0 left-3 flex items-center text-slate-450 h-full w-4" />
            <input
              type="text"
              placeholder="Search name, phone, pickup location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select-field"
            >
              <option value="">-- All Statuses --</option>
              {statusValues.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Rental Type Filter */}
          <div>
            <select
              value={rentalType}
              onChange={(e) => setRentalType(e.target.value)}
              className="select-field"
            >
              <option value="">-- All Rental Categories --</option>
              {rentalTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field"
            >
              <option value="created_at_desc">Sort: Newest Lead First</option>
              <option value="pickup_date_asc">Sort: Pickup Date (Ascending)</option>
              <option value="pickup_date_desc">Sort: Pickup Date (Descending)</option>
              <option value="cost_desc">Sort: Highest Cost First</option>
            </select>
          </div>

        </div>

        {/* Advanced Date Range Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-slate-100/60 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wide text-slate-400">
            <CalendarRange className="h-3.5 w-3.5" />
            <span>Pickup Date Filter:</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-xs bg-slate-50"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-xs bg-slate-50"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-brand-600 hover:text-brand-800 font-semibold"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 justify-center">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Refreshing enquiries directory...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-2">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-md font-bold text-slate-700">No enquiries found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters, searching for another keyword, or register a new customer lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Rental Details</th>
                  <th className="py-4 px-4">Pickup Location</th>
                  <th className="py-4 px-4 text-right">Cost</th>
                  <th className="py-4 px-4">Next Follow-up</th>
                  <th className="py-4 px-4">Assigned Staff</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => navigate(`/enquiries/${enq.id}`)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    {/* Customer */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div>{enq.customer_name}</div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{enq.customer_phone}</div>
                    </td>

                    {/* AI Priority */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPriorityBadge(enq.priority)}`}>
                        {enq.priority}
                      </span>
                    </td>

                    {/* Rental Details */}
                    <td className="py-4 px-4">
                      <div className="font-medium">{enq.rental_type}</div>
                      <div className="text-xs text-slate-450 mt-0.5">{formatDate(enq.pickup_date)} • {enq.rental_days} Days</div>
                    </td>

                    {/* Pickup Location */}
                    <td className="py-4 px-4 max-w-[150px] truncate text-slate-600 font-medium">
                      {enq.pickup_location}
                    </td>

                    {/* Cost */}
                    <td className="py-4 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(enq.estimated_cost)}
                    </td>

                    {/* Next Followup */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                      {enq.next_followup_date ? formatDate(enq.next_followup_date) : <span className="text-slate-300 font-normal">None Scheduled</span>}
                    </td>

                    {/* Assigned Owner */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {enq.staff_name ? enq.staff_name : <span className="text-slate-350 italic font-normal">Unassigned</span>}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`status-badge ${getStatusBadge(enq.status)}`}>
                        {enq.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => navigate(`/enquiries/${enq.id}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/enquiries/edit/${enq.id}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {hasRole(['admin', 'event_manager']) && (
                          <button
                            onClick={(e) => handleDelete(enq.id, e)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default EnquiryList;
