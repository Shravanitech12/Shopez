import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search criteria or check back later.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm"
        >
          {actionLabel}
        </Link>
      )}
      {!actionLink && onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
