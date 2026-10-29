import React from 'react';

const OrderStatusBadge = ({ status = 'Pending', size = 'md' }) => {
  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200/80',
    Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    Shipped: 'bg-purple-50 text-purple-700 border-purple-200/80',
    'Out for Delivery': 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Returned: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const dotStyles = {
    Pending: 'bg-amber-500',
    Confirmed: 'bg-blue-500',
    Processing: 'bg-indigo-500',
    Shipped: 'bg-purple-500',
    'Out for Delivery': 'bg-cyan-500',
    Delivered: 'bg-emerald-500',
    Cancelled: 'bg-rose-500',
    Returned: 'bg-slate-500',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border ${
        statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      } ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          dotStyles[status] || 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export default OrderStatusBadge;
