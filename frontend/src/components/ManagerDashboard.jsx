import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Layers, CheckCircle2, IndianRupee, TrendingUp, AlertTriangle,
  TrendingDown, FileText, PlusCircle, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Clock, BadgeAlert, PieChart as PieIcon,
  Check, X, Loader2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
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

const ManagerDashboard = ({ summary, charts, refreshData }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  // State for pending approvals to make them interactive
  const [approvals, setApprovals] = useState([
    { id: 1, ref: 'AP-901', client: 'Priya Reddy', type: 'Discount Waiver', detail: '15% discount on custom floral stage decor (Value: 18,500 INR)', exec: 'Rahul Sharma', date: 'Today, 10:15 AM', status: 'Pending' },
    { id: 2, ref: 'AP-902', client: 'Arjun Kumar', type: 'Permit Exception', detail: 'Outstation double driver charge waiver for corporate travel to Mysore', exec: 'Sanjay Kumar', date: 'Yesterday, 4:30 PM', status: 'Pending' },
    { id: 3, ref: 'AP-903', client: 'Robert Brown', type: 'Refund Request', detail: 'Booking cancel refund request of 5,000 INR deposit (Enquiry Cancelled)', exec: 'Pooja Patel', date: 'Jun 15, 2:15 PM', status: 'Pending' }
  ]);

  const revenueSummary = [
    { month: 'June (Current)', target: 2500000, actual: 70000, status: 'Needs Review', color: 'text-rose-400 font-bold bg-rose-950/40' },
    { month: 'May', target: 2200000, actual: 2450000, status: 'Achieved', color: 'text-emerald-400 font-bold bg-emerald-950/40' },
    { month: 'April', target: 2000000, actual: 1980000, status: 'Target Met', color: 'text-cyan-400 font-bold bg-cyan-950/40' }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);


  // Approval actions
  const handleApprove = (id, client, type) => {
    setApprovals(approvals.map(app => app.id === id ? { ...app, status: 'Approved' } : app));
    showToast(`Approved ${type} request for client ${client} successfully!`, 'success');
  };

  const handleDecline = (id, client, type) => {
    setApprovals(approvals.map(app => app.id === id ? { ...app, status: 'Declined' } : app));
    showToast(`Declined ${type} request for client ${client}.`, 'warning');
  };

  // Recharts custom colors matching premium design
  const CHART_COLORS = ['#A855F7', '#3B82F6', '#eab308', '#10B981', '#F43F5E', '#EC4899'];
  const PIE_COLORS = {
    'Confirmed': '#A855F7',
    'Pending': '#F59E0B',
    'Completed': '#3B82F6',
    'Cancelled': '#EF4444'
  };

  // Prepare Chart Mock Data
  const monthlyTrendData = charts?.monthlyTrend && charts.monthlyTrend.length > 0
    ? charts.monthlyTrend.map(item => {
      const rawName = item.name || item.month || 'Month';
      return {
        name: typeof rawName === 'string' ? rawName.split(' ')[0] : rawName,
        enquiries: item.enquiries !== undefined ? item.enquiries : (item.count || 0)
      };
    })
    : [
      { name: 'Jan', enquiries: 18 },
      { name: 'Feb', enquiries: 25 },
      { name: 'Mar', enquiries: 32 },
      { name: 'Apr', enquiries: 28 },
      { name: 'May', enquiries: 41 },
      { name: 'Jun', enquiries: 45 }
    ];

  const bookingStatusData = charts?.bookingStatus && charts.bookingStatus.length > 0
    ? charts.bookingStatus.map(item => ({ name: item.name, value: item.value }))
    : [
      { name: 'Confirmed', value: 12 },
      { name: 'Pending', value: 5 },
      { name: 'Completed', value: 8 },
      { name: 'Cancelled', value: 2 }
    ];

  const revenueGrowthData = [
    { month: 'Jan', revenue: 25000 },
    { month: 'Feb', revenue: 30000 },
    { month: 'Mar', revenue: 37000 },
    { month: 'Apr', revenue: 46000 },
    { month: 'May', revenue: 58000 },
    { month: 'Jun', revenue: 70000 }
  ];



  const rentalCategoryData = [
    { name: 'SUV Rentals', count: 25 },
    { name: 'Weddings', count: 18 },
    { name: 'Corporate Events', count: 12 },
    { name: 'Luxury Sedans', count: 9 },
    { name: 'Coaches/Vans', count: 6 }
  ];

  const leadSourceData = [
    { name: 'Website Portals', value: 35 },
    { name: 'WhatsApp CRM', value: 25 },
    { name: 'Phone Calls', value: 18 },
    { name: 'Social (IG/FB)', value: 12 },
    { name: 'Referral Net', value: 10 }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-slate-950 text-white rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Synchronizing manager panel...</p>
        </div>
      </div>
    );
  }

  // Calculate summaries
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div className="bg-slate-950 text-white min-h-[calc(100vh-100px)] rounded-3xl p-6 relative overflow-hidden border border-slate-900 shadow-2xl space-y-8 animate-fade-in font-sans">

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-900/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-650/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Header Profile Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-purple-400 text-slate-950 text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
              Branch Manager Panel
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-450 bg-clip-text text-transparent">
            Manager Business Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Overview of branch revenue growth and pending discount authorizations.
          </p>
        </div>

        {/* Global summary status banner */}
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-850 px-4 py-2 rounded-2xl backdrop-blur-md">
          <BadgeAlert className={`h-5 w-5 ${pendingApprovalsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold text-slate-450 block">Authorizations</span>
            <span className="text-xs font-bold text-white">{pendingApprovalsCount} pending approvals</span>
          </div>
        </div>
      </div>

      {/* KPI Dashboard Widgets */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* KPI 1: Active Enquiries */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Active Enquiries</span>
            <div className="p-2 rounded-xl bg-cyan-900/30 border border-cyan-800/40 text-cyan-400 group-hover:scale-105 transition-transform duration-200">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">16</h3>
            <p className="text-[9px] text-slate-450 mt-1">Negotiation / Followup</p>
          </div>
        </div>

        {/* KPI 2: Total Bookings */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-indigo-900/30 border border-indigo-800/40 text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">15</h3>
            <p className="text-[9px] text-slate-450 mt-1">Confirmed contracts</p>
          </div>
        </div>

        {/* KPI 3: Monthly Revenue */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Monthly Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800/45 text-emerald-400 group-hover:scale-105 transition-transform duration-200">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{formatCurrency(70000)}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Gross confirmed rental sales</p>
          </div>
        </div>

        {/* KPI 4: Pending Approvals */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl shadow-md transition-all duration-300 hover:border-purple-900/40 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-900/30 border border-amber-800/40 text-amber-400 group-hover:scale-105 transition-transform duration-200">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{pendingApprovalsCount}</h3>
            <p className="text-[9px] text-slate-450 mt-1">Waiver / Discount drafts</p>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Revenue Growth Trend */}
        <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl h-[330px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Revenue Growth Chart</h4>
              <p className="text-[10px] text-slate-450">Gross branch bookings sales (6 MoM)</p>
            </div>
            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +24% MoM
            </span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={tick => `${(tick / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Chart 3: Rental Category Distribution */}
        <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl h-[330px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Rental Category split</h4>
              <p className="text-[10px] text-slate-450">Active bookings by rental package type</p>
            </div>
            <span className="text-[10px] text-slate-450 font-medium">Categories: 5</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalCategoryData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Bookings count">
                  {rentalCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Lead Source Analysis */}
        <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl h-[330px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Lead acquisition sources</h4>
              <p className="text-[10px] text-slate-450">Conversion sources analysis</p>
            </div>
            <PieIcon className="h-4.5 w-4.5 text-purple-400" />
          </div>
          <div className="flex-1 min-h-[160px] flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-white">100%</span>
              <span className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">Marketing Mix</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] text-slate-400 text-center">
            {leadSourceData.map((entry, idx) => (
              <div key={entry.name} className="truncate">
                <span className="h-2 w-2 rounded-full inline-block mr-1" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                <span>{entry.name.split(' ')[0]}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals Panel */}
      <div className="relative z-10 bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl">
        <h3 className="text-sm font-black uppercase text-purple-400 border-b border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>Pending Approvals ({pendingApprovalsCount})</span>
        </h3>

        <div className="space-y-3.5">
          {approvals.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-semibold flex flex-col items-center justify-center gap-1.5">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <span>All corporate exception requests resolved.</span>
            </div>
          ) : (
            approvals.map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 bg-slate-950/30 ${app.status === 'Approved' ? 'border-emerald-900/50 bg-emerald-950/5' : app.status === 'Declined' ? 'border-rose-900/50 bg-rose-950/5' : 'border-slate-850'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-900/30 font-bold uppercase">{app.ref}</span>
                    <span className="text-xs font-bold text-white">{app.client} ({app.type})</span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${app.status === 'Approved' ? 'text-emerald-400 bg-emerald-950 border-emerald-900' : app.status === 'Declined' ? 'text-rose-400 bg-rose-950 border-rose-900' : 'text-amber-400 bg-amber-950 border-amber-900'}`}>{app.status}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{app.detail}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-450 font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {app.date}</span>
                    <span>•</span>
                    <span>Assigned Executive: <span className="text-slate-300">{app.exec}</span></span>
                  </div>
                </div>

                {app.status === 'Pending' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDecline(app.id, app.client, app.type)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/35 border border-rose-900/50 hover:border-rose-800 text-rose-400 rounded-lg text-xs transition-colors duration-150"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleApprove(app.id, app.client, app.type)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/35 border border-emerald-900/50 hover:border-emerald-800 text-emerald-400 rounded-lg text-xs transition-colors duration-150 font-bold"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Authorize</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Revenue Summary Panel */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Target MoM Table */}
        <div className="lg:col-span-2 bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">MoM Revenue summary</h4>
            <p className="text-[10px] text-slate-450">Branch targets vs actual closing amounts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold">
                  <th className="pb-2">Target Month</th>
                  <th className="pb-2 text-right">Target Amount</th>
                  <th className="pb-2 text-right">Actual Realized</th>
                  <th className="pb-2 text-right">Surplus / Balance</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-350">
                {revenueSummary.map((rev, index) => {
                  const balance = rev.actual - rev.target;
                  return (
                    <tr key={index} className="hover:bg-slate-950/40">
                      <td className="py-2.5 font-bold text-white">{rev.month}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(rev.target)}</td>
                      <td className="py-2.5 text-right font-bold text-white">{formatCurrency(rev.actual)}</td>
                      <td className={`py-2.5 text-right font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${rev.color}`}>
                          {rev.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business summary note card */}
        <div className="bg-slate-900/55 border border-slate-850 rounded-2xl p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Branch Performance review</h4>
            <p className="text-[10px] text-slate-450">Branch manager closing notes</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed font-medium space-y-2 mt-4">
            <p className="italic">
              "Outstanding month for branch sales. Executive Rahul Sharma has outperformed targets by 53%, driven by luxury wedding bookings. Rental SUV demand remains very high."
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Branch Goal: 40L target achieved!</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ManagerDashboard;
