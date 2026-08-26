const Challenge = require('../models/Challenge');
const Proposal = require('../models/Proposal');
const User = require('../models/User');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Admin / Private
const getAdminStats = async (req, res) => {
  try {
    const [
      pending,
      open,
      underReview,
      inProgress,
      resolved,
      totalChallenges,
      totalProposals,
      totalUsers,
    ] = await Promise.all([
      Challenge.countDocuments({ status: 'Pending' }),
      Challenge.countDocuments({ status: 'Open' }),
      Challenge.countDocuments({ status: 'Under Review' }),
      Challenge.countDocuments({ status: 'In Progress' }),
      Challenge.countDocuments({ status: 'Resolved' }),
      Challenge.countDocuments({}),
      Proposal.countDocuments({}),
      User.countDocuments({}),
    ]);

    res.json({
      pending,
      open,
      underReview,
      inProgress,
      resolved,
      totalChallenges,
      totalProposals,
      totalUsers,
    });
  } catch (error) {
    console.error('Get Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching admin statistics' });
  }
};

module.exports = {
  getAdminStats,
};
