import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      if (res.user.userType === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath, { replace: true });
      }
    } else {
      setErrorMessage(res.message || 'Login failed. Please verify credentials.');
    }
  };

  // Quick fill demo buttons
  const fillCustomer = () => {
    setIdentifier('customer@shopez.com');
    setPassword('Customer@12345');
    setErrorMessage('');
  };

  const fillAdmin = () => {
    setIdentifier('admin@shopez.com');
    setPassword('Admin@12345');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              SHOPEZ<span className="text-brand-600">.</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your orders, saved cart, and account settings
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="customer@shopez.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCustomer}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={fillAdmin}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
            >
              Fill Admin
            </button>
          </div>
        </div>

        {/* Register footer link */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
