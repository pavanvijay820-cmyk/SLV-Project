import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Save, RotateCcw, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const EnquiryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      rental_type: 'Self-Drive',
      pickup_date: '',
      pickup_location: '',
      estimated_cost: '',
      rental_days: '',
      lead_source: 'Website',
      notes: '',
      assigned_staff_id: ''
    }
  });

  // Fetch Staff list and Enquiry details (if edit mode)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {


        // Fetch enquiry details if in edit mode
        if (isEditMode) {
          const detailRes = await axios.get(`/api/enquiries/${id}`);
          if (detailRes.data.success) {
            const data = detailRes.data.enquiry;
            // Pre-fill inputs
            setValue('customer_name', data.customer_name);
            setValue('customer_phone', data.customer_phone);
            setValue('customer_email', data.customer_email || '');
            setValue('rental_type', data.rental_type);
            
            // Format date for input field (YYYY-MM-DD)
            const formattedDate = data.pickup_date ? new Date(data.pickup_date).toISOString().split('T')[0] : '';
            setValue('pickup_date', formattedDate);
            
            setValue('pickup_location', data.pickup_location);
            setValue('estimated_cost', parseFloat(data.estimated_cost));
            setValue('rental_days', data.rental_days);
            setValue('lead_source', data.lead_source);
            setValue('notes', data.notes || '');
            setValue('assigned_staff_id', data.assigned_staff_id || '');
          } else {
            showToast('Enquiry details not found.', 'error');
            navigate('/enquiries');
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        showToast('Error loading form options.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEditMode) {
        // Update enquiry
        const res = await axios.put(`/api/enquiries/${id}`, data);
        if (res.data.success) {
          showToast('Enquiry details updated successfully!', 'success');
          navigate(`/enquiries/${id}`);
        } else {
          showToast(res.data.message || 'Failed to update enquiry.', 'error');
        }
      } else {
        // Create enquiry
        const res = await axios.post('/api/enquiries', data);
        if (res.data.success) {
          showToast('Enquiry registered successfully! Priority calculated.', 'success');
          navigate('/enquiries');
        } else {
          showToast(res.data.message || 'Failed to create enquiry.', 'error');
        }
      }
    } catch (err) {
      console.error('Submit enquiry error:', err);
      const msg = err.response?.data?.message || 'Server error processing request.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all fields?')) {
      reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading enquiry editor...</p>
        </div>
      </div>
    );
  }

  const rentalTypes = ['Self-Drive', 'Chauffeur Drive', 'Outstation Tour', 'Local Package', 'Airport Transfer', 'Other'];
  const leadSources = ['Website', 'WhatsApp', 'Phone Call', 'Instagram', 'Facebook', 'Referral', 'Walk-in'];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-1">
      <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-150 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-inner">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{isEditMode ? 'Modify Lead Information' : 'Register New Lead Enquiry'}</h3>
            <p className="text-xs text-slate-400">Fill in accurate customer and rental requirements below.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Customer Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-2">Customer Profile</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
              <div>
                <label className="label-text">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className={`input-field ${errors.customer_name ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('customer_name', { required: 'Customer name is required' })}
                />
                {errors.customer_name && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.customer_name.message}</span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label-text">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  className={`input-field ${errors.customer_phone ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('customer_phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+() -]{10,15}$/,
                      message: 'Invalid phone format (10-15 digits)'
                    }
                  })}
                />
                {errors.customer_phone && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.customer_phone.message}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label-text">Email Address</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`input-field ${errors.customer_email ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('customer_email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.customer_email && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.customer_email.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Rental Section */}
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-2">Rental Requirements</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rental Type */}
              <div>
                <label className="label-text">Rental Category *</label>
                <select
                  className="select-field"
                  {...register('rental_type', { required: 'Rental type is required' })}
                >
                  {rentalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="label-text">Pickup Date *</label>
                <input
                  type="date"
                  className={`input-field ${errors.pickup_date ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('pickup_date', { required: 'Pickup date is required' })}
                />
                {errors.pickup_date && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.pickup_date.message}</span>
                )}
              </div>

              {/* Pickup Location */}
              <div className="md:col-span-2">
                <label className="label-text">Pickup / Delivery Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Airport Terminal 1, Hotel lobby, or specific street address"
                  className={`input-field ${errors.pickup_location ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('pickup_location', { required: 'Pickup location is required' })}
                />
                {errors.pickup_location && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.pickup_location.message}</span>
                )}
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="label-text">Estimated Cost (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  className={`input-field ${errors.estimated_cost ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('estimated_cost', { 
                    required: 'Estimated cost is required',
                    min: { value: 100, message: 'Minimum budget should be 100 INR' }
                  })}
                />
                {errors.estimated_cost && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.estimated_cost.message}</span>
                )}
              </div>

              {/* Rental Duration (Days) */}
              <div>
                <label className="label-text">Rental Duration (Days) *</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  className={`input-field ${errors.rental_days ? 'border-rose-400 ring-1 ring-rose-100' : ''}`}
                  {...register('rental_days', { 
                    required: 'Rental duration is required',
                    min: { value: 1, message: 'Must be at least 1 day' }
                  })}
                />
                {errors.rental_days && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 block">{errors.rental_days.message}</span>
                )}
              </div>

              {/* Lead Source */}
              <div>
                <label className="label-text">Lead Acquisition Source *</label>
                <select
                  className="select-field"
                  {...register('lead_source', { required: 'Lead source is required' })}
                >
                  {leadSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>


            </div>

            {/* Notes */}
            <div>
              <label className="label-text">Additional Notes / Specifications</label>
              <textarea
                rows={4}
                placeholder="Details like specific vehicle model preference (e.g., Porsche 911), GPS, baby seat, or chauffeur requirements..."
                className="input-field py-3 resize-y"
                {...register('notes')}
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/enquiries/${id}` : '/enquiries')}
              className="w-full sm:w-auto btn-secondary"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            {!isEditMode && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto btn-secondary"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear Fields</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto btn-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditMode ? 'Update Enquiry' : 'Submit Enquiry'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EnquiryForm;
