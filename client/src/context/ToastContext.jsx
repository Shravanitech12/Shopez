import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-600 text-white',
            error: 'bg-rose-600 text-white',
            warning: 'bg-amber-500 text-white',
            info: 'bg-brand-600 text-white',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
            info: <Info className="w-5 h-5 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg transition-all duration-300 transform translate-y-0 ${
                typeStyles[toast.type] || typeStyles.info
              }`}
            >
              <div className="flex items-center gap-2.5">
                {icons[toast.type] || icons.info}
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-80 hover:opacity-100 transition-opacity p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
