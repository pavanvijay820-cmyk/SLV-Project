import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Calendar, 
  MapPin, 
  Activity, 
  Plus, 
  Check, 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  ChevronRight, 
  PhoneCall, 
  Clock, 
  FileCheck,
  BrainCircuit,
  MessageSquare,
  Loader2,
  Trash2,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EnquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, hasRole } = useAuth();

  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form states
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [advancePayment, setAdvancePayment] = useState('0');
  const [vehicleAssigned, setVehicleAssigned] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);



  const fetchEnquiryDetails = async () => {
    try {
      const response = await axios.get(`/api/enquiries/${id}`);
      if (response.data.success) {
        setDetailData(response.data);
        // Default booking total to the enquiry estimated cost
        setTotalAmount(response.data.enquiry.estimated_cost);
      } else {
        showToast('Enquiry details not found.', 'error');
        navigate('/enquiries');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      showToast('Error retrieving enquiry details from server.', 'error');
      navigate('/enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiryDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await axios.put(`/api/enquiries/${id}`, { status: newStatus });
      if (response.data.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchEnquiryDetails();
      }
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Failed to update status.', 'error');
    }
  };



  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate) {
      showToast('Please specify follow-up date.', 'warning');
      return;
    }

    setIsSubmittingFollowup(true);
    try {
      const response = await axios.post('/api/followups', {
        enquiry_id: id,
        followup_date: followupDate,
        notes: followupNotes,
        status: 'Planned'
      });

      if (response.data.success) {
        showToast('Follow-up successfully scheduled!', 'success');
        setShowFollowupModal(false);
        setFollowupDate('');
        setFollowupNotes('');
        fetchEnquiryDetails();
      }
    } catch (err) {
      console.error('Add followup error:', err);
      showToast('Error scheduling follow-up.', 'error');
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  const handleCompleteFollowup = async (followupId) => {
    if (!window.confirm('Mark this follow-up as completed?')) return;
    try {
      const response = await axios.put(`/api/followups/${followupId}`, { status: 'Completed' });
      if (response.data.success) {
        showToast('Follow-up marked completed.', 'success');
        fetchEnquiryDetails();
      }
    } catch (err) {
      console.error('Complete followup error:', err);
      showToast('Failed to update follow-up.', 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!totalAmount || Number(totalAmount) <= 0) {
      showToast('Please enter a valid total booking amount.', 'warning');
      return;
    }
    if (!vehicleAssigned) {
      showToast('Please specify the assigned vehicle.', 'warning');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const response = await axios.post('/api/bookings', {
        enquiry_id: id,
        total_amount: totalAmount,
        advance_payment: advancePayment,
        vehicle_assigned: vehicleAssigned,
        status: 'Confirmed'
      });

      if (response.data.success) {
        showToast(`Successfully converted! Booking created: ${response.data.bookingNumber}`, 'success');
        setShowBookingModal(false);
        fetchEnquiryDetails();
      }
    } catch (err) {
      console.error('Convert booking error:', err);
      showToast(err.response?.data?.message || 'Error converting enquiry to booking.', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading enquiry profile details...</p>
        </div>
      </div>
    );
  }

  const { enquiry, booking, followups, activityLogs } = detailData;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return '-';
    const options = withTime 
      ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
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

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Back button & Action headers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/enquiries')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Status selector */}
          <select
            value={enquiry.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="select-field py-2 px-3 text-xs w-full sm:w-auto font-semibold"
          >
            <option value="New">Status: New</option>
            <option value="Contacted">Status: Contacted</option>
            <option value="Follow-up">Status: Follow-up</option>
            <option value="Negotiation">Status: Negotiation</option>
            <option value="Confirmed">Status: Confirmed</option>
            <option value="Cancelled">Status: Cancelled</option>
          </select>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}
            className="btn-secondary py-2 px-3 text-xs shadow-sm flex items-center justify-center gap-1.5 font-semibold"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>

          {/* Convert Booking button */}
          {!booking && enquiry.status !== 'Cancelled' && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="btn-primary py-2 px-4 text-xs font-semibold"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Convert to Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* CRM Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Details & Booking) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Customer Info */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-600" />
              <span>Customer Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Customer Name</span>
                <span className="text-sm font-semibold text-slate-800 block mt-1">{enquiry.customer_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Phone Number</span>
                <span className="text-sm font-semibold text-slate-800 block mt-1">{enquiry.customer_phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Email Address</span>
                <span className="text-sm font-semibold text-slate-800 block mt-1">{enquiry.customer_email || 'Not Provided'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Rental Requirements */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-brand-600" />
                <span>Rental Information</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  enquiry.priority === 'Urgent' 
                    ? 'bg-rose-50 text-rose-700 border-rose-250' 
                    : enquiry.priority === 'High' 
                      ? 'bg-amber-50 text-amber-700 border-amber-250 font-bold' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  Priority: {enquiry.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(enquiry.status)}`}>
                  CRM Stage: {enquiry.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Rental Category</span>
                <span className="text-sm font-semibold text-slate-850 block mt-1">{enquiry.rental_type}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Pickup Date</span>
                <span className="text-sm font-semibold text-slate-850 block mt-1">{formatDate(enquiry.pickup_date)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Rental Duration</span>
                <span className="text-sm font-semibold text-slate-850 block mt-1">{enquiry.rental_days} Days</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Estimated Cost (INR)</span>
                <span className="text-sm font-extrabold text-slate-850 block mt-1">{formatCurrency(enquiry.estimated_cost)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Acquisition Lead Source</span>
                <span className="text-sm font-semibold text-slate-850 block mt-1">{enquiry.lead_source}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">CRM Owner / Assigned Owner</span>
                <span className="text-sm font-semibold text-slate-850 block mt-1">
                  {enquiry.staff_name || 'Unassigned'}
                </span>
              </div>
              <div className="md:col-span-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Pickup / Delivery Location</span>
                <div className="flex items-start gap-1.5 mt-1.5 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span className="font-medium">{enquiry.pickup_location}</span>
                </div>
              </div>
              <div className="md:col-span-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Special Request Specifications / Notes</span>
                <p className="mt-1 text-sm bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                  {enquiry.notes || 'No custom notes provided by customer.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Booking Info (if converted) */}
          {booking ? (
            <div className="bg-white border border-emerald-150 rounded-2xl shadow-sm p-6 space-y-4 bg-gradient-to-br from-white to-emerald-50/10">
              <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CalendarCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span>Confirmed Booking details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Booking Reference</span>
                  <span className="text-sm font-mono font-bold text-emerald-700 block mt-1">{booking.booking_number}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Vehicle Assigned</span>
                  <span className="text-sm font-bold text-slate-800 block mt-1">{booking.vehicle_assigned || 'Not Assigned'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Contract Total</span>
                  <span className="text-sm font-black text-slate-800 block mt-1">{formatCurrency(booking.total_amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Paid Advance</span>
                  <span className="text-sm font-semibold text-emerald-600 block mt-1">{formatCurrency(booking.advance_payment)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Balance Outstanding</span>
                  <span className="text-sm font-semibold text-rose-500 block mt-1">{formatCurrency(booking.total_amount - booking.advance_payment)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Booking Date</span>
                  <span className="text-xs text-slate-550 block mt-1">{formatDate(booking.created_at, true)}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Contract Stage</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 mt-1 text-[10px] font-bold tracking-wide text-emerald-700 bg-emerald-100/60 rounded-full border border-emerald-200 uppercase">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        {/* Right Column (AI Insights, Follow-up timelines, Activity Stream) */}
        <div className="space-y-6">
          
          {/* Section 1: AI Recommendation */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="h-5 w-5 text-amber-500" />
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider">AI Rule recommendation</h4>
            </div>
            <p className="text-slate-350 text-xs font-semibold italic border-l-2 border-amber-500 pl-3.5 leading-relaxed">
              "{enquiry.recommendation || 'Analyzing details...'}"
            </p>
          </div>

          {/* Section 2: Follow-up Timeline */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <PhoneCall className="h-4.5 w-4.5 text-brand-600" />
                <span>Next Follow-ups</span>
              </h3>
              <button
                onClick={() => setShowFollowupModal(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-850 flex items-center gap-1 focus:outline-none"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Schedule</span>
              </button>
            </div>

            {followups.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No follow-ups scheduled for this customer.</p>
            ) : (
              <div className="space-y-3.5">
                {followups.map(f => (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">{formatDate(f.followup_date)}</span>
                      {f.status === 'Planned' ? (
                        <button
                          onClick={() => handleCompleteFollowup(f.id)}
                          className="px-2 py-0.5 bg-brand-50 hover:bg-brand-105 border border-brand-200 text-brand-700 font-bold rounded-lg text-[10px] focus:outline-none flex items-center gap-0.5 transition-colors"
                        >
                          <Check className="h-2.5 w-2.5" />
                          <span>Complete</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 uppercase tracking-wide">
                          <Check className="h-3 w-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                      {f.notes || 'No specific agenda logged.'}
                    </p>
                    <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/50 flex justify-between">
                      <span>By: {f.creator_name}</span>
                      <span className="uppercase font-semibold text-[8px] tracking-wide bg-slate-200/60 px-1 rounded text-slate-500">{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Activity Logs Audit stream */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-600" />
              <span>Activity History Logs</span>
            </h3>

            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No logs generated.</p>
            ) : (
              <div className="relative pl-4 border-l border-slate-100 space-y-5">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    {/* Circle bullet */}
                    <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-brand-500 border border-white" />
                    
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-slate-600">{log.action}</span>
                      <span className="text-[10px]">{formatDate(log.created_at, true)}</span>
                    </div>
                    <p className="text-slate-550 mt-1 leading-normal font-medium">{log.details}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5 italic">By: {log.user_name} ({log.user_role?.replace('_', ' ')})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* --- MODAL 1: Schedule Follow-up Modal --- */}
      {showFollowupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-150 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PhoneCall className="h-4.5 w-4.5 text-brand-500" />
              <span>Schedule Customer Follow-up</span>
            </h3>
            
            <form onSubmit={handleAddFollowup} className="space-y-4">
              <div>
                <label className="label-text">Select Follow-up Date *</label>
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="label-text">Agenda / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Call client to verify driver license details and pickup time."
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  className="input-field py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFollowup}
                  className="btn-primary py-2 text-xs"
                >
                  {isSubmittingFollowup ? <Loader2 className="h-3 animate-spin" /> : <span>Schedule Followup</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Convert to Booking Modal --- */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-150 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-brand-500" />
              <span>Convert Enquiry to Booking</span>
            </h3>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <p className="text-xs text-rose-500 font-semibold mb-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  ⚠️ Action details: This will confirm the client lead. A unique booking invoice reference number will be generated, and status will advance to 'Confirmed'.
                </p>
              </div>

              <div>
                <label className="label-text">Vehicle Assigned *</label>
                <input
                  type="text"
                  placeholder="e.g. Porsche 911 Carrera (SLV-9111)"
                  value={vehicleAssigned}
                  onChange={(e) => setVehicleAssigned(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="label-text">Total Invoice Amount (INR) *</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-text">Advance Deposit Payment Received (INR)</label>
                <input
                  type="number"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="btn-primary py-2 text-xs"
                >
                  {isSubmittingBooking ? <Loader2 className="h-3 animate-spin" /> : <span>Confirm Rental Booking</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnquiryDetail;
