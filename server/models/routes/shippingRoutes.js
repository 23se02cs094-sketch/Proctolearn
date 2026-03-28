const express = require('express');
const router = express.Router();
const {
    getShippingDetails,
    trackByNumber
} = require('../controllers/shippingController');
const { protect } = require('../middleware/auth');

// Public route - track by tracking number
router.get('/track/:trackingNumber', trackByNumber);

// Protected route - get shipping details for an order
router.get('/:orderId', protect, getShippingDetails);

module.exports = router;
