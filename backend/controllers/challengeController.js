const Challenge = require('../models/Challenge');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const GroundCheck = require('../models/GroundCheck');

const VAGUE_LOCATION_RE = /^(india|here|nearby|local|my (area|village|city)|water shortage)$/i;

const composeLocation = ({ locality, landmark, district, state, pincode }) => {
  const parts = [landmark, locality, district, state, pincode].filter((p) => p && String(p).trim());
  return parts.join(', ');
};

const summarizeGroundChecks = async (challengeId) => {
  const checks = await GroundCheck.find({ challenge: challengeId }).populate('user', 'name role organization');
  const counts = { Working: 0, Improved: 0, Unchanged: 0, Worsened: 0 };
  checks.forEach((c) => {
    if (counts[c.verdict] !== undefined) counts[c.verdict] += 1;
  });
  const confirming = counts.Working + counts.Improved;
  return { checks, counts, confirming, total: checks.length };
};

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Citizen / Private
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      affectedCount,
      state,
      district,
      locality,
      landmark,
      pincode,
      latitude,
      longitude,
      regionType,
      affectedWho,
      localContext,
      baselineMetric,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    if (!state?.trim() || !district?.trim() || !locality?.trim()) {
      return res.status(400).json({
        message: 'Exact location is required: state, district, and village/ward (locality). A statement like “there is a water shortage” is not enough.',
      });
    }

    if (!affectedWho?.trim()) {
      return res.status(400).json({ message: 'Describe who is affected (households, school children, farmers, etc.)' });
    }

    if (!severity) {
      return res.status(400).json({ message: 'Severity is required' });
    }

    const composedLocation = composeLocation({ locality, landmark, district, state, pincode });
    if (VAGUE_LOCATION_RE.test(composedLocation.trim()) || composedLocation.trim().length < 8) {
      return res.status(400).json({ message: 'Location is too vague. Name the village/ward, district, and state.' });
    }

    let imagePath = '';
    if (req.files?.image?.[0]) {
      imagePath = `/uploads/${req.files.image[0].filename}`;
    }

    let evidencePaths = [];
    if (req.files?.evidence) {
      evidencePaths = req.files.evidence.map((f) => `/uploads/${f.filename}`);
    }

    if (!imagePath && evidencePaths.length === 0) {
      return res.status(400).json({ message: 'At least one photo of ground evidence is required' });
    }

    const initialStatus = 'Pending';
    const challenge = await Challenge.create({
      title,
      description,
      location: composedLocation,
      state: state.trim(),
      district: district.trim(),
      locality: locality.trim(),
      landmark: (landmark || '').trim(),
      pincode: (pincode || '').trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      regionType: regionType || 'Rural',
      affectedWho: affectedWho.trim(),
      localContext: (localContext || '').trim(),
      baselineMetric: (baselineMetric || '').trim(),
      category,
      image: imagePath,
      severity: severity || 'Medium',
      affectedCount: Number(affectedCount) || 0,
      evidence: evidencePaths,
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
    if (req.query.regionType) {
      filter.regionType = req.query.regionType;
    }
    if (req.query.state) {
      filter.state = new RegExp(`^${req.query.state}$`, 'i');
    }
    if (!req.query.createdBy && req.query.includeMerged !== 'true') {
      filter.mergedInto = null;
    }

    const challenges = await Challenge.find(filter)
      .populate('createdBy', 'name email role organization')
      .populate({
        path: 'selectedProposal',
        populate: { path: 'submittedBy', select: 'name organization email partnerType' },
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
        populate: { path: 'submittedBy', select: 'name organization email partnerType' },
      })
      .populate('statusHistory.changedBy', 'name role organization')
      .populate('mergedInto', 'title status');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const ground = await summarizeGroundChecks(req.params.id);

    res.json({
      ...challenge.toObject(),
      groundChecks: ground.checks,
      groundCheckCounts: ground.counts,
      groundConfirming: ground.confirming,
    });
  } catch (error) {
    console.error('Get Challenge By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching challenge details', error: error.message });
  }
};

