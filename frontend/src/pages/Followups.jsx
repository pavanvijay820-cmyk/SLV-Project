import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PhoneCall, 
  CheckSquare, 
  Calendar, 
  User, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Followups = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'upcoming', 'overdue', 'all'

  // Completion modal states
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/followups', {
        params: { type: activeTab }
      });
      if (response.data.success) {
        setFollowups(response.data.followups);
      } else {
        showToast('Failed to load follow-ups.', 'error');
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
      showToast('Error connecting to follow-up database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [activeTab]);

  const handleMarkCompleteClick = (f) => {
    setSelectedFollowup(f);
    setCompleteNotes(f.notes || '');
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setIsCompleting(true);
    try {
      const response = await axios.put(`/api/followups/${selectedFollowup.id}`, {
        status: 'Completed',
        notes: completeNotes
      });

      if (response.data.success) {
        showToast('Follow-up activity marked as Completed.', 'success');
        setSelectedFollowup(null);
        setCompleteNotes('');
        fetchFollowups();
      }
    } catch (err) {
      console.error('Complete followup error:', err);
      showToast('Failed to complete follow-up.', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'today', name: "Today's Calls", countColor: 'bg-amber-100 text-amber-800' },
    { id: 'upcoming', name: 'Upcoming Tasks', countColor: 'bg-brand-100 text-brand-800' },
    { id: 'overdue', name: 'Overdue items', countColor: 'bg-rose-100 text-rose-800' },
    { id: 'all', name: 'Archived / All', countColor: 'bg-slate-100 text-slate-800' }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Staff Agenda Board</p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Follow-ups</h1>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 px-5 font-bold text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 focus:outline-none ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-850 hover:border-slate-300'
            }`}
          >
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Main content list */}
      {isLoading ? (
        <div className="bg-white border border-slate-150 rounded-2xl py-20 flex flex-col items-center gap-3 justify-center shadow-sm">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Refreshing agenda list...</p>
        </div>
      ) : followups.length === 0 ? (
        <div className="bg-white border border-slate-150 rounded-2xl py-16 text-center max-w-sm mx-auto space-y-2.5 shadow-sm">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-md font-bold text-slate-700">All caught up!</h3>
          <p className="text-xs text-slate-400">No scheduled follow-up items under this category. To schedule a call, visit the customer enquiry detail profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followups.map((f) => (
            <div 
              key={f.id} 
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between ${
                activeTab === 'overdue' ? 'border-rose-150' : 'border-slate-150'
              }`}
            >
              {activeTab === 'overdue' && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white font-bold text-[8px] tracking-wider uppercase px-2.5 py-0.5 rounded-bl">
                  Overdue Alert
                </div>
              )}

              <div className="space-y-2">
                {/* Header details */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-850 text-md truncate max-w-[170px]" title={f.customer_name}>
                      {f.customer_name}
                    </h4>
                    <span className="text-xs text-brand-600 font-semibold">{f.event_type}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/enquiries/${f.enquiry_id}`)}
                    className="p-1 hover:bg-slate-150 rounded-lg text-slate-450 hover:text-slate-800 transition-colors"
                    title="View Customer Profile"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                {/* Info blocks */}
                <div className="space-y-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Call Scheduled: {formatDate(f.followup_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Assigned owner: {f.creator_name}</span>
                  </div>
                </div>

                {/* Agenda */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide mb-1">Agenda / Notes</span>
                  <p className="text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed italic bg-slate-50 border border-slate-100 rounded-xl p-3">
                    "{f.notes || 'No specific agenda description.'}"
                  </p>
                </div>
              </div>

              {/* Complete button */}
              {f.status === 'Planned' && (
                <button
                  onClick={() => handleMarkCompleteClick(f)}
                  className="w-full mt-4 btn-primary py-2 text-xs font-semibold"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Log Call Result</span>
                </button>
              )}

            </div>
          ))}
        </div>
      )}

      {/* --- COMPLETE FOLLOW-UP MODAL --- */}
      {selectedFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-150 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle className="h-4.5 w-4.5 text-brand-500" />
              <span>Complete Call: {selectedFollowup.customer_name}</span>
            </h3>
            
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="label-text">Log Discussion Result / Notes *</label>
                <textarea
                  rows={4}
                  placeholder="Record client details, menu adjustments, decor notes, or final quotes shared..."
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  className="input-field py-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFollowup(null)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="btn-primary py-2 text-xs"
                >
                  {isCompleting ? <Loader2 className="h-3 animate-spin" /> : <span>Log Completed</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Followups;
