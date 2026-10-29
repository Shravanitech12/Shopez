import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';

const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, shippingFee, taxAmount, totalAmount, updateQuantity, removeFromCart, clearCart, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SHOPEZ10' || code === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, percent: 10 });
      setCouponDiscount(discount);
      showToast(`Coupon ${code} applied! Saved $${discount}`, 'success');
      setCouponCode('');
    } else if (code === 'SAVE20') {
      const discount = Math.round(subtotal * 0.2);
      setAppliedCoupon({ code, percent: 20 });
      setCouponDiscount(discount);
      showToast(`Coupon ${code} applied! Saved $${discount}`, 'success');
      setCouponCode('');
    } else {
      showToast('Invalid or expired coupon code. Try SHOPEZ10', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed', 'info');
  };

  const finalCartTotal = Math.max(0, totalAmount - couponDiscount);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please sign in or register to complete your order checkout', 'info');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any products to your cart yet. Explore our curated catalog for top deals."
          actionLabel="Start Exploring Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your selected items ({totalItems} item{totalItems > 1 ? 's' : ''})
          </p>
        </div>

        <button
          onClick={() => setClearModalOpen(true)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const lineTotal = item.finalPriceSnapshot * item.quantity;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-slate-300"
              >
                {/* Product thumbnail & basic info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
                  >
                    <img
                      src={item.imageSnapshot}
                      alt={item.titleSnapshot}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-bold text-slate-900 hover:text-brand-600 transition block truncate"
                      title={item.titleSnapshot}
                    >
                      {item.titleSnapshot}
                    </Link>

                    {item.size && (
                      <span className="inline-block mt-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Size: {item.size}
                      </span>
                    )}

                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        ${item.finalPriceSnapshot.toFixed(2)}
                      </span>
                      {item.discountSnapshot > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          ${item.priceSnapshot.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {/* Quantity selector */}
                  <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200/60 rounded-l-xl disabled:opacity-30 transition font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200/60 rounded-r-xl transition font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-base font-extrabold text-slate-900 block">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Order Summary
          </h3>

          {/* Coupon Code Input */}
          <div>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon (e.g. SHOPEZ10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-semibold"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {appliedCoupon.code} applied ({appliedCoupon.percent}% off)
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-rose-600 hover:underline text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Product Discounts</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-${couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                Shipping Fee
                {shippingFee === 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </span>
              <span className="font-semibold text-slate-900">
                {shippingFee === 0 ? '$0.00' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-base font-extrabold text-slate-900 block">Total Amount</span>
                <span className="text-[11px] text-slate-400">All taxes & fees included</span>
              </div>
              <span className="text-2xl font-black text-brand-700">
                ${finalCartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Trust badges */}
          <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Encrypted Checkout Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Complimentary fast doorstep delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Cart */}
      <ConfirmationModal
        isOpen={clearModalOpen}
        title="Empty Shopping Cart?"
        message="Are you sure you want to remove all items from your cart? This cannot be undone."
        confirmText="Empty Cart"
        isDanger={true}
        onConfirm={async () => {
          await clearCart();
          setClearModalOpen(false);
        }}
        onCancel={() => setClearModalOpen(false)}
      />
    </div>
  );
};

export default Cart;
