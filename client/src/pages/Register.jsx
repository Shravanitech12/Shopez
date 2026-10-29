import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Lock, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.mobile ||
      !formData.password
    ) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
    });
    setLoading(false);

    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(res.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl space-y-6">
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
            Create Customer Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join SHOPEZ to track orders, save favorite items, and checkout faster
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Street Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  placeholder="742 Evergreen Terrace"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Postal Code / PIN
              </label>
              <input
                type="text"
                name="pincode"
                placeholder="97477"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login footer link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
