const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    selectedSize: {
        type: String,
        default: ''
    },
    selectedSku: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentInfo: {
        id: String,
        method: {
            type: String,
            enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet'],
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
            default: 'Pending'
        },
        paidAt: Date
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    orderStatus: {
        type: String,
        enum: [
            'Pending',
            'Processing',
            'Confirmed',
            'Shipped',
            'In Transit',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
            'Returned'
        ],
        default: 'Processing'
    },
    statusHistory: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String
    }],
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate Order ID
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `TRW${Date.now()}${count + 1}`;
    }
    next();
});

// Add orderId field
orderSchema.add({
    orderId: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Order', orderSchema);
