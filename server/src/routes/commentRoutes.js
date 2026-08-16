const express = require('express');
const router = express.Router();
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All comment routes require authentication

router.delete('/:id', deleteComment);

module.exports = router;
