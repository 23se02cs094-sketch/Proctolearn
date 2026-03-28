const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // OTP expires after 10 minutes (600 seconds)
    },
});

// Generate 6 digit OTP before saving
otpSchema.pre('save', function (next) {
    if (!this.otp) {
        this.otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    next();
});

module.exports = mongoose.model('OTP', otpSchema);
