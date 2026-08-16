const User = require('../models/User');
const Issue = require('../models/Issue');

/**
 * @desc    Get all users (with role and issue counts)
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate assigned and created counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const assignedCount = await Issue.countDocuments({ assignedTo: user._id });
        const createdCount = await Issue.countDocuments({ createdBy: user._id });
        return {
          ...user.toJSON(),
          assignedIssuesCount: assignedCount,
          createdIssuesCount: createdCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const assignedIssues = await Issue.find({ assignedTo: user._id })
      .select('title status priority createdAt')
      .sort({ createdAt: -1 });

    const createdIssues = await Issue.find({ createdBy: user._id })
      .select('title status priority createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        assignedIssues,
        createdIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['Admin', 'Developer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either Admin or Developer',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
};
