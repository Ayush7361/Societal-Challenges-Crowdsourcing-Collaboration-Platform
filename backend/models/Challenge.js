const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Open', 'Under Review', 'In Progress', 'Resolved'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    default: '',
    trim: true,
  },
  district: {
    type: String,
    default: '',
    trim: true,
  },
  locality: {
    type: String,
    default: '',
    trim: true,
  },
  landmark: {
    type: String,
    default: '',
    trim: true,
  },
  pincode: {
    type: String,
    default: '',
    trim: true,
  },
  regionType: {
    type: String,
    enum: ['Urban', 'Rural', 'Tribal', 'Peri-urban'],
    default: 'Rural',
  },
  affectedWho: {
    type: String,
    default: '',
    trim: true,
  },
  localContext: {
    type: String,
    default: '',
    trim: true,
  },
  baselineMetric: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  affectedCount: {
    type: Number,
    default: 0,
  },
  evidence: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Pending', 'Open', 'Under Review', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  votesCount: {
    type: Number,
    default: 0,
  },
  mergedInto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    default: null,
  },
  mergedCount: {
    type: Number,
    default: 0,
  },
  selectedProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  outcomeClaimed: {
    type: Boolean,
    default: false,
  },
  claimedMetric: {
    type: String,
    default: '',
    trim: true,
  },
  claimedNote: {
    type: String,
    default: '',
    trim: true,
  },
  statusHistory: [StatusHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Challenge', ChallengeSchema);