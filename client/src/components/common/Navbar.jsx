import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
      {/* Top micro banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="hidden sm:block">
            ✨ Free express shipping on orders over <span className="text-white font-semibold">$500</span>
          </p>
          <div className="flex items-center gap-4 text-xs ml-auto">
            <span>24/7 Dedicated Support</span>
            <span className="text-slate-600">|</span>
            <Link to="/contact" className="hover:text-white transition">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                SHOPEZ<span className="text-brand-600">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-700">
            <Link to="/" className="hover:text-brand-600 transition">
              Home
            </Link>
            <Link to="/products" className="hover:text-brand-600 transition">
              Shop All
            </Link>
            <Link to="/products?category=mens-fashion" className="hover:text-brand-600 transition">
              Men
            </Link>
            <Link to="/products?category=womens-fashion" className="hover:text-brand-600 transition">
              Women
            </Link>
            <Link to="/products?category=electronics" className="hover:text-brand-600 transition">
              Electronics
            </Link>
            <Link to="/products?category=footwear" className="hover:text-brand-600 transition">
              Footwear
            </Link>
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-md relative"
          >
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-800 hover:bg-slate-100 transition text-sm font-semibold border border-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <div className="px-2 py-1.5">
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-brand-700 bg-brand-50 rounded-xl hover:bg-brand-100 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-600" />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          to="/my-orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition shadow-sm shadow-brand-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Shop All Catalog
            </Link>
            <Link
              to="/products?category=mens-fashion"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Men's Fashion
            </Link>
            <Link
              to="/products?category=womens-fashion"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Women's Fashion
            </Link>
            <Link
              to="/products?category=electronics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Electronics & Audio
            </Link>
            <Link
              to="/products?category=footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Footwear
            </Link>
          </nav>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
