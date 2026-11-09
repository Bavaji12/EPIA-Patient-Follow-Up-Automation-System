const express = require('express');
const router = express.Router();
const {
  generateDrafts,
  getAllDrafts,
  getDraftById,
  editDraft,
  approveDraft,
  rejectDraft
} = require('../controllers/automationController');

// Automation & AI Draft routes
router.post('/generate', generateDrafts);
router.get('/drafts', getAllDrafts);
router.get('/drafts/:id', getDraftById);
router.patch('/drafts/:id', editDraft);
router.patch('/drafts/:id/approve', approveDraft);
router.patch('/drafts/:id/reject', rejectDraft);

module.exports = router;

