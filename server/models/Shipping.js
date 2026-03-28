const mongoose = require('mongoose');

const trackingUpdateSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    location: String,
    description: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const shippingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    trackingNumber: {
        type: String,
        unique: true
    },
    carrier: {
        type: String,
        enum: ['BlueDart', 'Delhivery', 'DTDC', 'FedEx', 'Ekart', 'Shadowfax', 'Other'],
        default: 'Other'
    },
    carrierTrackingUrl: String,
    status: {
        type: String,
        enum: ['Pending', 'Picked Up', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled', 'Returned'],
        default: 'Pending'
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippedAt: Date,
    weight: Number, // in grams
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    trackingHistory: [trackingUpdateSchema],
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate tracking number
shippingSchema.pre('save', async function(next) {
    if (this.isNew && !this.trackingNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.trackingNumber = `TRW${timestamp}${random}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Add tracking update method
shippingSchema.methods.addTrackingUpdate = function(status, location, description) {
    this.trackingHistory.push({
        status,
        location,
        description,
        timestamp: Date.now()
    });
    this.status = status;
    return this.save();
};

module.exports = mongoose.model('Shipping', shippingSchema);
