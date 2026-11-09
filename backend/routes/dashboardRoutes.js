const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getActivityLogs,
  getSettings
} = require('../controllers/dashboardController');

// Dashboard statistics
router.get('/stats', getDashboardStats);

module.exports = router;

