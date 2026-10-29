import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <span className="text-4xl font-black text-brand-600">404</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
