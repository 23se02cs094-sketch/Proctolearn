const Order = require('../Order');
const Cart = require('../Cart');
const Product = require('../Product');
const Shipping = require('../Shipping');
const sendEmail = require('../mails/sendEmail');

const normalizeSku = (sku = '') => String(sku).trim().toUpperCase();

const getActiveProductVariants = (product) => {
    return (product.variants || []).filter((variant) => variant.isActive !== false);
};

const resolveVariant = (product, selectedVariantId = '', selectedSku = '', selectedSize = '') => {
    const activeVariants = getActiveProductVariants(product);
    if (activeVariants.length === 0) {
        return null;
    }

    if (selectedVariantId) {
        const byId = activeVariants.find((variant) => String(variant._id) === String(selectedVariantId));
        if (byId) return byId;
    }

    const normalizedSku = normalizeSku(selectedSku);

    if (selectedSize && normalizedSku) {
        const bySizeAndSku = activeVariants.find(
            (variant) =>
                String(variant.size).toLowerCase() === String(selectedSize).trim().toLowerCase() &&
                normalizeSku(variant.sku) === normalizedSku
        );
        if (bySizeAndSku) return bySizeAndSku;
    }

    if (selectedSize) {
        const bySize =
            activeVariants.find(
                (variant) => String(variant.size).toLowerCase() === String(selectedSize).trim().toLowerCase()
            ) || null;
        if (bySize) return bySize;
    }

    if (normalizedSku) {
        return activeVariants.find((variant) => normalizeSku(variant.sku) === normalizedSku) || null;
    }

    return null;
};

const ACTIVE_ORDER_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'In Transit', 'Out for Delivery'];

const attachShippingToOrders = async (orders) => {
    if (!orders || orders.length === 0) {
        return [];
    }

    const orderIds = orders.map((order) => order._id);
    const shippingRecords = await Shipping.find({ order: { $in: orderIds } })
        .select('order trackingNumber carrier status estimatedDelivery actualDelivery shippedAt trackingHistory updatedAt');

    const shippingByOrderId = shippingRecords.reduce((acc, shipping) => {
        acc[shipping.order.toString()] = shipping.toObject();
        return acc;
    }, {});

    return orders.map((order) => {
        const orderObject = typeof order.toObject === 'function' ? order.toObject() : order;
        return {
            ...orderObject,
            shipping: shippingByOrderId[orderObject._id.toString()] || null
        };
    });
};

