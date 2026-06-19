import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
      showToast('Welcome back to SLV Events CRM!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-900/50 mb-3">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">SLV Events</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">CRM & Booking Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Work Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="name@slvevents.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                  errors.email 
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-900/30'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs font-semibold text-rose-400 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Access Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                  errors.password 
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-900/30'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs font-semibold text-rose-400 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Remember me and Forgot password row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-slate-800 text-brand-600 bg-slate-950/80 focus:ring-brand-500 focus:ring-offset-slate-900 h-4 w-4 cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-xs text-slate-400 font-semibold">Remember Session</span>
            </label>
            <span className="text-xs text-slate-500 hover:text-brand-400 cursor-pointer transition-colors">
              Forgot Access Password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-900/20 transition-all duration-250 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Authentication...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Demo credentials tip */}
        <div className="mt-8 p-3.5 bg-slate-950/50 border border-slate-850 rounded-2xl text-[11px] text-slate-400 leading-normal">
          <p className="font-bold text-amber-500 mb-1 flex items-center gap-1">🔑 Demo Accounts Credentials:</p>
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            <div>Admin:</div>
            <div>admin@slvevents.com / admin123</div>
            <div>Executive:</div>
            <div>exec@slvevents.com / exec123</div>
            <div>Manager:</div>
            <div>manager@slvevents.com / manager123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
