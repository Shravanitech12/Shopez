import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-8 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-5 leading-relaxed">{message || 'Unable to complete request. Please verify connection and try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
