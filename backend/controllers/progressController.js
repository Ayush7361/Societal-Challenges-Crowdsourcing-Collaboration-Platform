const ProgressUpdate = require('../models/ProgressUpdate');
const Challenge = require('../models/Challenge');
const Proposal = require('../models/Proposal');

// @desc    Post progress update with optional image
// @route   POST /api/challenges/:id/progress
// @access  Institution / Private
const postProgressUpdate = async (req, res) => {
  try {
    const { text, measuredMetric, isOutcomeClaim } = req.body;
    const challengeId = req.params.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Progress update text is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const selectedProposal = challenge.selectedProposal && await Proposal.findById(challenge.selectedProposal).select('submittedBy');
    if (!selectedProposal) {
      return res.status(400).json({ message: 'Progress can be posted only after an institution proposal is selected.' });
    }
    if (req.user.role !== 'admin' && String(selectedProposal.submittedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the institution with the selected proposal can post progress evidence.' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const claim = isOutcomeClaim === true || isOutcomeClaim === 'true';

    const progressUpdate = await ProgressUpdate.create({
      challenge: challengeId,
      postedBy: req.user._id,
      text: text.trim(),
      image: imagePath,
      measuredMetric: (measuredMetric || '').trim(),
      isOutcomeClaim: claim,
    });

    if (claim) {
      challenge.outcomeClaimed = true;
      challenge.claimedMetric = (measuredMetric || '').trim();
      challenge.claimedNote = text.trim();
      await challenge.save();
    }

    const populatedUpdate = await ProgressUpdate.findById(progressUpdate._id).populate('postedBy', 'name organization role email');
    res.status(201).json(populatedUpdate);
  } catch (error) {
    console.error('Post Progress Update Error:', error);
    res.status(500).json({ message: 'Server error posting progress update', error: error.message });
  }
};

// @desc    Get progress updates for a challenge
// @route   GET /api/challenges/:id/progress
// @access  Public
const getProgressUpdates = async (req, res) => {
  try {
    const updates = await ProgressUpdate.find({ challenge: req.params.id })
      .populate('postedBy', 'name organization role email')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (error) {
    console.error('Get Progress Updates Error:', error);
    res.status(500).json({ message: 'Server error fetching progress updates' });
  }
};

module.exports = {
  postProgressUpdate,
  getProgressUpdates,
};
