import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image,
  ShoppingCart,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Banners', href: '/admin/banners', icon: Image },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/users', icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">SHOPEZ</span>
              <span className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user / quick links */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800/40 hover:text-white hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-brand-400" />
              Live Storefront
            </span>
            <span className="text-[10px] uppercase bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
              New Tab
            </span>
          </Link>

          <div className="pt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Store
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">Admin Mode</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
