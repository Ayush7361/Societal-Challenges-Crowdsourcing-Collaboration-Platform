const mongoose = require('mongoose');

const GroundCheckSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verdict: {
    type: String,
    enum: ['Working', 'Improved', 'Unchanged', 'Worsened'],
    required: true,
  },
  observedMetric: {
    type: String,
    default: '',
    trim: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

GroundCheckSchema.index({ challenge: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('GroundCheck', GroundCheckSchema);
