import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ArrowRight, XCircle, ShoppingBag, Eye } from 'lucide-react';
import api from '../services/api';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useToast } from '../context/ToastContext';

const MyOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/my-orders?page=${page}&limit=8`);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setTotalPages(res.data.pages || 1);
        setTotalOrders(res.data.totalOrders || 0);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelConfirm = async () => {
    if (!selectedOrderToCancel) return;
    try {
      setCancelling(true);
      const res = await api.post(`/orders/${selectedOrderToCancel._id}/cancel`, {
        reason: 'Customer initiated order cancellation',
      });
      if (res.success) {
        showToast('Order successfully cancelled and inventory released.', 'success');
        setCancelModalOpen(false);
        setSelectedOrderToCancel(null);
        await fetchOrders();
      }
    } catch (err) {
      showToast(err.message || 'Unable to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, track real-time delivery status, and manage past purchases ({totalOrders} total)
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading your orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="You haven't placed any orders with SHOPEZ yet. Browse our collections and make your first purchase!"
          actionLabel="Explore Catalog"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCancellable = ['Pending', 'Confirmed'].includes(order.status);
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-card transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left Meta */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group"
                        title={it.title}
                      >
                        <img
                          src={it.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {it.quantity > 1 && (
                          <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] font-bold px-1 rounded-tl">
                            x{it.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    <span className="text-xs text-slate-500 pl-2">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Right Total & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancellable && (
                      <button
                        onClick={() => {
                          setSelectedOrderToCancel(order);
                          setCancelModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}

                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-brand-600 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Cancellation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${selectedOrderToCancel?.orderNumber}? Stock will be immediately restored to our catalog.`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedOrderToCancel(null);
        }}
      />
    </div>
  );
};

export default MyOrders;
