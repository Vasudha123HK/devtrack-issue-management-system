const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

/**
 * @desc    Get all comments for a specific issue
 * @route   GET /api/issues/:id/comments
 * @access  Private
 */
const getCommentsByIssue = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const comments = await Comment.find({ issue: issueId })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to an issue
 * @route   POST /api/issues/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const { content } = req.body;

    // Verify issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const comment = await Comment.create({
      issue: issueId,
      author: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Author or Admin)
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Role check: Admin or the author of the comment
    const isAdmin = req.user.role === 'Admin';
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this comment',
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByIssue,
  addComment,
  deleteComment,
};
