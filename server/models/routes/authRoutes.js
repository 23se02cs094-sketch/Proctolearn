const express = require('express');
const router = express.Router();
const {
    sendOTP,
    verifyOTP,
    register,
    login,
    logout,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
