import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        } else {
          setError('Order details could not be retrieved.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading order confirmation..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage
          title="Order Confirmation Notice"
          message={error || 'Could not find the specified order.'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      {/* Success banner card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Thank you for your purchase!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your order has been recorded in our system. We are preparing your items for delivery.
          </p>
        </div>

        {/* Order Identifier pill */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Order Number:</span>
          <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
            {order.orderNumber}
          </span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-600" />
          Ordered Items ({order.items.length})
        </h3>

        <div className="space-y-4 divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="truncate text-xs">
                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-slate-500 mt-0.5">
                    Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                  </p>
                  <p className="text-slate-400 mt-0.5">${item.finalPrice.toFixed(2)} each</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                ${item.lineTotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Breakdown Row */}
        <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">
              {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax</span>
            <span className="font-semibold text-slate-900">${order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Amount Paid / Due</span>
            <span className="text-brand-700 font-black">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Destination
            </div>
            <p className="font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600">{order.shippingAddress.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
              {order.shippingAddress.pincode}
            </p>
            <p className="text-slate-500 pt-1">Phone: {order.shippingAddress.mobile}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Payment Information
            </div>
            <p className="font-semibold text-slate-800">{order.paymentMethod}</p>
            <p className="text-slate-600">
              Payment Status:{' '}
              <span
                className={`font-bold ${
                  order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentDetails?.transactionId && (
              <p className="text-slate-400 font-mono text-[11px] pt-1">
                Ref: {order.paymentDetails.transactionId}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to={`/orders/${order._id}`}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition text-center shadow-md shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            Track Order Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/my-orders"
            className="py-3.5 px-6 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition text-center"
          >
            All My Orders
          </Link>
          <Link
            to="/products"
            className="py-3.5 px-6 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
