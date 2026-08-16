const Issue = require('../models/Issue');
const User = require('../models/User');

/**
 * @desc    Get aggregated dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Calculate core statistics from MongoDB
    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      highPriorityIssues,
      lowPriorityIssues,
      mediumPriorityIssues,
      totalUsers,
      totalDevelopers,
      myAssignedTotal,
      myAssignedOpen,
      myAssignedInProgress,
      myAssignedResolved,
      recentIssues,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Open' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.countDocuments({ priority: 'High' }),
      Issue.countDocuments({ priority: 'Low' }),
      Issue.countDocuments({ priority: 'Medium' }),
      User.countDocuments(),
      User.countDocuments({ role: 'Developer' }),
      Issue.countDocuments({ assignedTo: userId }),
      Issue.countDocuments({ assignedTo: userId, status: 'Open' }),
      Issue.countDocuments({ assignedTo: userId, status: 'In Progress' }),
      Issue.countDocuments({ assignedTo: userId, status: 'Resolved' }),
      Issue.find()
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Monthly issue creation trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIssues,
          openIssues,
          inProgressIssues,
          resolvedIssues,
          highPriorityIssues,
        },
        priorityDistribution: {
          Low: lowPriorityIssues,
          Medium: mediumPriorityIssues,
          High: highPriorityIssues,
        },
        statusDistribution: {
          Open: openIssues,
          'In Progress': inProgressIssues,
          Resolved: resolvedIssues,
        },
        teamStats: {
          totalUsers,
          totalDevelopers,
        },
        userStats: {
          myAssignedTotal,
          myAssignedOpen,
          myAssignedInProgress,
          myAssignedResolved,
        },
        recentIssues,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
