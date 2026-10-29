import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-800">
      {/* Value props banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400 mt-0.5">Complimentary delivery over $500</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Secure Checkout</h4>
              <p className="text-xs text-slate-400 mt-0.5">256-bit encrypted transactions</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">30-Day Hassle Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant refunds & simple returns</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">24/7 Dedicated Care</h4>
              <p className="text-xs text-slate-400 mt-0.5">Expert customer advisors online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                SHOPEZ<span className="text-brand-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your curated destination for premium electronics, contemporary fashion, artisan footwear, and lifestyle essentials. Designed for discerning shoppers worldwide.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>100 Commerce Boulevard, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>support@shopez.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+1 (800) 555-0199</span>
              </div>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=mens-fashion" className="hover:text-white transition">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=womens-fashion" className="hover:text-white transition">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=footwear" className="hover:text-white transition">
                  Footwear & Sneakers
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-white transition">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Help & Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Account Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About SHOPEZ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 mt-3">
                  System Operational (v1.0.0)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-slate-800/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SHOPEZ E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Secured with SSL 256-bit encryption</span>
            <span>•</span>
            <span>Cash on Delivery & Online Cards Accepted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
