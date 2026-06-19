import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FileText, User, Activity, Settings, Shield, Award, Mail, Phone,
  Clock, Database, Plus, CheckCircle, Edit, Trash2, ArrowUpRight, TrendingUp,
  MapPin, HelpCircle, Key, RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const PlaceholderPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const { showToast } = useToast();
  const { user } = useAuth();

  const [savingSettings, setSavingSettings] = useState(false);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Render Quotations View
  const renderQuotations = () => {
    const quotes = [
      { id: 'Q-4921', client: 'Priya Reddy', date: 'Jun 17, 2026', total: 104500, status: 'Draft Sent' },
      { id: 'Q-4819', client: 'Jane Smith', date: 'Jun 15, 2026', total: 78000, status: 'Accepted' },
      { id: 'Q-4720', client: 'Robert Brown', date: 'Jun 10, 2026', total: 48000, status: 'Expired' },
      { id: 'Q-4612', client: 'Alice Davis', date: 'Jun 05, 2026', total: 60000, status: 'Accepted' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white">Event Quotations proposals</h1>
            <p className="text-xs text-slate-400">Track and manage custom price proposals sent to client leads</p>
          </div>
          <button 
            onClick={() => showToast('Redirecting to dashboard to generate quotation.', 'info')}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-650 text-white font-bold text-xs rounded-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Proposal</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-500 uppercase font-bold">
                <th className="py-4 px-6">Proposal Ref</th>
                <th className="py-4 px-4">Client Name</th>
                <th className="py-4 px-4">Sent Date</th>
                <th className="py-4 px-4 text-right">Quote Value</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-950/40">
                  <td className="py-4 px-6 font-bold text-purple-400">{q.id}</td>
                  <td className="py-4 px-4 font-semibold text-white">{q.client}</td>
                  <td className="py-4 px-4">{q.date}</td>
                  <td className="py-4 px-4 text-right font-bold text-white">{formatCurrency(q.total)}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${q.status === 'Accepted' ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900' : q.status === 'Draft Sent' ? 'text-amber-400 bg-amber-950/50 border-amber-900' : 'text-slate-400 bg-slate-950/50 border-slate-800'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => showToast(`Resent proposal ${q.id} to client email.`, 'success')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700/60 transition-colors"
                    >
                      Resend Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Profile View
  const renderProfile = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Executive Profile Workspace</h1>
          <p className="text-xs text-slate-400">Manage personal CRM metrics, credentials, and performance records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-20 w-20 rounded-full bg-purple-900/40 border-2 border-purple-500 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-950/30">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{user?.name}</h3>
                <span className="text-[10px] bg-purple-900/50 border border-purple-800/40 text-purple-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Sales Executive
                </span>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-slate-850 pt-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> <span>{user?.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /> <span>+91 98765 43210</span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" /> <span>Shift: General (9:00 AM - 6:00 PM)</span></div>
              <div className="flex items-center gap-2"><Database className="h-4 w-4 text-slate-500" /> <span>Branch: Bangalore Head Office</span></div>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-850 pb-2">Sales Target Tracker</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Target Bookings</span>
                <h3 className="text-xl font-black text-white mt-1">10 Bookings</h3>
                <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">70% target achieved</span>
              </div>
              
              <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Target Revenue</span>
                <h3 className="text-xl font-black text-white mt-1">20,00,000 INR</h3>
                <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">92% target achieved</span>
              </div>

              <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Avg Lead Response</span>
                <h3 className="text-xl font-black text-white mt-1">45 mins</h3>
                <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-[9px] text-emerald-400 mt-1 block">Excellent Response Index</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-4">
              <Award className="h-10 w-10 text-amber-500 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Elite Star Circle Badge</h5>
                <p className="text-xs text-slate-400">Awarded for achieving over 18 Lakhs revenue target for 2 consecutive months.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Render Analytics View
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Business Intelligence Reports</h1>
          <p className="text-xs text-slate-400">Deep-dive analytical charts on client conversions, geographical load, and sales trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-black uppercase text-purple-400">Peak Booking Seasons</h3>
            <p className="text-xs text-slate-300">August to October shows the highest booking concentration (55% of yearly sales) driven by festive corporate contracts and marriage decor assignments.</p>
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-450 block uppercase text-[9px] font-bold">Primary Target Season</span>
                <span className="font-bold text-white">Festive Wedding Season (Aug-Dec)</span>
              </div>
              <ArrowUpRight className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          {/* Box 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-black uppercase text-purple-400">Geographical Booking Density</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-850 pb-1.5"><span>Indiranagar & East Bangalore</span> <span className="font-bold text-white">42%</span></div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5"><span>Whitefield & IT Belt</span> <span className="font-bold text-white">28%</span></div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5"><span>South Bangalore (Jayanagar/JP Nagar)</span> <span className="font-bold text-white">20%</span></div>
              <div className="flex justify-between"><span>Outstation / Airport Terminal pick-ups</span> <span className="font-bold text-white">10%</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Settings View
  const renderSettings = () => {
    const handleSave = (e) => {
      e.preventDefault();
      setSavingSettings(true);
      setTimeout(() => {
        setSavingSettings(false);
        showToast('Enterprise configurations updated successfully!', 'success');
      }, 800);
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">System Configurations & settings</h1>
          <p className="text-xs text-slate-400">Configure CRM access privileges, backup triggers, and AI Rule Engine priority filters</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg max-w-2xl">
          <form onSubmit={handleSave} className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <Key className="h-4 w-4" />
              <span>AI Lead Prioritization Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">High Priority Budget Threshold (INR)</label>
                <input type="number" defaultValue="5000000" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Urgent Timeline Threshold (Days)</label>
                <input type="number" defaultValue="30" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-850 pb-2 flex items-center gap-1.5 pt-4">
              <Database className="h-4 w-4" />
              <span>Database Backups & security</span>
            </h4>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 text-purple-650 bg-slate-950 focus:ring-purple-500 h-4 w-4" />
                <span className="text-xs text-slate-300 font-semibold">Automatic daily backup replication at 02:00 AM</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 text-purple-650 bg-slate-950 focus:ring-purple-500 h-4 w-4" />
                <span className="text-xs text-slate-300 font-semibold">Enable multi-factor OAuth verification for administrators</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-850 mt-6">
              <button type="submit" disabled={savingSettings} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-650 text-white font-bold text-xs rounded-xl shadow-lg transition-all duration-200">
                {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <span>Save Changes</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getPageContent = () => {
    switch (path) {
      case '/quotations':
        return renderQuotations();
      case '/profile':
        return renderProfile();

      case '/analytics':
        return renderAnalytics();
      case '/settings':
        return renderSettings();
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white">Resource not found</h2>
            <p className="text-slate-400 text-sm mt-1">The requested URL is not routed yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-[calc(100vh-100px)] rounded-3xl p-6 relative overflow-hidden border border-slate-900 shadow-2xl animate-fade-in font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-900/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="relative z-10">
        {getPageContent()}
      </div>
    </div>
  );
};

export default PlaceholderPage;
