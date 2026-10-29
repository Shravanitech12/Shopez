import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Aggregating store performance metrics..." />;
  }

  const summary = stats?.summary || {
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${summary.totalRevenue.toLocaleString()}`,
      sub: 'From completed & paid orders',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders,
      sub: `${summary.pendingOrders} currently pending`,
      icon: ShoppingCart,
      color: 'bg-brand-500/10 text-brand-600',
    },
    {
      title: 'Active Customers',
      value: summary.totalCustomers,
      sub: 'Registered buyer accounts',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Products in Catalog',
      value: summary.totalProducts,
      sub: `Across ${summary.totalCategories} categories`,
      icon: Package,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  // Colors for Status Pie Chart
  const STATUS_COLORS = {
    Pending: '#f59e0b',
    Confirmed: '#3b82f6',
    Processing: '#6366f1',
    Shipped: '#8b5cf6',
    'Out for Delivery': '#06b6d4',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
  };

  const statusData = stats?.ordersByStatus || [];
  const salesTimeline = stats?.salesTimeline || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time business insights, sales trends, and fulfillment tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {card.value}
                </span>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Revenue Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-400">Order revenue over the past 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              Live Feed
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTimeline.length ? salesTimeline : [{ name: 'This Month', revenue: summary.totalRevenue }]}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#254ceb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#254ceb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#254ceb" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Orders by Status Doughnut */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Orders by Status</h3>
            <p className="text-xs text-slate-400">Distribution across fulfillment stages</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No order distribution data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest incoming transactions requiring processing</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stats?.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{ord.shippingAddress?.fullName || ord.userId?.name}</p>
                      <p className="text-[11px] text-slate-400">{ord.userId?.email}</p>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <OrderStatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
