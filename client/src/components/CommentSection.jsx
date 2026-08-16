import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime, timeAgo, getInitials } from '../utils/formatters';
import { MessageSquare, Send, Trash2, Shield, Code, Loader2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const CommentSection = ({
  comments = [],
  onAddComment,
  onDeleteComment,
  isSubmitting = false,
}) => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onAddComment(content.trim());
    setContent('');
  };

  const openDeleteModal = (commentId) => {
    setSelectedCommentId(commentId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommentId) return;
    setIsDeleting(true);
    try {
      await onDeleteComment(selectedCommentId);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
      setSelectedCommentId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Discussion & Activity ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            No comments yet. Start the conversation below!
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author?._id === user?._id;
            const canDelete = isAdmin || isAuthor;

            return (
              <div
                key={comment._id}
                className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 transition-all hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200 flex-shrink-0 mt-0.5">
                  {getInitials(comment.author?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {comment.author?.name || 'Deleted User'}
                      </span>
                      <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {comment.author?.role === 'Admin' ? (
                          <Shield className="w-2.5 h-2.5 text-brand-600 mr-1 inline" />
                        ) : (
                          <Code className="w-2.5 h-2.5 text-slate-400 mr-1 inline" />
                        )}
                        {comment.author?.role || 'Developer'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className="text-xs text-slate-400"
                        title={formatDateTime(comment.createdAt)}
                      >
                        {timeAgo(comment.createdAt)}
                      </span>

                      {canDelete && (
                        <button
                          onClick={() => openDeleteModal(comment._id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100">
        <label htmlFor="comment" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Leave a comment
        </label>
        <div className="space-y-3">
          <textarea
            id="comment"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write an update, note a root cause, or link documentation..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Shift + Enter for new line
            </span>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Comment Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message="Are you sure you want to remove this comment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
