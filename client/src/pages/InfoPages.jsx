import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle2, Truck, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
    <div className="text-center space-y-3">
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
        Our Story
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Modern Commerce, Engineered with Care
      </h1>
      <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
        SHOPEZ is a modern e-commerce destination providing premium footwear, menswear, womenswear, lifestyle electronics, and home goods.
      </p>
    </div>

    <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
      <p>
        Founded in 2026, SHOPEZ was designed to redefine modern web shopping. We prioritize seamless usability, transparent pricing, verified authenticity, and reliable global fulfillment.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose my-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <div className="text-3xl font-black text-brand-600 mb-1">100%</div>
          <div className="text-xs font-bold text-slate-900 uppercase">Authentic Goods</div>
          <p className="text-xs text-slate-400 mt-1">Directly sourced or partnered</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <div className="text-3xl font-black text-brand-600 mb-1">30 Days</div>
          <div className="text-xs font-bold text-slate-900 uppercase">Guaranteed Returns</div>
          <p className="text-xs text-slate-400 mt-1">Hassle-free return policy</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <div className="text-3xl font-black text-brand-600 mb-1">24 / 7</div>
          <div className="text-xs font-bold text-slate-900 uppercase">Customer Care</div>
          <p className="text-xs text-slate-400 mt-1">Ready to assist anytime</p>
        </div>
      </div>
    </div>
  </div>
);

export const Contact = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to our customer care team!', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
          Support Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact SHOPEZ Support
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Have an inquiry regarding an order, product sizing, or partnerships? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-brand-600" /> Headquarters
            </div>
            <p>100 Commerce Boulevard, Suite 500, New York, NY 10001</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Mail className="w-4 h-4 text-brand-600" /> Email Inquiries
            </div>
            <p>support@shopez.com</p>
            <p>orders@shopez.com</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Phone className="w-4 h-4 text-brand-600" /> Phone Support
            </div>
            <p>+1 (800) 555-0199 (Toll Free)</p>
            <p>Mon-Fri, 9am - 7pm EST</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                  placeholder="Alex Smith"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                placeholder="Inquiry regarding Order #..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                placeholder="How can we help you today?"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition shadow-xs text-xs"
            >
              Send Support Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Shipping = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Fulfillment</span>
      <h1 className="text-3xl font-extrabold text-slate-900">Shipping & Delivery Information</h1>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
      <h3 className="font-bold text-slate-900 text-base">Standard & Express Shipping Rules</h3>
      <p>
        Orders with a subtotal equal to or exceeding <strong>$500.00</strong> automatically qualify for complimentary Free Express Shipping at checkout. For orders under $500.00, a flat standard carrier fee of $50.00 is applied.
      </p>
      <h3 className="font-bold text-slate-900 text-base pt-4">Tracking Your Order</h3>
      <p>
        Upon order processing, administrators assign an individual courier tracking number. You can monitor your shipment directly from your <Link to="/my-orders" className="text-brand-600 font-bold hover:underline">My Orders</Link> dashboard.
      </p>
    </div>
  </div>
);

export const Returns = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Policy</span>
      <h1 className="text-3xl font-extrabold text-slate-900">Return & Refund Policy</h1>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
      <h3 className="font-bold text-slate-900 text-base">30-Day Hassle-Free Returns</h3>
      <p>
        If you are not completely satisfied with your purchase, you may initiate a return within 30 days of delivery. Items must be in their original packaging, unworn, and with tags attached.
      </p>
      <h3 className="font-bold text-slate-900 text-base pt-4">Order Cancellations</h3>
      <p>
        Orders that are in <em>Pending</em> or <em>Confirmed</em> status can be immediately cancelled by the customer from their order history, automatically releasing product inventory back to stock.
      </p>
    </div>
  </div>
);

export const Terms = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Legal</span>
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
      <p>
        Welcome to SHOPEZ. By accessing or using our website, services, and software, you agree to be bound by these Terms of Service.
      </p>
      <h3 className="font-bold text-slate-900 text-base pt-2">Pricing and Product Availability</h3>
      <p>
        All prices are calculated and strictly validated on our secure backend servers. We reserve the right to correct any errors in pricing or inventory availability.
      </p>
    </div>
  </div>
);

export const Privacy = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Privacy</span>
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
      <p>
        At SHOPEZ, your security and privacy are paramount. We utilize secure HTTP-only cookies, salted password hashing, and encrypted data channels.
      </p>
      <h3 className="font-bold text-slate-900 text-base pt-2">Cookie-Based Authentication</h3>
      <p>
        We store your authentication credentials inside secure, HTTP-only cookies protected from third-party client scripting and CSRF attacks.
      </p>
    </div>
  </div>
);
