const Challenge = require('../models/Challenge');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Citizen / Private
const createChallenge = async (req, res) => {
  try {
    const { title, description, location, category } = req.body;

    if (!title || !description || !location || !category) {
      return res.status(400).json({ message: 'Title, description, location, and category are required' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const initialStatus = 'Pending';
    const challenge = await Challenge.create({
      title,
      description,
      location,
      category,
      image: imagePath,
      status: initialStatus,
      createdBy: req.user._id,
      statusHistory: [
        {
          status: initialStatus,
          changedBy: req.user._id,
          changedAt: new Date(),
          note: 'Challenge reported by citizen',
        },
      ],
    });

    const populatedChallenge = await Challenge.findById(challenge._id).populate('createdBy', 'name email role organization');
    res.status(201).json(populatedChallenge);
  } catch (error) {
    console.error('Create Challenge Error:', error);
    res.status(500).json({ message: 'Server error creating challenge', error: error.message });
  }
};

// @desc    Get all challenges with optional filtering
// @route   GET /api/challenges
// @access  Public
const getChallenges = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    const challenges = await Challenge.find(filter)
      .populate('createdBy', 'name email role organization')
      .populate({
        path: 'selectedProposal',
        populate: { path: 'submittedBy', select: 'name organization email' },
      })
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Get Challenges Error:', error);
    res.status(500).json({ message: 'Server error fetching challenges' });
  }
};

// @desc    Get single challenge by ID
// @route   GET /api/challenges/:id
// @access  Public
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name email role organization')
      .populate({
        path: 'selectedProposal',
        populate: { path: 'submittedBy', select: 'name organization email' },
      })
      .populate('statusHistory.changedBy', 'name role organization');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Get Challenge By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching challenge details' });
  }
};

// @desc    Update challenge status (Admin)
// @route   PATCH /api/challenges/:id/status
// @access  Admin / Private
const updateChallengeStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = ['Pending', 'Open', 'Under Review', 'In Progress', 'Resolved'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    challenge.status = status;
    challenge.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status updated to ${status} by admin`,
    });

    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'name email role organization')
      .populate({
        path: 'selectedProposal',
        populate: { path: 'submittedBy', select: 'name organization email' },
      })
      .populate('statusHistory.changedBy', 'name role organization');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Update Challenge Status Error:', error);
    res.status(500).json({ message: 'Server error updating challenge status' });
  }
};

// @desc    Vote for a challenge (Citizen / Authenticated)
// @route   POST /api/challenges/:id/vote
// @access  Private
const voteChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ challenge: challengeId, user: userId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this challenge' });
    }

    try {
      await Vote.create({ challenge: challengeId, user: userId });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You have already voted for this challenge' });
      }
      throw err;
    }

    challenge.votesCount += 1;
    await challenge.save();

    res.json({ message: 'Vote recorded successfully', votesCount: challenge.votesCount });
  } catch (error) {
    console.error('Vote Error:', error);
    res.status(500).json({ message: 'Server error recording vote' });
  }
};

// @desc    Add comment to a challenge
// @route   POST /api/challenges/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const comment = await Comment.create({
      challenge: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name role organization');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Get comments for a challenge
// @route   GET /api/challenges/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ challenge: req.params.id })
      .populate('user', 'name role organization')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

// @desc    Get voting status for current user on challenge
// @route   GET /api/challenges/:id/hasVoted
// @access  Private
const checkHasVoted = async (req, res) => {
  try {
    const vote = await Vote.findOne({ challenge: req.params.id, user: req.user._id });
    res.json({ hasVoted: !!vote });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking vote status' });
  }
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallengeStatus,
  voteChallenge,
  addComment,
  getComments,
  checkHasVoted,
};
