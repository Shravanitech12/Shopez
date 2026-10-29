import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

const OrderTimeline = ({ status = 'Pending', trackingNumber }) => {
  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', icon: Check },
    { key: 'Processing', label: 'Processing', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">Order Cancelled</p>
          <p className="text-xs text-rose-600 mt-0.5">
            This order has been cancelled and any reserved stock returned to inventory.
          </p>
        </div>
      </div>
    );
  }

  const orderIndex = {
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Shipped: 3,
    'Out for Delivery': 3,
    Delivered: 4,
  };

  const currentIndex = orderIndex[status] !== undefined ? orderIndex[status] : 0;

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        {/* Active progress connector line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                  isCompleted
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-brand-700 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {trackingNumber && (
        <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Tracking Number:</span>
          <span className="font-mono font-bold text-brand-700 tracking-wider">
            {trackingNumber}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
