import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No issues found',
  description = 'Get started by creating a new issue or adjust your search filters.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300 my-4">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-500 shadow-inner">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">{description}</p>
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Link>
      )}
      {!actionLink && onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