const buildTrackingTimeline = (order, shipping) => {
    const orderTimeline = (order.statusHistory || []).map((entry) => ({
        status: entry.status,
        source: 'order',
        note: entry.note || '',
        location: '',
        timestamp: entry.date || order.createdAt
    }));

    const shippingTimeline = (shipping?.trackingHistory || []).map((entry) => ({
        status: entry.status,
        source: 'shipping',
        note: entry.description || '',
        location: entry.location || '',
        timestamp: entry.timestamp
    }));

    const uniqueTimeline = [];
    const seen = new Set();

    [...orderTimeline, ...shippingTimeline]
        .filter((entry) => entry.status && entry.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .forEach((entry) => {
            const key = `${entry.source}-${entry.status}-${new Date(entry.timestamp).getTime()}-${entry.location}-${entry.note}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTimeline.push(entry);
            }
        });

    return uniqueTimeline;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            paymentMethod,
            orderItems,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        const sanitizedOrderItems = [];

        // Verify stock availability
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            const selectedVariant = resolveVariant(
                product,
                item.selectedVariantId,
                item.selectedSku,
                item.selectedSize
            );

            if (selectedVariant) {
                if (selectedVariant.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name} (${selectedVariant.size})`
                    });
                }

                sanitizedOrderItems.push({
                    product: item.product,
                    name: item.name || product.name,
                    image: item.image || product.images?.[0]?.url || '',
                    quantity: item.quantity,
                    price: selectedVariant.price,
                    selectedSize: selectedVariant.size,
                    selectedSku: selectedVariant.sku,
                    selectedVariantId: selectedVariant._id
                });
                continue;
            }

            if (getActiveProductVariants(product).length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Please select a valid size for ${product.name}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            sanitizedOrderItems.push({
                product: item.product,
                name: item.name || product.name,
                image: item.image || product.images?.[0]?.url || '',
                quantity: item.quantity,
                price: product.discountPrice || product.price,
                selectedSize: item.selectedSize || '',
                selectedSku: normalizeSku(item.selectedSku || '')
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            orderItems: sanitizedOrderItems,
            shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: paymentMethod === 'COD' ? 'Pending' : 'Pending'
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            statusHistory: [{
                status: 'Processing',
                note: 'Order placed successfully'
            }]
        });

        // Update product stock
        for (const item of sanitizedOrderItems) {
            if (item.selectedVariantId) {
                await Product.updateOne(
                    { _id: item.product, 'variants._id': item.selectedVariantId },
                    {
                        $inc: {
                            'variants.$.stock': -item.quantity,
                            stock: -item.quantity
                        }
                    }
                );
            } else if (item.selectedSku) {
                await Product.updateOne(
                    {
                        _id: item.product,
                        'variants.sku': normalizeSku(item.selectedSku),
                        ...(item.selectedSize ? { 'variants.size': item.selectedSize } : {})
                    },
                    {
                        $inc: {
                            'variants.$.stock': -item.quantity,
                            stock: -item.quantity
                        }
                    }
                );
            } else {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } }
        );

        // Create shipping record
        await Shipping.create({
            order: order._id,
            trackingHistory: [{
                status: 'Pending',
                description: 'Order placed and awaiting dispatch'
            }]
        });

        // Send order confirmation email
        const user = req.user;
        try {
            await sendEmail({
                email: user.email,
                subject: `Order Confirmed - ${order.orderId}`,
                template: 'orderConfirmation',
                data: {
                    name: user.name,
                    orderId: order.orderId,
                    orderItems: order.orderItems,
                    totalPrice: order.totalPrice,
                    shippingAddress: order.shippingAddress
                }
            });
        } catch (emailError) {
            console.error('Order confirmation email failed:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Order.countDocuments({ user: req.user.id });
        const orders = await Order.find({ user: req.user.id })
            .populate('orderItems.product', 'name images')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        const ordersWithShipping = await attachShippingToOrders(orders);

        res.status(200).json({
            success: true,
            count: ordersWithShipping.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: ordersWithShipping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get active shipments for logged in user
// @route   GET /api/orders/active-shipments
// @access  Private
exports.getMyActiveShipments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const filter = {
            user: req.user.id,
            orderStatus: { $in: ACTIVE_ORDER_STATUSES }
        };

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('orderItems.product', 'name images')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const shipments = await attachShippingToOrders(orders);

        res.status(200).json({
            success: true,
            count: shipments.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: shipments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active shipments',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        const shipping = await Shipping.findOne({ order: order._id });
        const orderWithShipping = order.toObject();
        orderWithShipping.shipping = shipping ? shipping.toObject() : null;

        res.status(200).json({
            success: true,
            data: orderWithShipping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Can only cancel if status is Processing or Confirmed
        if (!['Processing', 'Confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order at this stage'
            });
        }

        order.orderStatus = 'Cancelled';
        order.cancelledAt = Date.now();
        order.cancelReason = req.body.reason || 'Cancelled by user';
        order.statusHistory.push({
            status: 'Cancelled',
            note: req.body.reason || 'Cancelled by user'
        });

        await order.save();

        const shipping = await Shipping.findOne({ order: order._id });
        if (shipping) {
            await shipping.addTrackingUpdate('Cancelled', '', order.cancelReason);
        }

        // Restore product stock
        for (const item of order.orderItems) {
            if (item.selectedVariantId) {
                await Product.updateOne(
                    { _id: item.product, 'variants._id': item.selectedVariantId },
                    {
                        $inc: {
                            'variants.$.stock': item.quantity,
                            stock: item.quantity
                        }
                    }
                );
            } else if (item.selectedSku) {
                await Product.updateOne(
                    {
                        _id: item.product,
                        'variants.sku': normalizeSku(item.selectedSku),
                        ...(item.selectedSize ? { 'variants.size': item.selectedSize } : {})
                    },
                    {
                        $inc: {
                            'variants.$.stock': item.quantity,
                            stock: item.quantity
                        }
                    }
                );
            } else {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        // Send cancellation email
        try {
            await sendEmail({
                email: req.user.email,
                subject: `Order Cancelled - ${order.orderId}`,
                template: 'orderCancelled',
                data: {
                    name: req.user.name,
                    orderId: order.orderId,
                    reason: order.cancelReason
                }
            });
        } catch (emailError) {
            console.error('Order cancellation email failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to track this order'
            });
        }

        const shipping = await Shipping.findOne({ order: order._id });
        const trackingTimeline = buildTrackingTimeline(order, shipping);

        res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                orderStatus: order.orderStatus,
                isActiveShipment: ACTIVE_ORDER_STATUSES.includes(order.orderStatus),
                statusHistory: order.statusHistory,
                trackingTimeline,
                shipping: shipping ? {
                    trackingNumber: shipping.trackingNumber,
                    carrier: shipping.carrier,
                    status: shipping.status,
                    estimatedDelivery: shipping.estimatedDelivery,
                    actualDelivery: shipping.actualDelivery,
                    shippedAt: shipping.shippedAt,
                    trackingHistory: shipping.trackingHistory
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error tracking order',
            error: error.message
        });
    }
};
