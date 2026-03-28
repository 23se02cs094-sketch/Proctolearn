const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getMyActiveShipments,
    getOrder,
    cancelOrder,
    trackOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/active-shipments', getMyActiveShipments);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/track', trackOrder);

module.exports = router;
