const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  estimatedCost: {
    type: String,
    required: true,
  },
  timeline: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Selected', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Proposal', ProposalSchema);
