import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Crown, Mail, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: data.email
      });

      if (response.data.success) {
        showToast('Password reset link sent to your email.', 'success');
        // Optional: navigate to login after delay
      } else {
        showToast(response.data.message || 'Error sending password reset link.', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errMsg = error.response?.data?.message || 'Server error. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#070814] via-[#0b0c24] to-[#1a0e30] relative overflow-hidden px-4">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Forgot Password Card */}
      <div className="w-full max-w-md bg-[#0d0e25]/50 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative z-10 animate-fade-in transition-all duration-300 hover:border-white/15">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-4 transition-transform duration-300 hover:scale-105">
            <Crown className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent text-center">
            Reset Password
          </h1>
          <p className="text-slate-400 text-xs text-center mt-2.5 max-w-xs leading-relaxed">
            Enter your registered email address and we'll send you a link to reset your account password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                placeholder="Enter your email address"
                className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.email
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                  }`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs font-medium text-rose-455 mt-1 block animate-fade-in">{errors.email.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-655 hover:from-purple-500 hover:to-indigo-550 text-white font-semibold rounded-[14px] shadow-lg shadow-purple-950/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center select-none">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold hover:text-purple-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
