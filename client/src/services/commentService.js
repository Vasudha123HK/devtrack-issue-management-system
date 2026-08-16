import api from './api';

export const commentService = {
  // Get comments for a specific issue
  getComments: async (issueId) => {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  // Add a new comment to an issue
  addComment: async (issueId, content) => {
    const response = await api.post(`/issues/${issueId}/comments`, { content });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};
