import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    error: 'bg-rose-50 border-rose-300 text-rose-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    info: 'bg-sky-50 border-sky-300 text-sky-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
  };

  return (
    <div
      className={`border rounded-xl p-4 mb-4 flex items-start justify-between shadow-sm transition-all ${
        styles[type] || styles.info
      }`}
    >
      <div className="flex items-start space-x-3">
        {icons[type] || icons.info}
        <span className="text-sm font-medium leading-5">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
