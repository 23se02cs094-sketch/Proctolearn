const Shipping = require('../Shipping');
const Order = require('../Order');
const sendEmail = require('../mails/sendEmail');

// @desc    Get shipping details for an order (User)
// @route   GET /api/shipping/:orderId
// @access  Private
exports.getShippingDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership or admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const shipping = await Shipping.findOne({ order: req.params.orderId });

        if (!shipping) {
            return res.status(404).json({
                success: false,
                message: 'Shipping details not found'
            });
        }

        res.status(200).json({
            success: true,
            data: shipping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping details',
            error: error.message
        });
    }
};

// @desc    Track shipment by tracking number (Public)
// @route   GET /api/shipping/track/:trackingNumber
// @access  Public
exports.trackByNumber = async (req, res) => {
    try {
        const shipping = await Shipping.findOne({
            trackingNumber: req.params.trackingNumber
        }).populate('order', 'orderId orderStatus');

        if (!shipping) {
            return res.status(404).json({
                success: false,
                message: 'Tracking information not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                trackingNumber: shipping.trackingNumber,
                carrier: shipping.carrier,
                status: shipping.status,
                estimatedDelivery: shipping.estimatedDelivery,
                actualDelivery: shipping.actualDelivery,
                trackingHistory: shipping.trackingHistory
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error tracking shipment',
            error: error.message
        });
    }
};
