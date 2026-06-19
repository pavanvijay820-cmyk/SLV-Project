import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  IndianRupee, 
  Edit, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Eye,
  MapPin,
  User,
  Car,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Mail,
  FileText,
  Navigation,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BookingList = () => {
  const { showToast } = useToast();
  const { user, hasRole } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and Sorting States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [sortBy, setSortBy] = useState('pickup_date_asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewingDetailsBooking, setViewingDetailsBooking] = useState(null);

  // Edit Form States
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editAdvancePayment, setEditAdvancePayment] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editVehicleAssigned, setEditVehicleAssigned] = useState('');
  const [editDropLocation, setEditDropLocation] = useState('');
  const [editReturnDate, setEditReturnDate] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editDriverRequired, setEditDriverRequired] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/bookings');
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        showToast('Failed to load bookings database.', 'error');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showToast('Error connecting to CRM bookings table.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEditClick = (booking, e) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setEditTotalAmount(booking.total_amount);
    setEditAdvancePayment(booking.advance_payment);
    setEditStatus(booking.status);
    setEditVehicleAssigned(booking.vehicle_assigned || '');
    setEditDropLocation(booking.drop_location || '');
    setEditReturnDate(booking.return_date ? booking.return_date.split('T')[0] : '');
    setEditPaymentStatus(booking.payment_status || 'Unpaid');
    setEditDriverRequired(booking.driver_required || 'No');
  };

  const handleViewDetailsClick = async (bookingId) => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}`);
      if (response.data.success) {
        setViewingDetailsBooking(response.data.booking);
      } else {
        showToast('Booking details not found.', 'error');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      showToast('Server error retrieving booking details.', 'error');
    }
  };

  const handleUpdateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!editTotalAmount || Number(editTotalAmount) <= 0) {
      showToast('Total amount must be greater than 0.', 'warning');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(`/api/bookings/${selectedBooking.id}`, {
        total_amount: editTotalAmount,
        advance_payment: editAdvancePayment,
        status: editStatus,
        vehicle_assigned: editVehicleAssigned,
        drop_location: editDropLocation,
        return_date: editReturnDate,
        payment_status: editPaymentStatus,
        driver_required: editDriverRequired
      });

      if (response.data.success) {
        showToast('Booking updated successfully!', 'success');
        setSelectedBooking(null);
        fetchBookings();
        // If we also had it open in details modal, refresh it
        if (viewingDetailsBooking && viewingDetailsBooking.id === selectedBooking.id) {
          handleViewDetailsClick(selectedBooking.id);
        }
      }
    } catch (err) {
      console.error('Update booking error:', err);
      showToast('Error updating booking.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Badges & Formatting Helpers
  const getBookingStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getPaymentStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'Paid':
        return 'bg-emerald-500 text-white font-bold';
      case 'Partial':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'Unpaid':
      default:
        return 'bg-rose-500 text-white font-bold';
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

  // Filter, Sort and Paginate logic
  const filteredBookings = bookings
    .filter(b => {
      const matchesSearch = 
        b.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
        b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.customer_phone?.toLowerCase().includes(search.toLowerCase()) ||
        b.pickup_location?.toLowerCase().includes(search.toLowerCase()) ||
        b.drop_location?.toLowerCase().includes(search.toLowerCase()) ||
        b.vehicle_assigned?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status ? b.status === status : true;
      const matchesPayment = paymentStatus ? b.payment_status === paymentStatus : true;

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      if (sortBy === 'pickup_date_asc') {
        return new Date(a.pickup_date) - new Date(b.pickup_date);
      } else if (sortBy === 'pickup_date_desc') {
        return new Date(b.pickup_date) - new Date(a.pickup_date);
      } else if (sortBy === 'amount_desc') {
        return b.total_amount - a.total_amount;
      } else if (sortBy === 'amount_asc') {
        return a.total_amount - b.total_amount;
      }
      return 0;
    });

  // Calculate slices for pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, paymentStatus, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in p-1">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Confirmed Contracts</p>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Car Rental Bookings</h1>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute inset-y-0 left-3 flex items-center text-slate-450 h-full w-4" />
            <input
              type="text"
              placeholder="Search ID, customer, vehicle, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Booking Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select-field"
            >
              <option value="">-- All Statuses --</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="select-field"
            >
              <option value="">-- All Payment Statuses --</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Sorting Field */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field"
            >
              <option value="pickup_date_asc">Pickup Date: Earliest First</option>
              <option value="pickup_date_desc">Pickup Date: Latest First</option>
              <option value="amount_desc">Amount: Highest First</option>
              <option value="amount_asc">Amount: Lowest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Responsive Bookings Container */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 justify-center">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Refreshing bookings directory...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-2">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-md font-bold text-slate-700">No bookings registered</h3>
            <p className="text-xs text-slate-400">No contracts matched the selected filters. Verify search keywords or status values.</p>
          </div>
        ) : (
          <div>
            {/* Table for Tablet and Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Booking ID</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Vehicle</th>
                    <th className="py-4 px-4">Pickup</th>
                    <th className="py-4 px-4">Return</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">Payment</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {paginatedBookings.map((b) => (
                    <tr 
                      key={b.id} 
                      onClick={() => handleViewDetailsClick(b.id)}
                      className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                    >
                      {/* Booking ID */}
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {b.booking_number}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        <div>{b.customer_name}</div>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{b.customer_phone}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {b.vehicle_assigned ? (
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <Car className="h-4 w-4 text-brand-500" />
                            {b.vehicle_assigned}
                          </span>
                        ) : (
                          <span className="text-rose-500 text-xs italic font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Pickup */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700">{formatDate(b.pickup_date)}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]" title={b.pickup_location}>
                          {b.pickup_location}
                        </div>
                      </td>

                      {/* Return */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700">{formatDate(b.return_date)}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]" title={b.drop_location}>
                          {b.drop_location || '-'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right font-black text-slate-800">
                        {formatCurrency(b.total_amount)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`status-badge ${getBookingStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 text-center">
                        <span className={`status-badge text-[10px] font-bold ${getPaymentStatusBadge(b.payment_status)}`}>
                          {b.payment_status || 'Unpaid'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleViewDetailsClick(b.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={(e) => handleEditClick(b, e)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                            title="Edit Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card Layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedBookings.map((b) => (
                <div 
                  key={b.id} 
                  onClick={() => handleViewDetailsClick(b.id)}
                  className="p-5 hover:bg-slate-50/30 transition-colors cursor-pointer space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-slate-800 text-sm">{b.booking_number}</span>
                    <span className={`status-badge text-[10px] ${getBookingStatusBadge(b.status)}`}>{b.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Customer</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{b.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Vehicle</span>
                      <span className="font-semibold text-slate-850 block mt-0.5 truncate">{b.vehicle_assigned || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Pickup</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">{formatDate(b.pickup_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Return</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">{formatDate(b.return_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Invoice Amount</span>
                      <span className="font-extrabold text-slate-900 block mt-0.5">{formatCurrency(b.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Payment Status</span>
                      <span className={`status-badge text-[9px] font-bold block mt-1 w-max ${getPaymentStatusBadge(b.payment_status)}`}>
                        {b.payment_status || 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewDetailsClick(b.id)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold rounded-lg text-[11px] flex items-center gap-1 focus:outline-none"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={(e) => handleEditClick(b, e)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold rounded-lg text-[11px] flex items-center gap-1 focus:outline-none"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, filteredBookings.length)}</span> of <span className="font-bold text-slate-700">{filteredBookings.length}</span> bookings
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                        currentPage === index + 1
                          ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                          : 'border-slate-200 hover:bg-white text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- EDIT BOOKING MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-150 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit className="h-4.5 w-4.5 text-brand-500" />
              <span>Update Booking: {selectedBooking.booking_number}</span>
            </h3>
            
            <form onSubmit={handleUpdateBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="label-text">Total Invoice Amount (INR) *</label>
                  <input
                    type="number"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label-text">Advance Deposit Payment Received (INR)</label>
                  <input
                    type="number"
                    value={editAdvancePayment}
                    onChange={(e) => setEditAdvancePayment(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-text">Vehicle Assigned</label>
                  <input
                    type="text"
                    placeholder="e.g., Porsche 911 Carrera (SLV-9111)"
                    value={editVehicleAssigned}
                    onChange={(e) => setEditVehicleAssigned(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-text">Drop / Return Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Hyderabad Airport"
                    value={editDropLocation}
                    onChange={(e) => setEditDropLocation(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-text">Expected Return Date</label>
                  <input
                    type="date"
                    value={editReturnDate}
                    onChange={(e) => setEditReturnDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-text">Driver Required</label>
                  <select
                    value={editDriverRequired}
                    onChange={(e) => setEditDriverRequired(e.target.value)}
                    className="select-field"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="select-field"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">Booking Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="select-field"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary py-2 text-xs"
                >
                  {isUpdating ? <Loader2 className="h-3 animate-spin" /> : <span>Update Booking Details</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILED BOOKING VIEW MODAL --- */}
      {viewingDetailsBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-150 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-50 border border-brand-100 rounded-xl text-brand-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contract Reference</span>
                  <h3 className="text-md font-mono font-bold text-slate-800">{viewingDetailsBooking.booking_number}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`status-badge text-[10px] uppercase font-bold tracking-wide ${getBookingStatusBadge(viewingDetailsBooking.status)}`}>
                  {viewingDetailsBooking.status}
                </span>
                <span className={`status-badge text-[10px] uppercase font-bold tracking-wide ${getPaymentStatusBadge(viewingDetailsBooking.payment_status)}`}>
                  Payment: {viewingDetailsBooking.payment_status || 'Unpaid'}
                </span>
              </div>
            </div>

            {/* Modal Content Grid */}
            <div className="space-y-6">
              
              {/* Section 1: Customer & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Customer Information */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide border-b border-slate-200/60 pb-2">
                    <User className="h-4 w-4 text-brand-500" />
                    <span>Customer Information</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Name:</span>
                      <span className="font-bold text-slate-800">{viewingDetailsBooking.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Phone:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {viewingDetailsBooking.customer_phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Email:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {viewingDetailsBooking.customer_email || 'Not Provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Assigned */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide border-b border-slate-200/60 pb-2">
                    <Car className="h-4 w-4 text-brand-500" />
                    <span>Vehicle Information</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Vehicle Assigned:</span>
                      <span className="font-bold text-slate-850">
                        {viewingDetailsBooking.vehicle_assigned || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Driver Required:</span>
                      <span className={`font-bold uppercase tracking-wider ${viewingDetailsBooking.driver_required === 'Yes' ? 'text-brand-650' : 'text-slate-500'}`}>
                        {viewingDetailsBooking.driver_required || 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Rental Category:</span>
                      <span className="font-semibold text-brand-600 bg-brand-50/80 px-2 py-0.5 rounded border border-brand-100 uppercase text-[9px] tracking-wide">
                        {viewingDetailsBooking.rental_type}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Section 2: Pickup & Return Details */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide border-b border-slate-200/60 pb-2">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <span>Pickup & Return Specifications</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block tracking-wider">Pickup Location</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {viewingDetailsBooking.pickup_location}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block tracking-wider">Expected Return/Drop Location</span>
                      <span className="font-semibold text-slate-850 flex items-center gap-1.5 mt-0.5">
                        <Navigation className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {viewingDetailsBooking.drop_location || 'Not Specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200/30 pb-1.5">
                      <span className="text-slate-400 font-semibold">Pickup Date:</span>
                      <span className="font-bold text-slate-800">{formatDate(viewingDetailsBooking.pickup_date)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/30 pb-1.5">
                      <span className="text-slate-400 font-semibold">Expected Return Date:</span>
                      <span className="font-bold text-slate-800">{formatDate(viewingDetailsBooking.return_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Total Rental Duration:</span>
                      <span className="font-bold text-slate-800">{viewingDetailsBooking.rental_days || '2'} Days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Summary */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide border-b border-emerald-200/40 pb-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  <span>Payment Ledger Summary</span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Amount</span>
                    <span className="text-md font-black text-slate-850 block mt-1">
                      {formatCurrency(viewingDetailsBooking.total_amount)}
                    </span>
                  </div>
                  <div className="bg-white border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Advance Paid</span>
                    <span className="text-md font-bold text-emerald-600 block mt-1">
                      {formatCurrency(viewingDetailsBooking.advance_payment)}
                    </span>
                  </div>
                  <div className="bg-white border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Balance Due</span>
                    <span className="text-md font-bold text-rose-500 block mt-1">
                      {formatCurrency(viewingDetailsBooking.total_amount - viewingDetailsBooking.advance_payment)}
                    </span>
                  </div>
                  <div className="bg-white border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Payment State</span>
                    <span className={`status-badge text-[10px] font-bold block mt-1.5 ${getPaymentStatusBadge(viewingDetailsBooking.payment_status)}`}>
                      {viewingDetailsBooking.payment_status || 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Visual Booking Timeline */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide border-b border-slate-200/60 pb-2">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  <span>Rental Contract Timeline</span>
                </h4>
                
                <div className="relative pl-6 border-l border-slate-200 ml-2 space-y-4.5 text-xs pb-1.5">
                  
                  {/* Step 1: Booking Created */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white">
                      ✓
                    </span>
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold text-slate-700 text-xs">Booking Registered & Confirmed</span>
                      <span className="text-[10px]">{formatDate(viewingDetailsBooking.created_at)}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Booking invoice record generated in mock memory database.</p>
                  </div>

                  {/* Step 2: Pickup Scheduled */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 h-3.5 w-3.5 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center text-[8px] text-white">
                      ➜
                    </span>
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold text-slate-700 text-xs">Expected Vehicle Pickup</span>
                      <span className="text-[10px] font-semibold text-brand-600">{formatDate(viewingDetailsBooking.pickup_date)}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Pickup location: {viewingDetailsBooking.pickup_location}</p>
                  </div>

                  {/* Step 3: Expected Return */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 h-3.5 w-3.5 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] text-white" />
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold text-slate-700 text-xs">Expected Return & Key Dropoff</span>
                      <span className="text-[10px]">{formatDate(viewingDetailsBooking.return_date)}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Expected drop location: {viewingDetailsBooking.drop_location || 'Not Specified'}</p>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={(e) => handleEditClick(viewingDetailsBooking, e)}
                className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-semibold"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Update Booking</span>
              </button>
              
              <button
                type="button"
                onClick={() => setViewingDetailsBooking(null)}
                className="btn-primary py-2 px-4 text-xs font-semibold"
              >
                <span>Close Details</span>
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingList;
