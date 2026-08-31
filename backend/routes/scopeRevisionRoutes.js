const express = require('express');
const router = express.Router();
const {
  submitScopeRevision,
  getScopeRevisions,
  reviewScopeRevision,
} = require('../controllers/scopeRevisionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Review endpoint for Admins
router.patch('/:id/review', protect, authorize('admin'), reviewScopeRevision);

module.exports = router;
