const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/analytics', authenticateToken, dashboardController.getAnalytics);

module.exports = router;
