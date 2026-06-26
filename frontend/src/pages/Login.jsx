import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Crown, KeyRound, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.email, data.password, data.rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      const userRole = result.user?.role || 'user';
      const roleDisplayName = userRole
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      showToast(`Welcome back, ${result.user?.name || 'User'}! Redirecting to ${roleDisplayName} Dashboard...`, 'success');
      navigate('/dashboard');
    } else {
      showToast('Invalid email or password.', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#070814] via-[#0b0c24] to-[#1a0e30] relative overflow-hidden px-4">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0d0e25]/50 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative z-10 animate-fade-in transition-all duration-300 hover:border-white/15">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-4 transition-transform duration-300 hover:scale-105">
            <Crown className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SLV Events
          </h1>
          <p className="text-slate-450 text-xs font-semibold uppercase tracking-widest mt-1.5 opacity-80">
            CRM & Booking Portal
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
                className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${
                  errors.email 
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                    : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                {...register('email', {
                  required: 'Email is required',
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

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Access Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full pl-11 pr-11 py-3.5 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${
                  errors.password 
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                    : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs font-medium text-rose-455 mt-1 block animate-fade-in">{errors.password.message}</span>
            )}
          </div>

          {/* Remember me and Forgot password row */}
          <div className="flex items-center justify-between pt-1 select-none">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-slate-800 text-purple-600 bg-slate-950/40 focus:ring-purple-500 focus:ring-offset-slate-950 h-4 w-4 cursor-pointer transition-colors"
                {...register('rememberMe')}
              />
              <span className="text-xs text-slate-455 font-semibold group-hover:text-slate-300 transition-colors">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-slate-455 hover:text-purple-400 cursor-pointer font-medium transition-colors">
              Forgot Password?
            </Link>
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="mt-8 text-center text-xs text-slate-455 select-none">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors pl-1">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
