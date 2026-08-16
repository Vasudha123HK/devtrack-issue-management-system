const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All user routes require authentication

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', authorize('Admin'), updateUserRole);

module.exports = router;
