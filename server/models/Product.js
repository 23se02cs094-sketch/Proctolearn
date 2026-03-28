const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: [true, 'Please enter variant size'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Please enter variant SKU'],
        trim: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: [true, 'Please enter variant price'],
        min: [0, 'Variant price cannot be negative']
    },
    comparePrice: {
        type: Number,
        default: 0,
        min: [0, 'Variant compare price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter variant stock'],
        min: [0, 'Variant stock cannot be negative'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
        maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category']
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        resourceType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image'
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    specifications: [{
        key: String,
        value: String
    }],
    variants: [productVariantSchema],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    if (this.variants?.length > 0) {
        const skuSet = new Set();
        for (const variant of this.variants) {
            const normalizedSku = String(variant.sku || '').trim().toUpperCase();
            if (!normalizedSku) {
                this.invalidate('variants.sku', 'Variant SKU is required');
                break;
            }
            if (skuSet.has(normalizedSku)) {
                this.invalidate('variants.sku', 'Variant SKUs must be unique per product');
                break;
            }
            skuSet.add(normalizedSku);
            variant.sku = normalizedSku;
        }
    }
    this.updatedAt = Date.now();
    next();
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
