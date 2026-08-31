const mongoose = require('mongoose');

const ScopeRevisionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: [
      'Unforeseen Weather / Monsoon Damage',
      'Underground Utility / Structural Breakdown',
      'Material & Transport Price Surge',
      'Safety Hazard Expansion',
      'Other Technical Adaptation',
    ],
    required: true,
  },
  justification: {
    type: String,
    required: true,
  },
  originalCost: {
    type: String,
    required: true,
  },
  revisedCost: {
    type: String,
    required: true,
  },
  originalTimeline: {
    type: String,
    default: '',
  },
  revisedTimeline: {
    type: String,
    default: '',
  },
  evidenceImages: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ScopeRevision', ScopeRevisionSchema);
