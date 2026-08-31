const mongoose = require('mongoose');

const ImageFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  contentType: {
    type: String,
    default: 'image/jpeg',
  },
  data: {
    type: Buffer,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ImageFile', ImageFileSchema);
