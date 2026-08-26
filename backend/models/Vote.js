const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only vote once per challenge
VoteSchema.index({ challenge: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
