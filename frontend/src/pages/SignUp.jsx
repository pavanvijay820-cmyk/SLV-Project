import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Crown, KeyRound, Mail, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordVal = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      });

      if (response.data.success) {
        showToast('Account created successfully! Please sign in.', 'success');
        navigate('/login');
      } else {
        showToast(response.data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.message || 'Server error. Please try again later.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#070814] via-[#0b0c24] to-[#1a0e30] relative overflow-y-auto py-12 px-4">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Register Card */}
      <div className="w-full max-w-lg bg-[#0d0e25]/50 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative z-10 animate-fade-in transition-all duration-300 hover:border-white/15 my-auto">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-4 transition-transform duration-300 hover:scale-105">
            <Crown className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-450 text-xs font-semibold uppercase tracking-widest mt-1.5 opacity-85">
            SLV Events CRM & Booking Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`w-full pl-11 pr-4 py-3 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.name
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                  }`}
                {...register('name', {
                  required: 'Full name is required'
                })}
              />
            </div>
            {errors.name && (
              <span className="text-xs font-medium text-rose-455 mt-1 block animate-fade-in">{errors.name.message}</span>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
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
                className={`w-full pl-11 pr-4 py-3 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.email
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

          {/* Phone Number field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className={`w-full pl-11 pr-4 py-3 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.phone
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                  }`}
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\s-]{10,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />
            </div>
            {errors.phone && (
              <span className="text-xs font-medium text-rose-455 mt-1 block animate-fade-in">{errors.phone.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Password (min 8 chars)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className={`w-full pl-11 pr-11 py-3 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.password
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

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`w-full pl-11 pr-11 py-3 bg-slate-950/40 border rounded-[14px] text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 hover:border-slate-700/80 ${errors.confirmPassword
                  ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-800/80 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                  }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordVal || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-xs font-medium text-rose-455 mt-1 block animate-fade-in">{errors.confirmPassword.message}</span>
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
                <span>Registering Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-450 select-none">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors pl-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
