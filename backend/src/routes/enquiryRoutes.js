const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, enquiryController.createEnquiry);
router.get('/', authenticateToken, enquiryController.getAllEnquiries);
router.get('/:id', authenticateToken, enquiryController.getEnquiryById);
router.put('/:id', authenticateToken, enquiryController.updateEnquiry);
router.delete('/:id', authenticateToken, enquiryController.deleteEnquiry);

module.exports = router;
