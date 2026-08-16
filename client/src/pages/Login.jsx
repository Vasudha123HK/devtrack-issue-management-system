import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(formData);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to sign in. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick-fill helper
  const fillDemoAccount = (role) => {
    if (role === 'Admin') {
      setFormData({
        email: 'admin@devtrack.io',
        password: 'Password123!',
      });
    } else {
      setFormData({
        email: 'alex@devtrack.io',
        password: 'Password123!',
      });
    }
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Enter your credentials to access the issue tracking system
        </p>
      </div>

      {/* Demo Credentials Quick Pill Box */}
      <div className="bg-brand-50/70 border border-brand-200/80 rounded-xl p-3">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-800 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Quick Demo Logins</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('Admin')}
            className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-white hover:bg-brand-100/50 border border-brand-200 rounded-lg shadow-2xs transition-colors text-center"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('Developer')}
            className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-white hover:bg-brand-100/50 border border-brand-200 rounded-lg shadow-2xs transition-colors text-center"
          >
            Developer Demo
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-start space-x-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
