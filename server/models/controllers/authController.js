const User = require('../User');
const OTP = require('../OTP');
const sendEmail = require('../mails/sendEmail');
const crypto = require('crypto');

const normalizePhoneNumber = (rawPhone) => {
    const digits = String(rawPhone || '').replace(/\D/g, '');

    if (!digits) return '';
    if (digits.length === 10) return digits;
    if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);

    return null;
};

// @desc    Send OTP to email for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Generate and save new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ email, otp });

        // Log OTP to terminal for testing
        console.log('\n========================================');
        console.log(`OTP for ${email}: ${otp}`);
        console.log('========================================\n');

        // Send OTP email
        try {
            await sendEmail({
                email,
                subject: 'Verify Your Email - The Resin World',
                template: 'otp',
                data: { OTP: otp }
            });
        } catch (emailError) {
            console.log('OTP email sending failed:', emailError.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Find the most recent OTP for this email
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        // OTP is valid, delete it
        await OTP.deleteMany({ email });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, otp } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (normalizedPhone === null) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        // Verify OTP first
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
        
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user with isVerified set to true (since OTP was verified)
        const user = await User.create({
            name,
            email,
            password,
            phone: normalizedPhone,
            isVerified: true
        });

        // Delete OTP after successful user creation
        await OTP.deleteMany({ email });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please login to continue.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset - The Resin World',
                template: 'passwordReset',
                data: {
                    name: user.name,
                    resetUrl
                }
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password reset successful');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password updated successfully');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.getJWTToken();

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
};
