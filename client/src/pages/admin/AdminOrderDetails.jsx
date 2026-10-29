import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  User,
  ArrowLeft,
  Truck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderTimeline from '../../components/orders/OrderTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../context/ToastContext';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form updater states
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/orders/${id}`);
      if (res.success && res.data?.order) {
        const ord = res.data.order;
        setOrder(ord);
        setStatus(ord.status);
        setPaymentStatus(ord.paymentStatus);
        setTrackingNumber(ord.trackingNumber || '');
      } else {
        setError('Order could not be found.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.patch(`/admin/orders/${order._id}/status`, {
        status,
        paymentStatus,
        trackingNumber,
      });

      if (res.success) {
        showToast('Order fulfillment parameters updated successfully', 'success');
        fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Order Not Found"
          message={error || 'Unable to access order.'}
          onRetry={() => navigate('/admin/orders')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders List
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h2>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Created on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Delivery Step Tracker</h3>
        <OrderTimeline status={order.status} trackingNumber={order.trackingNumber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              Ordered Items ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-slate-500 mt-0.5">
                        Quantity: <strong>{item.quantity}</strong>{' '}
                        {item.size ? `• Size: ${item.size}` : ''}
                      </p>
                      <p className="text-slate-400 mt-0.5">${item.finalPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 text-sm flex-shrink-0">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Deductions</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Carrier Fee</span>
                <span className="font-bold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Assessment</span>
                <span className="font-bold text-slate-900">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-sm font-black text-slate-900">
                <span>Total Order Value</span>
                <span className="text-xl text-brand-700">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Action Form & Meta */}
        <div className="space-y-6">
          {/* Status Update Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Fulfillment Control
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="TRK-00000000"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {updating ? 'Saving Changes...' : 'Save Updates'}
              </button>
            </form>
          </div>

          {/* Customer Meta */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              Customer Information
            </h3>
            <p className="font-bold text-slate-900">{order.userId?.name || 'Guest/Unlinked'}</p>
            <p className="text-slate-600">{order.userId?.email}</p>
            <p className="text-slate-500">Phone: {order.shippingAddress?.mobile || order.userId?.mobile}</p>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Destination
            </h3>
            <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
