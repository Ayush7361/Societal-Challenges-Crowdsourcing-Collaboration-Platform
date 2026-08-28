const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallengeStatus,
  voteChallenge,
  addComment,
  getComments,
  checkHasVoted,
} = require('../controllers/challengeController');
const { submitProposal, getProposals } = require('../controllers/proposalController');
const { postProgressUpdate, getProgressUpdates } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base challenge routes
router
  .route('/')
  .post(
  '/',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'evidence', maxCount: 4 },
  ]),
  createChallenge
);
  .get(getChallenges);

router.route('/:id').get(getChallengeById);

router.route('/:id/status').patch(protect, authorize('admin'), updateChallengeStatus);

// Voting & comments
router.route('/:id/vote').post(protect, voteChallenge);
router.route('/:id/hasVoted').get(protect, checkHasVoted);
router.route('/:id/comments').post(protect, addComment).get(getComments);

// Proposals for challenge
router
  .route('/:id/proposals')
  .post(protect, authorize('institution', 'admin'), submitProposal)
  .get(protect, getProposals);

// Progress updates for challenge
router
  .route('/:id/progress')
  .post(protect, authorize('institution', 'admin'), upload.single('image'), postProgressUpdate)
  .get(getProgressUpdates);

module.exports = router;
