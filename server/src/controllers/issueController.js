const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const User = require('../models/User');

/**
 * @desc    Get all issues with searching, filtering, sorting, and pagination
 * @route   GET /api/issues
 * @access  Private
 */
const getIssues = async (req, res, next) => {
  try {
    const { search, status, priority, assignedTo, createdBy, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    const query = {};

    // 1. Search in title and description using case-insensitive regex
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // 2. Filter by Status
    if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) {
      query.status = status;
    }

    // 3. Filter by Priority
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query.priority = priority;
    }

    // 4. Filter by Assigned Developer (supports 'unassigned' or specific User ID)
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    // 5. Filter by Creator User ID
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with populate and sorting
    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get comment counts for each issue in parallel
    const issuesWithCommentCount = await Promise.all(
      issues.map(async (issue) => {
        const commentCount = await Comment.countDocuments({ issue: issue._id });
        return {
          ...issue.toObject(),
          commentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: issuesWithCommentCount.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: issuesWithCommentCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Private
 */
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const commentCount = await Comment.countDocuments({ issue: issue._id });

    res.status(200).json({
      success: true,
      data: {
        ...issue.toObject(),
        commentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new issue
 * @route   POST /api/issues
 * @access  Private
 */
const createIssue = async (req, res, next) => {
  try {
    const { title, description, priority = 'Medium', status = 'Open', assignedTo } = req.body;

    // Validate assignedTo user exists if provided
    let assignedUserId = null;
    if (assignedTo && assignedTo !== '') {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not exist',
        });
      }
      assignedUserId = assignedUser._id;
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignedTo: assignedUserId,
      createdBy: req.user._id,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing issue
 * @route   PUT /api/issues/:id
 * @access  Private
 */
const updateIssue = async (req, res, next) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const { title, description, priority, status, assignedTo } = req.body;

    // Role-based field permissions:
    // Admin can update everything.
    // Developer can update status freely, and update other fields if they created or are assigned to the issue.
    const isAdmin = req.user.role === 'Admin';
    const isCreator = issue.createdBy.toString() === req.user._id.toString();
    const isAssigned = issue.assignedTo && issue.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator && !isAssigned) {
      // If developer is not creator or assigned, they can still update status if permitted, or reject other field updates
      if (title || description || priority || (assignedTo !== undefined && assignedTo !== issue.assignedTo?.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this issue details. Only assigned developers, creators, or admins can edit it.',
        });
      }
    }

    // Apply updates
    if (title !== undefined) issue.title = title.trim();
    if (description !== undefined) issue.description = description.trim();
    if (priority !== undefined) issue.priority = priority;
    if (status !== undefined) issue.status = status;

    // Handle reassignment (Admin only or Creator)
    if (assignedTo !== undefined) {
      if (assignedTo === '' || assignedTo === null) {
        issue.assignedTo = null;
      } else {
        const userExists = await User.findById(assignedTo);
        if (!userExists) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user does not exist',
          });
        }
        issue.assignedTo = userExists._id;
      }
    }

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an issue
 * @route   DELETE /api/issues/:id
 * @access  Private (Admin or Creator)
 */
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Authorization: Admin or the user who created the issue
    const isAdmin = req.user.role === 'Admin';
    const isCreator = issue.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this issue',
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ issue: issue._id });

    // Delete issue
    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Issue and associated comments deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};
