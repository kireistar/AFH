import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-100';
          let textColor = 'text-slate-800';
          let icon = <FiInfo className="text-blue-500 w-5 h-5" />;

          if (t.type === 'success') {
            bgColor = 'bg-emerald-50';
            borderColor = 'border-emerald-200';
            textColor = 'text-emerald-950';
            icon = <FiCheckCircle className="text-emerald-600 w-5 h-5 shrink-0" />;
          } else if (t.type === 'error') {
            bgColor = 'bg-rose-50';
            borderColor = 'border-rose-200';
            textColor = 'text-rose-950';
            icon = <FiXCircle className="text-rose-600 w-5 h-5 shrink-0" />;
          } else if (t.type === 'warning') {
            bgColor = 'bg-amber-50';
            borderColor = 'border-amber-200';
            textColor = 'text-amber-950';
            icon = <FiAlertTriangle className="text-amber-600 w-5 h-5 shrink-0" />;
          } else if (t.type === 'info') {
            bgColor = 'bg-blue-50';
            borderColor = 'border-blue-200';
            textColor = 'text-blue-950';
            icon = <FiInfo className="text-blue-600 w-5 h-5 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg ${bgColor} ${borderColor} ${textColor} transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right-8 fade-in`}
              role="alert"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon}
                <p className="text-sm font-semibold truncate-2-lines">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/55 transition-colors shrink-0"
              >
                <FiX className="w-4 h-4" />
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
