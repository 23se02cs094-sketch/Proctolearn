const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    title: {
        type: String,
        maxLength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxLength: [1000, 'Comment cannot exceed 1000 characters']
    },
    images: [{
        public_id: String,
        url: String
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    adminResponse: {
        message: String,
        respondedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
    const stats = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    const Product = require('./Product');
    
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratings: Math.round(stats[0].avgRating * 10) / 10,
            numOfReviews: stats[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratings: 0,
            numOfReviews: 0
        });
    }
};

// Update product rating after save
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.product);
});

// Update product rating after remove
reviewSchema.post('remove', function() {
    this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
