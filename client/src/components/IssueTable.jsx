import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate, getInitials } from '../utils/formatters';
import { Eye, Edit3, Trash2, MessageSquare, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const IssueTable = ({ issues = [], onDeleteClick }) => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th scope="col" className="py-3.5 pl-6 pr-3">
              Issue
            </th>
            <th scope="col" className="px-3 py-3.5">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5">
              Priority
            </th>
            <th scope="col" className="px-3 py-3.5">
              Assignee
            </th>
            <th scope="col" className="px-3 py-3.5">
              Created
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {issues.map((issue) => {
            const canEdit =
              isAdmin ||
              issue.createdBy?._id === user?._id ||
              issue.assignedTo?._id === user?._id;
            const canDelete = isAdmin || issue.createdBy?._id === user?._id;

            return (
              <tr
                key={issue._id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Title & Description */}
                <td className="py-4 pl-6 pr-3 max-w-xs md:max-w-md">
                  <div className="flex items-start space-x-2">
                    <div>
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors line-clamp-1 group-hover:text-brand-600"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {issue.description}
                      </p>
                      {issue.commentCount > 0 && (
                        <div className="flex items-center text-[11px] text-slate-400 mt-1">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>{issue.commentCount} comments</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="whitespace-nowrap px-3 py-4">
                  <StatusBadge status={issue.status} />
                </td>

                {/* Priority Badge */}
                <td className="whitespace-nowrap px-3 py-4">
                  <PriorityBadge priority={issue.priority} />
                </td>

                {/* Assigned Developer */}
                <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                  {issue.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-200">
                        {getInitials(issue.assignedTo.name)}
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {issue.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center text-xs text-slate-400 italic">
                      <UserIcon className="w-3.5 h-3.5 mr-1" />
                      Unassigned
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                  {formatDate(issue.createdAt)}
                </td>

                {/* Action Buttons */}
                <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Link
                      to={`/issues/${issue._id}`}
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canEdit && (
                      <Link
                        to={`/issues/${issue._id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Issue"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    )}

                    {canDelete && onDeleteClick && (
                      <button
                        onClick={() => onDeleteClick(issue)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Issue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
