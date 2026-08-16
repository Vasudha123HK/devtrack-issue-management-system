import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { commentService } from '../services/commentService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CommentSection } from '../components/CommentSection';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDate, formatDateTime, getInitials } from '../utils/formatters';
import { PRIORITIES, STATUSES } from '../utils/constants';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronRight,
  Shield,
  Code,
} from 'lucide-react';

export const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [developers, setDevelopers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete issue modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status & Priority Quick Updater state
  const [updatingField, setUpdatingField] = useState(false);

  // Load Issue, Comments, and Developer users
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [issueRes, commentsRes, usersRes] = await Promise.all([
        issueService.getIssueById(id),
        commentService.getComments(id),
        userService.getUsers(),
      ]);

      if (issueRes.success && issueRes.data) {
        setIssue(issueRes.data);
      }
      if (commentsRes.success && commentsRes.data) {
        setComments(commentsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setDevelopers(usersRes.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load issue details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick field updates (Status, Priority, Assignee)
  const handleQuickUpdate = async (field, value) => {
    setUpdatingField(true);
    try {
      const payload = { [field]: value === '' ? null : value };
      const res = await issueService.updateIssue(id, payload);
      if (res.success && res.data) {
        setIssue(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setUpdatingField(false);
    }
  };

  // Add Comment
  const handleAddComment = async (content) => {
    setCommentSubmitting(true);
    try {
      const res = await commentService.addComment(id, content);
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await commentService.deleteComment(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Delete Issue
  const handleConfirmDeleteIssue = async () => {
    setIsDeleting(true);
    try {
      await issueService.deleteIssue(id);
      navigate('/issues');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching issue workspace details..." />;
  }

  if (error || !issue) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/issues')}
          className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Issues
        </button>
        <ErrorMessage
          message={error || 'Issue not found'}
          onRetry={loadData}
        />
      </div>
    );
  }

  const canEdit =
    isAdmin ||
    issue.createdBy?._id === user?._id ||
    issue.assignedTo?._id === user?._id;
  const canDelete = isAdmin || issue.createdBy?._id === user?._id;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb & Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link
            to="/issues"
            className="hover:text-brand-600 font-medium flex items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Issues
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-700">
            ISSUE-{issue._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link
              to={`/issues/${issue._id}/edit`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right Meta Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issue Content & Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Issue Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{issue._id.slice(-6).toUpperCase()}
                </span>
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {issue.title}
              </h1>
            </div>

            {/* Issue Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Description & Reproduction Steps
              </h3>
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {issue.description}
              </div>
            </div>
          </div>

          {/* Comment Thread Component */}
          <CommentSection
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            isSubmitting={commentSubmitting}
          />
        </div>

        {/* Right 1 Col: Metadata & Quick Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-20">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Issue Properties
            </h3>

            {/* Quick Status Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Current Status
              </label>
              <select
                value={issue.status}
                onChange={(e) => handleQuickUpdate('status', e.target.value)}
                disabled={updatingField}
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={STATUSES.OPEN}>Open</option>
                <option value={STATUSES.IN_PROGRESS}>In Progress</option>
                <option value={STATUSES.RESOLVED}>Resolved</option>
              </select>
            </div>

            {/* Quick Priority Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Priority Level
              </label>
              <select
                value={issue.priority}
                onChange={(e) => handleQuickUpdate('priority', e.target.value)}
                disabled={updatingField || !canEdit}
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
              >
                <option value={PRIORITIES.LOW}>Low</option>
                <option value={PRIORITIES.MEDIUM}>Medium</option>
                <option value={PRIORITIES.HIGH}>High</option>
              </select>
            </div>

            {/* Assignee Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Assigned Developer
              </label>
              <select
                value={issue.assignedTo?._id || ''}
                onChange={(e) => handleQuickUpdate('assignedTo', e.target.value)}
                disabled={updatingField || !canEdit}
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
              >
                <option value="">Unassigned</option>
                {developers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Metadata Info List */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              {/* Created By */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Reported By
                </span>
                <span className="font-semibold text-slate-800">
                  {issue.createdBy?.name || 'Unknown'}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Created On
                </span>
                <span className="text-slate-700 font-medium">
                  {formatDate(issue.createdAt)}
                </span>
              </div>

              {/* Updated Date */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Last Updated
                </span>
                <span className="text-slate-700 font-medium">
                  {formatDateTime(issue.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Issue Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete "${issue.title}"? All associated comments and activities will be removed.`}
        confirmText="Delete Issue"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
