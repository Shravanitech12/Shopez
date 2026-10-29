import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { items, subtotal, discountAmount, shippingFee, taxAmount, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    street: user?.address || '',
    city: '',
    state: '',
    pincode: user?.pincode || '',
    mobile: user?.mobile || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [onlineCardDetails, setOnlineCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '123',
    cardHolder: user?.name || 'Authorized Buyer',
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const savedAddresses = user?.savedAddresses || [];

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [savedAddresses]);

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500">
          You cannot proceed to checkout with an empty shopping cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition"
        >
          Browse Products Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    // Determine final shipping address
    let finalAddress;
    if (!useNewAddress && savedAddresses.length > 0) {
      const selected = savedAddresses[selectedAddressIndex];
      finalAddress = {
        fullName: selected.fullName,
        street: selected.street,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
        mobile: selected.mobile,
      };
    } else {
      if (
        !newAddress.fullName ||
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.pincode ||
        !newAddress.mobile
      ) {
        setOrderError('Please provide all shipping address fields.');
        return;
      }
      finalAddress = newAddress;
    }

    try {
      setSubmitting(true);

      const payload = {
        items: items.map((it) => ({
          productId: it.productId,
          size: it.size,
          quantity: it.quantity,
        })),
        shippingAddress: finalAddress,
        paymentMethod,
        paymentDetails:
          paymentMethod === 'Online Payment'
            ? {
                transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
                paidAt: new Date(),
              }
            : {},
      };

      const res = await api.post('/orders', payload);

      if (res.success && res.data?.order) {
        // Successfully placed order
        await clearCart();
        showToast('Your order has been placed successfully!', 'success');
        navigate(`/order-success/${res.data.order._id}`);
      } else {
        setOrderError(res.message || 'Failed to place order.');
      }
    } catch (err) {
      setOrderError(err.message || 'Order placement failed. Please verify stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Order Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your delivery details and choose your preferred payment option
        </p>
      </div>

      {orderError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery & Payment Options */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  {useNewAddress ? 'Select from Saved Addresses' : '+ Enter Different Address'}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {!useNewAddress && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                      selectedAddressIndex === idx
                        ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {addr.fullName}
                      </span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Phone: {addr.mobile}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* New / Manual Address Form */}
            {(useNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Recipient Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, fullName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={newAddress.mobile}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, mobile: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Street Address / Apartment <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Springfield"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State / Region <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Oregon"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Postal Code / PIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="97477"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, pincode: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-lg font-bold text-slate-900">Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cash on Delivery</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pay securely in cash or mobile transfer when your package arrives at your door.
                  </p>
                </div>
              </div>

              {/* Online Payment */}
              <div
                onClick={() => setPaymentMethod('Online Payment')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  paymentMethod === 'Online Payment'
                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Online Card Payment</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Instant secure card payment with automated server confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Card Simulation Details when Online Payment is selected */}
            {paymentMethod === 'Online Payment' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Card Simulation Information:</span>
                  <span className="text-emerald-600 font-bold">256-Bit SSL Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Mock Card Number
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {onlineCardDetails.cardNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Expiry Date & CVV
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {onlineCardDetails.expiry} (CVV: {onlineCardDetails.cvv})
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  * Note: In production, configure Razorpay or Stripe API keys in server environment variables.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Items Review
          </h3>

          {/* Mini items list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it._id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={it.imageSnapshot}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                  />
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{it.titleSnapshot}</p>
                    <p className="text-slate-400 text-[11px]">
                      Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  ${(it.finalPriceSnapshot * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Discount Savings</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-bold text-slate-900">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-brand-700">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Confirming Order...' : 'Confirm and Place Order'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified server-side inventory reservation</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
