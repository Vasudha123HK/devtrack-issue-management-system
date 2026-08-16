const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');
const {
  getCommentsByIssue,
  addComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const {
  createIssueValidationRules,
  updateIssueValidationRules,
  createCommentValidationRules,
  handleValidationErrors,
} = require('../middleware/validateMiddleware');

router.use(protect); // All issue routes require authentication

// Issues CRUD
router
  .route('/')
  .get(getIssues)
  .post(createIssueValidationRules, handleValidationErrors, createIssue);

router
  .route('/:id')
  .get(getIssueById)
  .put(updateIssueValidationRules, handleValidationErrors, updateIssue)
  .delete(deleteIssue);

// Nested Issue Comments Routes
router
  .route('/:id/comments')
  .get(getCommentsByIssue)
  .post(createCommentValidationRules, handleValidationErrors, addComment);

module.exports = router;
