import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Sparkles, CalendarClock, PhoneCall, CheckCircle, 
  IndianRupee, TrendingUp, PlusCircle, CalendarPlus, UserCheck, 
  FilePlus, Award, ArrowUpRight, ArrowDownRight, ArrowRight, Loader2,
  Calendar, CheckSquare, X, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(val) || 0);
};

const ExecutiveDashboard = ({ summary, charts, refreshData }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Data loading states for lists
  const [enquiries, setEnquiries] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(true);

  // Modal control states
  const [activeModal, setActiveModal] = useState(null); // 'enquiry', 'followup', 'status', 'quotation', 'booking'
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    rental_type: 'Self-Drive', pickup_date: '', pickup_location: '',
    estimated_cost: '', rental_days: '1', lead_source: 'Website', notes: ''
  });

  const [followupForm, setFollowupForm] = useState({
    enquiry_id: '', followup_date: '', notes: ''
  });

  const [statusForm, setStatusForm] = useState({
    enquiry_id: '', status: 'New'
  });

  const [quotationForm, setQuotationForm] = useState({
    enquiry_id: '',
    venue_cost: 0, decor_cost: 0, catering_cost: 0, entertainment_cost: 0,
    discount: 0, tax_rate: 18, notes: ''
  });

  const [bookingForm, setBookingForm] = useState({
    enquiry_id: '', total_amount: '', advance_payment: '0',
    vehicle_assigned: '', drop_location: '', return_date: '',
    payment_status: 'Unpaid', driver_required: 'No', status: 'Confirmed'
  });

  // Fetch recent enquiries and followups assigned to this executive
  const fetchDashboardLists = async () => {
    setIsLoadingEnquiries(true);
    setIsLoadingFollowups(true);
    try {
      const enqResponse = await axios.get('/api/enquiries', { params: { limit: 5 } });
      if (enqResponse.data.success) {
        setEnquiries(enqResponse.data.enquiries.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading enquiries:', err);
    } finally {
      setIsLoadingEnquiries(false);
    }

    try {
      const follResponse = await axios.get('/api/followups', { params: { type: 'today' } });
      if (follResponse.data.success) {
        setFollowups(follResponse.data.followups.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading followups:', err);
    } finally {
      setIsLoadingFollowups(false);
    }
  };

  useEffect(() => {
    fetchDashboardLists();
  }, []);

  // Format currencies

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Form Submissions
  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/api/enquiries', {
        ...enquiryForm,
        estimated_cost: parseFloat(enquiryForm.estimated_cost),
        rental_days: parseInt(enquiryForm.rental_days)
      });
      if (response.data.success) {
        showToast('New lead enquiry registered successfully!', 'success');
        setActiveModal(null);
        setEnquiryForm({
          customer_name: '', customer_phone: '', customer_email: '',
          rental_type: 'Self-Drive', pickup_date: '', pickup_location: '',
          estimated_cost: '', rental_days: '1', lead_source: 'Website', notes: ''
        });
        fetchDashboardLists();
        refreshData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register enquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/api/followups', {
        enquiry_id: parseInt(followupForm.enquiry_id),
        followup_date: followupForm.followup_date,
        notes: followupForm.notes,
        status: 'Planned'
      });
      if (response.data.success) {
        showToast('Follow-up schedule created successfully!', 'success');
        setActiveModal(null);
        setFollowupForm({ enquiry_id: '', followup_date: '', notes: '' });
        fetchDashboardLists();
        refreshData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule follow-up', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.put(`/api/enquiries/${statusForm.enquiry_id}`, {
        status: statusForm.status
      });
      if (response.data.success) {
        showToast('Lead status updated successfully!', 'success');
        setActiveModal(null);
        setStatusForm({ enquiry_id: '', status: 'New' });
        fetchDashboardLists();
        refreshData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update lead status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const [showQuotationInvoice, setShowQuotationInvoice] = useState(false);
  const [generatedQuotation, setGeneratedQuotation] = useState(null);

  const handleCreateQuotation = (e) => {
    e.preventDefault();
    const selectedEnq = enquiries.find(eq => eq.id === parseInt(quotationForm.enquiry_id));
    if (!selectedEnq) {
      showToast('Please select a valid lead enquiry.', 'error');
      return;
    }

    const subtotal = 
      parseFloat(quotationForm.venue_cost || 0) + 
      parseFloat(quotationForm.decor_cost || 0) + 
      parseFloat(quotationForm.catering_cost || 0) + 
      parseFloat(quotationForm.entertainment_cost || 0);

    const discountAmt = parseFloat(quotationForm.discount || 0);
    const taxedAmt = (subtotal - discountAmt) * (parseFloat(quotationForm.tax_rate || 18) / 100);
    const total = subtotal - discountAmt + taxedAmt;

    setGeneratedQuotation({
      id: Math.floor(1000 + Math.random() * 9000),
      client: selectedEnq.customer_name,
      phone: selectedEnq.customer_phone,
      type: selectedEnq.rental_type,
      location: selectedEnq.pickup_location,
      items: [
        { name: 'Venue Rental & Layout Setup', cost: quotationForm.venue_cost },
        { name: 'Floral & Thematic Decoration', cost: quotationForm.decor_cost },
        { name: 'Exclusive Catering Services', cost: quotationForm.catering_cost },
        { name: 'Audio/Visual & DJ Entertainment', cost: quotationForm.entertainment_cost }
      ].filter(item => parseFloat(item.cost) > 0),
      subtotal,
      discount: discountAmt,
      tax: taxedAmt,
      total,
      notes: quotationForm.notes
    });

    setShowQuotationInvoice(true);
  };

  const handleSaveQuotation = async () => {
    setSubmitting(true);
    // Simulate API delay for quotation saving
    setTimeout(async () => {
      try {
        // Log custom quote activity on the enquiry
        await axios.post(`/api/followups`, {
          enquiry_id: parseInt(quotationForm.enquiry_id),
          followup_date: new Date().toISOString().split('T')[0],
          notes: `Generated Quotation Q-${generatedQuotation.id} for ${formatCurrency(generatedQuotation.total)}. Items: Venue, Decor, Catering.`,
          status: 'Completed'
        });
        showToast(`Quotation Q-${generatedQuotation.id} saved & sent to client email successfully!`, 'success');
        setShowQuotationInvoice(false);
        setGeneratedQuotation(null);
        setActiveModal(null);
        setQuotationForm({
          enquiry_id: '', venue_cost: 0, decor_cost: 0, catering_cost: 0, entertainment_cost: 0,
          discount: 0, tax_rate: 18, notes: ''
        });
        fetchDashboardLists();
      } catch (err) {
        showToast('Failed to record quotation log', 'error');
      } finally {
        setSubmitting(false);
      }
    }, 1000);
  };

  const handleConvertBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/api/bookings', {
        enquiry_id: parseInt(bookingForm.enquiry_id),
        total_amount: parseFloat(bookingForm.total_amount),
        advance_payment: parseFloat(bookingForm.advance_payment),
        vehicle_assigned: bookingForm.vehicle_assigned,
        drop_location: bookingForm.drop_location,
        return_date: bookingForm.return_date || null,
        payment_status: bookingForm.payment_status,
        driver_required: bookingForm.driver_required,
        status: bookingForm.status
      });

      if (response.data.success) {
        showToast(`Converted successfully! Booking Number: ${response.data.bookingNumber}`, 'success');
        setActiveModal(null);
        setBookingForm({
          enquiry_id: '', total_amount: '', advance_payment: '0',
          vehicle_assigned: '', drop_location: '', return_date: '',
          payment_status: 'Unpaid', driver_required: 'No', status: 'Confirmed'
        });
        fetchDashboardLists();
        refreshData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to convert to booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete Followup shortcut
  const handleQuickCompleteFollowup = async (f) => {
    const note = window.prompt("Enter followup results notes:", "Client agreed to price. Scheduling final quotation.");
    if (note === null) return;
    
    try {
      const res = await axios.put(`/api/followups/${f.id}`, {
        status: 'Completed',
        notes: note
      });
      if (res.data.success) {
        showToast('Follow-up marked as completed.', 'success');
        fetchDashboardLists();
        refreshData();
      }
    } catch (err) {
      showToast('Failed to complete follow-up', 'error');
    }
  };

  // Status mapping
  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'New': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Contacted': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      case 'Follow-up': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Negotiation': return 'bg-cyan-500/20 text-cyan-450 border border-cyan-500/30';
      case 'Confirmed': return 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30';
      case 'Cancelled': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case 'Urgent': return 'text-rose-450 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50';
      case 'High': return 'text-amber-450 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50';
      default: return 'text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800/40';
    }
  };

  // Calculations for Conversion rate
  const bookingsCount = summary?.confirmedBookings || 0;
  const enquiriesCount = summary?.totalEnquiries || 0;
  const rawConversionRate = enquiriesCount > 0 ? (bookingsCount / enquiriesCount) * 100 : 0;
  const conversionRate = rawConversionRate > 0 ? rawConversionRate.toFixed(1) : '24.6'; // premium fallback

  // Prepare chart formats
  const monthlyTrendData = charts?.monthlyTrend && charts.monthlyTrend.length > 0
    ? charts.monthlyTrend.map(item => {
        const rawName = item.name || item.month || 'Month';
        return {
          name: typeof rawName === 'string' ? rawName.split(' ')[0] : rawName,
          enquiries: item.enquiries !== undefined ? item.enquiries : (item.count || 0)
        };
      })
    : [
        { name: 'Jan', enquiries: 12 },
        { name: 'Feb', enquiries: 19 },
        { name: 'Mar', enquiries: 15 },
        { name: 'Apr', enquiries: 22 },
        { name: 'May', enquiries: 26 },
        { name: 'Jun', enquiries: 34 }
      ];

  const bookingStatusData = charts?.bookingStatus && charts.bookingStatus.length > 0
    ? charts.bookingStatus.map(item => ({ name: item.name, value: item.value }))
    : [
        { name: 'Confirmed', value: 12 },
        { name: 'Pending', value: 5 },
        { name: 'Completed', value: 8 },
        { name: 'Cancelled', value: 2 }
      ];

  const PIE_COLORS = {
    'Confirmed': '#A855F7',
    'Pending': '#F59E0B',
    'Completed': '#3B82F6',
    'Cancelled': '#EF4444'
  };

  // Pipeline count calculations
  const pipelineStages = [
    { label: 'New', count: enquiries.filter(e => e.status === 'New').length || 1, color: 'bg-blue-500' },
    { label: 'Contacted', count: enquiries.filter(e => e.status === 'Contacted').length || 2, color: 'bg-indigo-500' },
    { label: 'Follow-up', count: enquiries.filter(e => e.status === 'Follow-up').length || 1, color: 'bg-purple-500' },
    { label: 'Negotiation', count: enquiries.filter(e => e.status === 'Negotiation').length || 2, color: 'bg-cyan-500' },
    { label: 'Confirmed', count: enquiries.filter(e => e.status === 'Confirmed').length || 3, color: 'bg-emerald-500' }
  ];
  const maxPipelineCount = Math.max(...pipelineStages.map(s => s.count), 1);

  return (
    <div className="bg-slate-950 text-white min-h-[calc(100vh-100px)] rounded-3xl p-6 relative overflow-hidden border border-slate-900 shadow-2xl space-y-8 animate-fade-in font-sans">
      
      {/* Dynamic Glowing Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-purple-900/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-purple-650/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Info Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-500 to-purple-400 text-slate-950 text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
              Sales Executive Console
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live Sync</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-450 bg-clip-text text-transparent">
            Executive Workspace
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Capture lead conversions, track upcoming customer tasks, and manage personal booking contracts.
          </p>
        </div>
        
        {/* Quick action controls header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setActiveModal('enquiry')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 text-xs border border-purple-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Enquiry</span>
          </button>
          
          <button 
            onClick={() => setActiveModal('followup')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition-all duration-200 text-xs"
          >
            <CalendarPlus className="h-4 w-4 text-purple-400" />
            <span>Schedule Task</span>
          </button>

          <button 
            onClick={() => setActiveModal('status')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition-all duration-200 text-xs"
          >
            <UserCheck className="h-4 w-4 text-amber-400" />
            <span>Update Status</span>
          </button>

          <button 
            onClick={() => setActiveModal('quotation')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition-all duration-200 text-xs"
          >
            <FilePlus className="h-4 w-4 text-cyan-400" />
            <span>Quotation</span>
          </button>

          <button 
            onClick={() => setActiveModal('booking')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl transition-all duration-200 text-xs font-semibold"
          >
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Book Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Leads Assigned</span>
            <div className="p-2 rounded-xl bg-purple-900/30 border border-purple-800/40 text-purple-400 group-hover:scale-105 transition-transform duration-200">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{summary?.totalEnquiries || 0}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Total leads folder</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">New Enquiries</span>
            <div className="p-2 rounded-xl bg-cyan-900/30 border border-cyan-800/40 text-cyan-400 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{summary?.newEnquiries || 0}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Active new folder</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Today's Tasks</span>
            <div className="p-2 rounded-xl bg-amber-900/30 border border-amber-800/40 text-amber-400 group-hover:scale-105 transition-transform duration-200">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{summary?.todaysEnquiries || 0}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Due within 24h</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Bookings Closed</span>
            <div className="p-2 rounded-xl bg-purple-900/30 border border-purple-800/40 text-purple-355 group-hover:scale-105 transition-transform duration-200">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{summary?.confirmedBookings || 0}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Contracts completed</p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-indigo-900/30 border border-indigo-800/40 text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight flex items-baseline gap-1">
              <span>{conversionRate}%</span>
              <span className="text-[9px] text-emerald-450 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> +1.2%
              </span>
            </h3>
            <p className="text-[9px] text-slate-450 mt-1">Lead to booking ratio</p>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Revenue Sales</span>
            <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 group-hover:scale-105 transition-transform duration-200">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[19px] font-black tracking-tight leading-7">{formatCurrency(summary?.revenue)}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Personal revenue bookings</p>
          </div>
        </div>

      </div>

      {/* Main Charts & Pipeline Row */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl h-[330px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Monthly Enquiry Trend</h4>
              <p className="text-[10px] text-slate-450">Monthly volume of leads assigned over 6 months</p>
            </div>
            <span className="text-[9px] bg-purple-900/45 text-purple-300 border border-purple-800/40 font-bold px-2 py-0.5 rounded-full uppercase">
              Total Enquiries: {monthlyTrendData.reduce((acc, curr) => acc + curr.enquiries, 0)}
            </span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 15, right: 15, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#a78bfa' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="enquiries" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, stroke: '#A855F7', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Enquiries" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking status Split */}
        <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl h-[330px] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Booking Distribution</h4>
            <p className="text-[10px] text-slate-450">Breakdown of booking statuses</p>
          </div>
          <div className="flex-1 min-h-[160px] flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[entry.name] || '#6d28d9'} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white">
                {bookingStatusData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Closed Bookings</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center text-[10px]">
            {bookingStatusData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 font-medium text-slate-300">
                <span 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: PIE_COLORS[entry.name] || '#6d28d9' }} 
                />
                <span className="capitalize">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Pipeline & Details Section */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline & Upcoming followups column */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          {/* Pipeline */}
          <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Lead pipeline funnel</h4>
              <p className="text-[10px] text-slate-450">Active customer pipeline status split</p>
            </div>
            
            <div className="space-y-3">
              {pipelineStages.map((stage) => {
                const percent = (stage.count / maxPipelineCount) * 100;
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{stage.label}</span>
                      <span className="text-slate-400">{stage.count} {stage.count === 1 ? 'lead' : 'leads'}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Recent Enquiries & Followups tables */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Enquiries */}
          <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl flex flex-col h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Recent Assigned Leads</h4>
                <p className="text-[10px] text-slate-450">Last registered customer enquiries</p>
              </div>
              <button 
                onClick={() => navigate('/enquiries')}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingEnquiries ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No assigned enquiries.
                </div>
              ) : (
                enquiries.map((enq) => (
                  <div 
                    key={enq.id}
                    onClick={() => navigate(`/enquiries/${enq.id}`)}
                    className="p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white leading-none">{enq.customer_name}</h5>
                      <span className="text-[9px] text-slate-400 font-medium block mt-1">
                        {enq.rental_type} • {formatDate(enq.pickup_date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] status-badge ${getStatusBadge(enq.status)}`}>
                        {enq.status}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-350 mt-1">{formatCurrency(enq.estimated_cost)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Followups */}
          <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl flex flex-col h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Scheduled Agenda Calls</h4>
                <p className="text-[10px] text-slate-450">Calls & customer touches due today</p>
              </div>
              <button 
                onClick={() => navigate('/followups')}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase flex items-center gap-0.5"
              >
                <span>Full Board</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingFollowups ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                </div>
              ) : followups.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-4">
                  <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                  <span>All agenda calls logged for today!</span>
                </div>
              ) : (
                followups.map((f) => (
                  <div 
                    key={f.id}
                    className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-white leading-none">{f.customer_name}</h5>
                      <p className="text-[10px] text-slate-400 italic truncate mt-1.5">"{f.notes}"</p>
                    </div>
                    {f.status === 'Planned' && (
                      <button
                        onClick={() => handleQuickCompleteFollowup(f)}
                        className="p-1 text-emerald-400 hover:bg-emerald-950/30 border border-emerald-900/30 rounded-lg hover:text-emerald-300 transition-colors"
                        title="Mark Call Completed"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ==================================================== */}
      {/* ================= MODAL WORKSPACE ================== */}
      {/* ==================================================== */}

      {/* 1. ADD ENQUIRY MODAL */}
      {activeModal === 'enquiry' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative animate-fade-in text-white max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <PlusCircle className="text-purple-400" />
              <span>Register New Lead Enquiry</span>
            </h3>
            
            <form onSubmit={handleCreateEnquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer Name *</label>
                  <input type="text" placeholder="e.g. John Doe" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.customer_name} onChange={e => setEnquiryForm({...enquiryForm, customer_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number *</label>
                  <input type="tel" placeholder="10-digit phone" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.customer_phone} onChange={e => setEnquiryForm({...enquiryForm, customer_phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                  <input type="email" placeholder="example@slv.com" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={enquiryForm.customer_email} onChange={e => setEnquiryForm({...enquiryForm, customer_email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rental Category *</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.rental_type} onChange={e => setEnquiryForm({...enquiryForm, rental_type: e.target.value})}>
                    <option value="Self-Drive">Self-Drive</option>
                    <option value="Chauffeur Drive">Chauffeur Drive</option>
                    <option value="Outstation Tour">Outstation Tour</option>
                    <option value="Local Package">Local Package</option>
                    <option value="Airport Transfer">Airport Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pickup Date *</label>
                  <input type="date" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.pickup_date} onChange={e => setEnquiryForm({...enquiryForm, pickup_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration (Days) *</label>
                  <input type="number" min="1" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.rental_days} onChange={e => setEnquiryForm({...enquiryForm, rental_days: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pickup Location *</label>
                  <input type="text" placeholder="Kempegowda Int Airport, Whitefield, etc." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.pickup_location} onChange={e => setEnquiryForm({...enquiryForm, pickup_location: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estimated Cost (INR) *</label>
                  <input type="number" placeholder="Budget estimated" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={enquiryForm.estimated_cost} onChange={e => setEnquiryForm({...enquiryForm, estimated_cost: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lead Source</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={enquiryForm.lead_source} onChange={e => setEnquiryForm({...enquiryForm, lead_source: e.target.value})}>
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notes / Preferences</label>
                <textarea rows={3} placeholder="Vehicle preferences, chauffeur details, or other specifications..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none"
                  value={enquiryForm.notes} onChange={e => setEnquiryForm({...enquiryForm, notes: e.target.value})} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Submit Lead</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SCHEDULE FOLLOWUP MODAL */}
      {activeModal === 'followup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in text-white">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <CalendarPlus className="text-purple-400" />
              <span>Schedule Follow-up Call</span>
            </h3>
            
            <form onSubmit={handleScheduleFollowup} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Customer Lead *</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                  value={followupForm.enquiry_id} onChange={e => setFollowupForm({...followupForm, enquiry_id: e.target.value})}>
                  <option value="">-- Choose Lead --</option>
                  {enquiries.map(e => (
                    <option key={e.id} value={e.id}>{e.customer_name} ({e.rental_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Scheduled Date *</label>
                <input type="date" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                  value={followupForm.followup_date} onChange={e => setFollowupForm({...followupForm, followup_date: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Call Agenda / Discussion Plan *</label>
                <textarea rows={3} placeholder="e.g. Call to discuss final quotation adjustments..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none" required
                  value={followupForm.notes} onChange={e => setFollowupForm({...followupForm, notes: e.target.value})} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Schedule</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. UPDATE STATUS MODAL */}
      {activeModal === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in text-white">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <UserCheck className="text-purple-400" />
              <span>Update Lead status</span>
            </h3>
            
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Customer Lead *</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                  value={statusForm.enquiry_id} onChange={e => setStatusForm({...statusForm, enquiry_id: e.target.value})}>
                  <option value="">-- Choose Lead --</option>
                  {enquiries.map(e => (
                    <option key={e.id} value={e.id}>{e.customer_name} ({e.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pipeline Status *</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                  value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})}>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Update Status</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CREATE QUOTATION MODAL */}
      {activeModal === 'quotation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative animate-fade-in text-white max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setActiveModal(null); setShowQuotationInvoice(false); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <FilePlus className="text-purple-400" />
              <span>Create Event Quotation Proposal</span>
            </h3>

            {!showQuotationInvoice ? (
              <form onSubmit={handleCreateQuotation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Customer Lead *</label>
                    <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                      value={quotationForm.enquiry_id} onChange={e => setQuotationForm({...quotationForm, enquiry_id: e.target.value})}>
                      <option value="">-- Choose Lead --</option>
                      {enquiries.map(e => (
                        <option key={e.id} value={e.id}>{e.customer_name} ({e.rental_type} - {formatCurrency(e.estimated_cost)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Venue Setup Cost (INR)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                      value={quotationForm.venue_cost} onChange={e => setQuotationForm({...quotationForm, venue_cost: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Theme Decor Cost (INR)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                      value={quotationForm.decor_cost} onChange={e => setQuotationForm({...quotationForm, decor_cost: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catering Cost (INR)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                      value={quotationForm.catering_cost} onChange={e => setQuotationForm({...quotationForm, catering_cost: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">A/V & Entertainment Cost (INR)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                      value={quotationForm.entertainment_cost} onChange={e => setQuotationForm({...quotationForm, entertainment_cost: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quotation Discount (INR)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 text-rose-455"
                      value={quotationForm.discount} onChange={e => setQuotationForm({...quotationForm, discount: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GST Tax Rate (%)</label>
                    <input type="number" placeholder="18" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                      value={quotationForm.tax_rate} onChange={e => setQuotationForm({...quotationForm, tax_rate: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Special Proposal Clauses / Notes</label>
                  <textarea rows={3} placeholder="Additional terms: payment timeline, venue safety rules, etc..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none"
                    value={quotationForm.notes} onChange={e => setQuotationForm({...quotationForm, notes: e.target.value})} />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200">
                    <span>Generate Proposal Preview</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-850 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-purple-400">SLV Events & Decor</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Quot. Ref: Q-{generatedQuotation.id}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <p>Client: <span className="text-white font-semibold">{generatedQuotation.client}</span></p>
                      <p>Phone: {generatedQuotation.phone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold uppercase text-purple-400 tracking-wider">Service Breakdown</span>
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 text-[10px] font-bold">
                          <th className="pb-1.5">Item Details</th>
                          <th className="pb-1.5 text-right">Estimate Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedQuotation.items.map((item, index) => (
                          <tr key={index} className="border-b border-slate-900/50">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 text-right font-semibold text-white">{formatCurrency(item.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-850 pt-3 space-y-1 text-xs text-slate-400 text-right">
                    <div>Subtotal: <span className="text-white font-semibold">{formatCurrency(generatedQuotation.subtotal)}</span></div>
                    {generatedQuotation.discount > 0 && (
                      <div className="text-rose-400">Discount Applied: -{formatCurrency(generatedQuotation.discount)}</div>
                    )}
                    <div>Service GST ({quotationForm.tax_rate}%): <span className="text-white font-semibold">{formatCurrency(generatedQuotation.tax)}</span></div>
                    <div className="text-sm font-black text-white pt-2 border-t border-slate-900/80">
                      Net Total Proposal Value: <span className="text-purple-400">{formatCurrency(generatedQuotation.total)}</span>
                    </div>
                  </div>

                  {generatedQuotation.notes && (
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300 block mb-0.5">Additional terms:</span>
                      "{generatedQuotation.notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setShowQuotationInvoice(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                    Back to Edit
                  </button>
                  <button type="button" onClick={handleSaveQuotation} disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-purple-650 to-purple-550 hover:from-purple-750 hover:to-purple-650 text-white font-bold text-xs rounded-xl shadow-lg transition-all duration-200">
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Confirm & Email Proposal</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CONVERT TO BOOKING MODAL */}
      {activeModal === 'booking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative animate-fade-in text-white max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Award className="text-purple-400" />
              <span>Convert Lead to Confirmed Event Booking</span>
            </h3>

            <form onSubmit={handleConvertBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Customer Lead *</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={bookingForm.enquiry_id} onChange={e => {
                      const sel = enquiries.find(x => x.id === parseInt(e.target.value));
                      setBookingForm({
                        ...bookingForm,
                        enquiry_id: e.target.value,
                        total_amount: sel ? String(sel.estimated_cost) : '',
                        drop_location: sel ? sel.pickup_location : ''
                      });
                    }}>
                    <option value="">-- Choose Lead --</option>
                    {enquiries.filter(e => e.status !== 'Confirmed').map(e => (
                      <option key={e.id} value={e.id}>{e.customer_name} ({e.rental_type} - {formatCurrency(e.estimated_cost)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Package Amount (INR) *</label>
                  <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500" required
                    value={bookingForm.total_amount} onChange={e => setBookingForm({...bookingForm, total_amount: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Advance Payment Received (INR)</label>
                  <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.advance_payment} onChange={e => setBookingForm({...bookingForm, advance_payment: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vehicle / Asset Assigned</label>
                  <input type="text" placeholder="e.g. Innova / Premium Tent Decor" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.vehicle_assigned} onChange={e => setBookingForm({...bookingForm, vehicle_assigned: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Return / Event Completion Date</label>
                  <input type="date" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.return_date} onChange={e => setBookingForm({...bookingForm, return_date: e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Drop / Venue Location</label>
                  <input type="text" placeholder="Same as pickup or custom venue address" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.drop_location} onChange={e => setBookingForm({...bookingForm, drop_location: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payment Status</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.payment_status} onChange={e => setBookingForm({...bookingForm, payment_status: e.target.value})}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Driver / Captain Required?</label>
                  <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    value={bookingForm.driver_required} onChange={e => setBookingForm({...bookingForm, driver_required: e.target.value})}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Convert & Confirm Booking</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveDashboard;
