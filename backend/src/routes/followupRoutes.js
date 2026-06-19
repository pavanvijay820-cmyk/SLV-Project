const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, followupController.createFollowup);
router.get('/', authenticateToken, followupController.getFollowups);
router.put('/:id', authenticateToken, followupController.updateFollowup);

module.exports = router;
