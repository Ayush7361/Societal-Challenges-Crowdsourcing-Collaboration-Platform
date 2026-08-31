const ScopeRevision = require('../models/ScopeRevision');
const Challenge = require('../models/Challenge');
const Proposal = require('../models/Proposal');

/**
 * @desc    Submit a Scope & Budget Revision Request
 * @route   POST /api/challenges/:id/scope-revisions
 * @access  Institution / Admin (Private)
 */
const submitScopeRevision = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { reason, justification, revisedCost, revisedTimeline } = req.body;

    if (!reason || !justification || !revisedCost) {
      return res.status(400).json({ message: 'Reason, justification, and revised cost are required.' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.selectedProposal) {
      return res.status(400).json({ message: 'Cannot request scope revision: No selected proposal on this challenge.' });
    }

    const proposal = await Proposal.findById(challenge.selectedProposal);
    if (!proposal) {
      return res.status(404).json({ message: 'Selected proposal not found' });
    }

    // Process uploaded evidence files if any
    let evidenceImages = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        evidenceImages = req.files.map((f) => `/uploads/${f.filename}`);
      } else if (req.files.evidence) {
        evidenceImages = req.files.evidence.map((f) => `/uploads/${f.filename}`);
      }
    }

    let formattedCost = revisedCost.trim();
    if (!formattedCost.toLowerCase().includes('illustrative')) {
      formattedCost = `${formattedCost} (illustrative)`;
    }

    const scopeRevision = await ScopeRevision.create({
      challenge: challengeId,
      proposal: proposal._id,
      requestedBy: req.user._id,
      reason,
      justification: justification.trim(),
      originalCost: proposal.estimatedCost,
      revisedCost: formattedCost,
      originalTimeline: proposal.timeline,
      revisedTimeline: (revisedTimeline || proposal.timeline).trim(),
      evidenceImages,
      status: 'Pending',
    });

    // Add audit log note to challenge history
    challenge.statusHistory.push({
      status: challenge.status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: `Scope Revision Requested by ${req.user.organization || req.user.name}: Original ${proposal.estimatedCost} → Revised ${formattedCost} (${reason})`,
    });
    await challenge.save();

    const populated = await ScopeRevision.findById(scopeRevision._id)
      .populate('requestedBy', 'name organization email role')
      .populate('proposal');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Submit Scope Revision Error:', error);
    res.status(500).json({ message: 'Server error submitting scope revision request', error: error.message });
  }
};

/**
 * @desc    Get all Scope & Budget Revisions for a challenge
 * @route   GET /api/challenges/:id/scope-revisions
 * @access  Private / Authenticated
 */
const getScopeRevisions = async (req, res) => {
  try {
    const revisions = await ScopeRevision.find({ challenge: req.params.id })
      .populate('requestedBy', 'name organization email role')
      .populate('reviewedBy', 'name organization email role')
      .sort({ createdAt: -1 });

    res.json(revisions);
  } catch (error) {
    console.error('Get Scope Revisions Error:', error);
    res.status(500).json({ message: 'Server error fetching scope revisions' });
  }
};

/**
 * @desc    Review (Approve/Reject) a Scope Revision Request
 * @route   PATCH /api/scope-revisions/:id/review
 * @access  Admin (Private)
 */
const reviewScopeRevision = async (req, res) => {
  try {
    const revisionId = req.params.id;
    const { status, adminNote = '' } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const revision = await ScopeRevision.findById(revisionId);
    if (!revision) {
      return res.status(404).json({ message: 'Scope revision request not found' });
    }

    revision.status = status;
    revision.adminNote = adminNote.trim();
    revision.reviewedBy = req.user._id;
    revision.reviewedAt = new Date();
    await revision.save();

    const challenge = await Challenge.findById(revision.challenge);
    const proposal = await Proposal.findById(revision.proposal);

    if (status === 'Approved') {
      if (proposal) {
        proposal.estimatedCost = revision.revisedCost;
        if (revision.revisedTimeline) {
          proposal.timeline = revision.revisedTimeline;
        }
        await proposal.save();
      }

      if (challenge) {
        challenge.statusHistory.push({
          status: challenge.status,
          changedBy: req.user._id,
          changedAt: new Date(),
          note: `Scope Revision APPROVED by Admin: Updated Budget to ${revision.revisedCost}, Timeline to ${revision.revisedTimeline} (${revision.reason})`,
        });
        await challenge.save();
      }
    } else if (status === 'Rejected') {
      if (challenge) {
        challenge.statusHistory.push({
          status: challenge.status,
          changedBy: req.user._id,
          changedAt: new Date(),
          note: `Scope Revision REJECTED by Admin: Contract remains at ${revision.originalCost}. Note: ${adminNote || 'None'}`,
        });
        await challenge.save();
      }
    }

    const populated = await ScopeRevision.findById(revision._id)
      .populate('requestedBy', 'name organization email role')
      .populate('reviewedBy', 'name organization email role')
      .populate('proposal');

    res.json({
      message: `Scope revision request ${status.toLowerCase()} successfully`,
      revision: populated,
    });
  } catch (error) {
    console.error('Review Scope Revision Error:', error);
    res.status(500).json({ message: 'Server error reviewing scope revision', error: error.message });
  }
};

module.exports = {
  submitScopeRevision,
  getScopeRevisions,
  reviewScopeRevision,
};
