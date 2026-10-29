import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  X,
} from 'lucide-react';
import api from '../../services/api';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Status / Tracking Update Modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newTracking, setNewTracking] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter && paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      params.set('page', page);
      params.set('limit', 10);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setTotalPages(res.data.pages || 1);
        setTotalOrders(res.data.totalOrders || 0);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenUpdateModal = (ord) => {
    setOrderToUpdate(ord);
    setNewStatus(ord.status);
    setNewTracking(ord.trackingNumber || '');
    setNewPaymentStatus(ord.paymentStatus);
    setUpdateModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!orderToUpdate) return;

    try {
      setUpdating(true);
      const res = await api.patch(`/admin/orders/${orderToUpdate._id}/status`, {
        status: newStatus,
        trackingNumber: newTracking,
        paymentStatus: newPaymentStatus,
      });

      if (res.success) {
        showToast('Order fulfillment status updated successfully', 'success');
        setUpdateModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Order Fulfillment & Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming orders, transition statuses, and assign courier tracking ({totalOrders} total)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order #, Recipient Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-medium"
        >
          <option value="all">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-medium"
        >
          <option value="all">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Fetching customer orders..." />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">
            No orders match the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Tracking #</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {ord.shippingAddress?.fullName || ord.userId?.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {ord.shippingAddress?.mobile || ord.userId?.email}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded w-max ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                        <span className="text-[10px] text-slate-400">{ord.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {ord.trackingNumber || <span className="text-slate-300">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUpdateModal(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1"
                          title="Update Status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Status
                        </button>
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-600 text-white text-[11px] font-bold transition flex items-center gap-1"
                          title="Detailed View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* Quick Status & Tracking Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Order Status</h3>
                <p className="text-xs font-mono text-slate-500">#{orderToUpdate?.orderNumber}</p>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Order Fulfillment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-semibold"
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
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={newTracking}
                  onChange={(e) => setNewTracking(e.target.value)}
                  placeholder="e.g. TRK-983274619US"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold"
                >
                  {updating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
