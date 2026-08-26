const express = require('express');
const router = express.Router();
const { selectProposal } = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/auth');

router.patch('/:id/select', protect, authorize('admin'), selectProposal);

module.exports = router;
