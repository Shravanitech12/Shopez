import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  Truck,
  RotateCcw,
  XCircle,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderTimeline from '../components/orders/OrderTimeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useToast } from '../context/ToastContext';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation & Return modals
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returning, setReturning] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError('Order could not be loaded.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.post(`/orders/${order._id}/cancel`, {
        reason: 'Order cancelled by customer via details page',
      });
      if (res.success) {
        showToast('Order successfully cancelled and items returned to stock.', 'success');
        setCancelModalOpen(false);
        await fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnOrder = async () => {
    try {
      setReturning(true);
      const res = await api.post(`/orders/${order._id}/return`, {
        reason: 'Customer initiated return request',
      });
      if (res.success) {
        showToast('Return request recorded. Our courier will contact you.', 'success');
        setReturnModalOpen(false);
        await fetchOrder();
      }
    } catch (err) {
      showToast(err.message || 'Failed to request return.', 'error');
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage
          title="Order Not Found"
          message={error || 'Unable to access order.'}
          onRetry={() => navigate('/my-orders')}
        />
      </div>
    );
  }

  const isCancellable = ['Pending', 'Confirmed'].includes(order.status);
  const isReturnable = order.status === 'Delivered';
  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {orderDateFormatted}
          </p>
        </div>

        {/* Action Buttons: Cancel or Return */}
        <div className="flex items-center gap-3">
          {isCancellable && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}

          {isReturnable && (
            <button
              onClick={() => setReturnModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* Real-time Order Tracking Visual Progress Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Tracking Progress</h3>
        <OrderTimeline status={order.status} trackingNumber={order.trackingNumber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Ordered Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" />
            Items in this Shipment ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  <div className="truncate text-xs">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-bold text-slate-900 hover:text-brand-600 transition truncate block"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-3 text-slate-500 mt-1">
                      <span>Qty: {item.quantity}</span>
                      {item.size && (
                        <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                      )}
                      <span>Price: ${item.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold text-slate-900">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info Cards */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Payment Summary
            </h3>
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Savings</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900">
                {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax</span>
              <span className="font-semibold text-slate-900">${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-sm font-extrabold text-slate-900">
              <span>Grand Total</span>
              <span className="text-xl font-black text-brand-700">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Destination
            </div>
            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600">{order.shippingAddress.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
              {order.shippingAddress.pincode}
            </p>
            <p className="text-slate-500 pt-1">Phone: {order.shippingAddress.mobile}</p>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Payment Details
            </div>
            <p className="text-slate-700">
              Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-slate-700">
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
              <p className="text-slate-400 font-mono text-[11px]">
                Ref: {order.paymentDetails.transactionId}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${order.orderNumber}? The reserved items will be released back to the store inventory.`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* Return Confirmation Modal */}
      <ConfirmationModal
        isOpen={returnModalOpen}
        title="Request Return?"
        message={`Would you like to initiate a 30-day return for order #${order.orderNumber}? Our courier team will contact you for pickup scheduling.`}
        confirmText="Submit Return Request"
        loading={returning}
        onConfirm={handleReturnOrder}
        onCancel={() => setReturnModalOpen(false)}
      />
    </div>
  );
};

export default OrderDetails;
