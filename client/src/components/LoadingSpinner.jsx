import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-brand-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-4 px-6 flex items-center justify-between space-x-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/8"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-16"></div>
      <div className="h-3 bg-slate-100 rounded w-32"></div>
    </div>
  );
};
