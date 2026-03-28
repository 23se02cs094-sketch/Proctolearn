const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [50, 'Name cannot exceed 50 characters'],
        minLength: [2, 'Name should have at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Password should be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                // Allow empty/null or valid 10-digit number
                return !v || v === '' || /^[0-9]{10}$/.test(v);
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    settings: {
        notifications: {
            orderUpdates: { type: Boolean, default: true },
            shippingUpdates: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true },
            wishlistAlerts: { type: Boolean, default: true },
            priceDropAlerts: { type: Boolean, default: true }
        },
        communication: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            whatsapp: { type: Boolean, default: false }
        },
        shopping: {
            preferredPaymentMethod: {
                type: String,
                enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet'],
                default: 'COD'
            },
            currency: {
                type: String,
                enum: ['INR', 'USD'],
                default: 'INR'
            },
            defaultAddressId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            }
        }
    },
    addresses: [addressSchema],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Generate JWT Token
userSchema.methods.getJWTToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Compare Password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = require('crypto').randomBytes(20).toString('hex');
    
    this.resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    return resetToken;
};

// Generate Email Verification Token
userSchema.methods.getVerificationToken = function() {
    const verifyToken = require('crypto').randomBytes(20).toString('hex');
    
    this.verificationToken = require('crypto')
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');
    
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
