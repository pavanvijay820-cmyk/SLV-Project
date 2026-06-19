import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-96 pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-100';
          let textColor = 'text-slate-800';
          let icon = <Info className="text-blue-500 h-5 w-5 shrink-0" />;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-50';
            borderColor = 'border-emerald-200';
            textColor = 'text-emerald-950';
            icon = <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-50';
            borderColor = 'border-rose-200';
            textColor = 'text-rose-950';
            icon = <AlertCircle className="text-rose-500 h-5 w-5 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-50';
            borderColor = 'border-amber-200';
            textColor = 'text-amber-950';
            icon = <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} ${borderColor} ${textColor} pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 animate-fade-in`}
              role="alert"
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0.5"
              >
                <X className="h-4 w-4" />
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
