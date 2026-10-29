import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-14 h-14 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } border-brand-200 border-t-brand-600 rounded-full animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
