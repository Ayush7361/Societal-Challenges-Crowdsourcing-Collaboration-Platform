const Proposal = require('../models/Proposal');
const Challenge = require('../models/Challenge');

// @desc    Submit a proposal for a challenge
// @route   POST /api/challenges/:id/proposals
// @access  Institution / Private
const submitProposal = async (req, res) => {
  try {
    const { solution, estimatedCost, timeline, valueDrivers, csrTheme, localAdaptation, talentPlan } = req.body;
    const challengeId = req.params.id;

    if (!solution || !estimatedCost || !timeline) {
      return res.status(400).json({ message: 'Solution, estimated cost, and timeline are required' });
    }

    const drivers = Array.isArray(valueDrivers)
      ? valueDrivers
      : typeof valueDrivers === 'string'
        ? valueDrivers.split(',').map((d) => d.trim()).filter(Boolean)
        : [];

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Ensure financial/cost input carries (illustrative) tag
    let formattedCost = estimatedCost.trim();
    if (!formattedCost.toLowerCase().includes('illustrative')) {
      formattedCost = `${formattedCost} (illustrative)`;
    }

    const proposal = await Proposal.create({
      challenge: challengeId,
      submittedBy: req.user._id,
      solution: solution.trim(),
      estimatedCost: formattedCost,
      timeline: timeline.trim(),
      valueDrivers: drivers,
      csrTheme: (csrTheme || '').trim(),
      localAdaptation: (localAdaptation || '').trim(),
      talentPlan: (talentPlan || '').trim(),
      status: 'Pending',
    });

    // If challenge was Open, update status to Under Review if proposals are received
    if (challenge.status === 'Open') {
      challenge.status = 'Under Review';
      challenge.statusHistory.push({
        status: 'Under Review',
        changedBy: req.user._id,
        changedAt: new Date(),
        note: `Proposal submitted by ${req.user.organization || req.user.name}`,
      });
      await challenge.save();
    }

    const populatedProposal = await Proposal.findById(proposal._id).populate('submittedBy', 'name organization email role partnerType participationInterests');
    res.status(201).json(populatedProposal);
  } catch (error) {
    console.error('Submit Proposal Error:', error);
    res.status(500).json({ message: 'Server error submitting proposal', error: error.message });
  }
};

// @desc    Get proposals for a challenge
// @route   GET /api/challenges/:id/proposals
// @access  Private / Authenticated
const getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ challenge: req.params.id })
      .populate('submittedBy', 'name organization email role partnerType participationInterests')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Get Proposals Error:', error);
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
};

// @desc    Select a proposal for a challenge (Admin)
// @route   PATCH /api/proposals/:id/select
// @access  Admin / Private
const selectProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    const proposal = await Proposal.findById(proposalId).populate('submittedBy', 'name organization email');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const challenge = await Challenge.findById(proposal.challenge);
    if (!challenge) {
      return res.status(404).json({ message: 'Associated challenge not found' });
    }

    // Set this proposal status to Selected
    proposal.status = 'Selected';
    await proposal.save();

    // Reject other proposals for this challenge
    await Proposal.updateMany(
      { challenge: proposal.challenge, _id: { $ne: proposalId } },
      { $set: { status: 'Rejected' } }
    );

    // Update Challenge with selected proposal & change status to In Progress
    challenge.selectedProposal = proposal._id;
    challenge.status = 'In Progress';
    challenge.statusHistory.push({
      status: 'In Progress',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Admin selected proposal by ${proposal.submittedBy?.organization || proposal.submittedBy?.name || 'Institution'}. Implementation begins.`,
    });

    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'name email role organization')
      .populate({
        path: 'selectedProposal',
        populate: { path: 'submittedBy', select: 'name organization email' },
      })
      .populate('statusHistory.changedBy', 'name role organization');

    res.json({
      message: 'Proposal selected successfully and challenge status updated to In Progress',
      proposal,
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error('Select Proposal Error:', error);
    res.status(500).json({ message: 'Server error selecting proposal', error: error.message });
  }
};

module.exports = {
  submitProposal,
  getProposals,
  selectProposal,
};