// @desc    Update challenge status (Admin)
// @route   PATCH /api/challenges/:id/status
// @access  Admin / Private
const updateChallengeStatus = async (req, res) => {
  try {
    const { status, note, overrideWithoutGroundCheck } = req.body;
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
        populate: { path: 'submittedBy', select: 'name organization email partnerType' },
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
    res.status(500).json({ message: 'Server error adding comment', error: error.message });
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

// @desc    Citizen ground-check: did the solution actually work?
// @route   POST /api/challenges/:id/ground-check
// @access  Private (citizen)
const submitGroundCheck = async (req, res) => {
  try {
    const { verdict, note, observedMetric } = req.body;
    const allowed = ['Working', 'Improved', 'Unchanged', 'Worsened'];
    if (!allowed.includes(verdict)) {
      return res.status(400).json({ message: `Verdict must be one of: ${allowed.join(', ')}` });
    }

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!['In Progress', 'Resolved'].includes(challenge.status) && !challenge.outcomeClaimed) {
      return res.status(400).json({
        message: 'Ground-checks open once work is In Progress or an outcome has been claimed.',
      });
    }

    const check = await GroundCheck.findOneAndUpdate(
      { challenge: req.params.id, user: req.user._id },
      {
        verdict,
        note: (note || '').trim(),
        observedMetric: (observedMetric || '').trim(),
        createdAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', 'name role organization');

    const ground = await summarizeGroundChecks(req.params.id);
    res.status(201).json({ check, groundCheckCounts: ground.counts, groundConfirming: ground.confirming });
  } catch (error) {
    console.error('Ground Check Error:', error);
    res.status(500).json({ message: 'Server error submitting ground-check', error: error.message });
  }
};

const getGroundChecks = async (req, res) => {
  try {
    const ground = await summarizeGroundChecks(req.params.id);
    res.json(ground);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching ground-checks' });
  }
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'near', 'of', 'for', 'and', 'or', 'is', 'not',
  'to', 'from', 'with', 'this', 'that', 'issue', 'problem', 'challenge', 'working',
]);

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/streetlights?/g, 'street light')
    .replace(/handpumps?/g, 'hand pump')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

const titleOverlap = (a, b) => {
  const setA = new Set(tokenize(a));
  if (!setA.size) return 0;
  return tokenize(b).filter((w) => setA.has(w)).length;
};

const findSimilarChallenges = async (req, res) => {
  try {
    const { title, category, district, locality, excludeId } = req.query;
    if (!title || String(title).trim().length < 4) {
      return res.json([]);
    }

    const filter = { mergedInto: null };
    if (category) filter.category = category;
    if (excludeId) filter._id = { $ne: excludeId };

    const candidates = await Challenge.find(filter)
      .select('title location district locality landmark category status votesCount mergedCount regionType')
      .sort({ createdAt: -1 })
      .limit(80);

    const scored = candidates
      .map((c) => {
        const overlap = titleOverlap(title, c.title);
        const sameLocality =
          locality && c.locality && c.locality.trim().toLowerCase() === String(locality).trim().toLowerCase();
        const sameDistrict =
          district && c.district && c.district.trim().toLowerCase() === String(district).trim().toLowerCase();
        const score = overlap + (sameLocality ? 2 : 0) + (sameDistrict ? 1 : 0);
        return { ...c.toObject(), score, overlap };
      })
      .filter((c) => c.overlap >= 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(scored);
  } catch (error) {
    console.error('Find Similar Error:', error);
    res.status(500).json({ message: 'Server error finding similar challenges' });
  }
};

const mergeChallenges = async (req, res) => {
  try {
    const survivor = await Challenge.findById(req.params.id);
    const duplicate = await Challenge.findById(req.body.duplicateId);

    if (!survivor || !duplicate) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    if (String(survivor._id) === String(duplicate._id)) {
      return res.status(400).json({ message: 'Cannot merge a challenge into itself' });
    }
    if (survivor.mergedInto) {
      return res.status(400).json({ message: 'This challenge was already merged into another. Merge into the main report instead.' });
    }
    if (duplicate.mergedInto) {
      return res.status(400).json({ message: 'That report is already merged' });
    }

    duplicate.mergedInto = survivor._id;
    duplicate.statusHistory.push({
      status: duplicate.status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Merged into main report: ${survivor.title}`,
    });
    await duplicate.save();

    survivor.mergedCount = (survivor.mergedCount || 0) + 1 + (duplicate.mergedCount || 0);
    survivor.votesCount = (survivor.votesCount || 0) + (duplicate.votesCount || 0);
    if (duplicate.affectedCount) {
      survivor.affectedCount = (survivor.affectedCount || 0) + duplicate.affectedCount;
    }
    survivor.statusHistory.push({
      status: survivor.status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Merged duplicate report “${duplicate.title}” (votes carried over)`,
    });
    await survivor.save();

    const updated = await Challenge.findById(survivor._id).populate('createdBy', 'name email role organization');
    res.json({ message: 'Reports merged. Duplicate is hidden from the public feed.', challenge: updated });
  } catch (error) {
    console.error('Merge Error:', error);
    res.status(500).json({ message: 'Server error merging challenges' });
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
  submitGroundCheck,
  getGroundChecks,
  findSimilarChallenges,
  mergeChallenges,
};
