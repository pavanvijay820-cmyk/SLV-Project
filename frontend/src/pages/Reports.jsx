import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Loader2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Reports = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly', 'revenue', 'bookings'
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/reports', {
        params: { report_type: reportType }
      });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        showToast('Failed to generate report data.', 'error');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('Error connecting to CRM reporting APIs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  // Export data to CSV
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      showToast('No data available to export.', 'warning');
      return;
    }

    try {
      // Get headers from first element keys
      const rawHeaders = Object.keys(reportData[0]);
      // Make headers readable
      const headers = rawHeaders.map(h => h.replace('_', ' ').toUpperCase());
      
      const csvRows = [];
      csvRows.push(headers.join(',')); // Add headers row

      for (const row of reportData) {
        const values = rawHeaders.map(header => {
          const val = row[header];
          // Escape quotes in values
          const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `slv_rentals_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('CSV downloaded successfully.', 'success');
    } catch (err) {
      console.error('CSV export failed:', err);
      showToast('Failed to export CSV.', 'error');
    }
  };

  // Trigger print view (configured in CSS print-only styles)
  const handlePrint = () => {
    if (reportData.length === 0) {
      showToast('No data available to print.', 'warning');
      return;
    }
    window.print();
  };

  const getReportTitle = () => {
    switch(reportType) {
      case 'daily': return "Today's New Leads Report";
      case 'weekly': return "Weekly Leads Acquisition Report";
      case 'monthly': return "Monthly Leads Conversion Report";
      case 'revenue': return "Gross Contract Revenue & Balances Statement";
      case 'bookings': return "Confirmed Car Rental Contracts Registry";
      default: return "Business Report";
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

  const reportOptions = [
    { id: 'daily', name: 'Daily Leads', desc: "New inquiries registered today", icon: <Calendar className="h-4 w-4" /> },
    { id: 'weekly', name: 'Weekly Leads', desc: "Inquiries registered last 7 days", icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'monthly', name: 'Monthly Leads', desc: "Inquiries registered last 30 days", icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'bookings', name: 'Bookings Registry', desc: "All confirmed bookings records", icon: <Briefcase className="h-4 w-4" /> },
    { id: 'revenue', name: 'Revenue Statement', desc: "Total invoices, paid, and balances", icon: <DollarSign className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6 p-1">
      
      {/* Title */}
      <div className="no-print">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">Business Auditing</p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reports Dashboard</h1>
      </div>

      {/* Reports Selector Row */}
      <div className="no-print grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {reportOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setReportType(opt.id)}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none ${
              reportType === opt.id
                ? 'bg-gradient-to-br from-brand-700 to-brand-600 text-white border-brand-500 shadow-md shadow-brand-100'
                : 'bg-white text-slate-700 border-slate-150'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 w-max mb-3 ${reportType === opt.id ? 'bg-brand-500/25 text-white border border-brand-400/20' : 'bg-brand-50 text-brand-600'}`}>
              {opt.icon}
            </div>
            <div>
              <span className="text-xs font-bold block leading-snug">{opt.name}</span>
              <span className={`text-[10px] block mt-0.5 leading-normal ${reportType === opt.id ? 'text-brand-100' : 'text-slate-400'}`}>{opt.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Report Panel */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-6">
        
        {/* Header inside Report Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{getReportTitle()}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Report generated on: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="no-print flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              disabled={isLoading || reportData.length === 0}
              className="btn-secondary py-2 px-3 text-xs w-full sm:w-auto font-semibold"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading || reportData.length === 0}
              className="btn-primary py-2 px-4.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Report Preview Tables */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 justify-center">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">Compiling data columns...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-2.5">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-md font-bold text-slate-700 font-sans">No records found</h3>
            <p className="text-xs text-slate-400">There are no matching entries logged in the database for this specific scope.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* 1. Leads Table (Daily, Weekly, Monthly) */}
            {['daily', 'weekly', 'monthly'].includes(reportType) && (
              <table className="w-full text-left border-collapse text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Enquiry ID</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Rental Type</th>
                    <th className="py-3.5 px-4">Pickup Date</th>
                    <th className="py-3.5 px-4 text-right">Estimated Cost</th>
                    <th className="py-3.5 px-4 text-center">Priority</th>
                    <th className="py-3.5 px-4">Assigned Owner</th>
                    <th className="py-3.5 px-4">Lead Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/20 font-medium">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{row.id}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{row.customer_name}</td>
                      <td className="py-3 px-4">{row.phone}</td>
                      <td className="py-3 px-4 font-semibold text-brand-700">{row.rental_type}</td>
                      <td className="py-3 px-4">{formatDate(row.pickup_date)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(row.estimated_cost)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          row.priority === 'Urgent' ? 'bg-rose-500 text-white' : row.priority === 'High' ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.staff_name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Bookings Table */}
            {reportType === 'bookings' && (
              <table className="w-full text-left border-collapse text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Booking Number</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Rental Type</th>
                    <th className="py-3.5 px-4">Pickup Date</th>
                    <th className="py-3.5 px-4">Pickup Location</th>
                    <th className="py-3.5 px-4">Vehicle Assigned</th>
                    <th className="py-3.5 px-4 text-right">Invoice Contract</th>
                    <th className="py-3.5 px-4">Staff Owner</th>
                    <th className="py-3.5 px-4">Contract Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.booking_number} className="hover:bg-slate-50/20 font-medium">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.booking_number}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{row.customer_name}</td>
                      <td className="py-3 px-4">{row.phone}</td>
                      <td className="py-3 px-4">{row.email || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-brand-700">{row.rental_type}</td>
                      <td className="py-3 px-4">{formatDate(row.pickup_date)}</td>
                      <td className="py-3 px-4 truncate max-w-[140px]" title={row.pickup_location}>{row.pickup_location}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.vehicle_assigned || 'Unassigned'}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-800">{formatCurrency(row.total_amount)}</td>
                      <td className="py-3 px-4 text-slate-650">{row.staff_name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. Revenue Statement Table */}
            {reportType === 'revenue' && (
              <table className="w-full text-left border-collapse text-sm text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice No.</th>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Rental Type</th>
                    <th className="py-3.5 px-4">Pickup Date</th>
                    <th className="py-3.5 px-4">Vehicle Assigned</th>
                    <th className="py-3.5 px-4 text-right">Contract Total</th>
                    <th className="py-3.5 px-4 text-right">Deposits Received</th>
                    <th className="py-3.5 px-4 text-right">Balance Outstanding</th>
                    <th className="py-3.5 px-4">Invoice Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.booking_number} className="hover:bg-slate-50/20 font-medium">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.booking_number}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{row.customer_name}</td>
                      <td className="py-3 px-4 font-semibold text-brand-700">{row.rental_type}</td>
                      <td className="py-3 px-4">{formatDate(row.pickup_date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.vehicle_assigned || 'Unassigned'}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-850">{formatCurrency(row.total_amount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-650">{formatCurrency(row.advance_payment)}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">{formatCurrency(row.balance)}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                  {/* Total Summary Row */}
                  <tr className="bg-slate-50/70 font-black border-t border-slate-200 text-slate-850">
                    <td className="py-4 px-4" colSpan={5}>TOTAL SUMMARY METRICS</td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(reportData.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0))}
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-700">
                      {formatCurrency(reportData.reduce((acc, curr) => acc + parseFloat(curr.advance_payment), 0))}
                    </td>
                    <td className="py-4 px-4 text-right text-rose-600">
                      {formatCurrency(reportData.reduce((acc, curr) => acc + parseFloat(curr.balance), 0))}
                    </td>
                    <td className="py-4 px-4"></td>
                  </tr>
                </tbody>
              </table>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
