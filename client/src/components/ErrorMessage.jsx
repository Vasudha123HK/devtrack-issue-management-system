import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 my-4 flex items-start space-x-3 text-rose-800 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
