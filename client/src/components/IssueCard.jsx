import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate, getInitials } from '../utils/formatters';
import { MessageSquare, User, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const IssueCard = ({ issue, onDeleteClick }) => {
  const { user, isAdmin } = useAuth();
  const canEdit =
    isAdmin ||
    issue.createdBy?._id === user?._id ||
    issue.assignedTo?._id === user?._id;
  const canDelete = isAdmin || issue.createdBy?._id === user?._id;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <StatusBadge status={issue.status} size="xs" />
          <PriorityBadge priority={issue.priority} size="xs" />
        </div>

        <Link
          to={`/issues/${issue._id}`}
          className="block text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mt-1"
        >
          {issue.title}
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
          {issue.description}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          {issue.assignedTo ? (
            <div className="flex items-center space-x-1.5" title={`Assigned to ${issue.assignedTo.name}`}>
              <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] flex items-center justify-center border border-slate-200">
                {getInitials(issue.assignedTo.name)}
              </div>
              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">
                {issue.assignedTo.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic flex items-center">
              <User className="w-3 h-3 mr-0.5" />
              Unassigned
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {issue.commentCount > 0 && (
            <span className="flex items-center text-[11px] text-slate-400">
              <MessageSquare className="w-3 h-3 mr-0.5" />
              {issue.commentCount}
            </span>
          )}

          <div className="flex items-center space-x-1 pl-1 border-l border-slate-100">
            {canEdit && (
              <Link
                to={`/issues/${issue._id}/edit`}
                className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                title="Edit"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            )}
            {canDelete && onDeleteClick && (
              <button
                onClick={() => onDeleteClick(issue)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
