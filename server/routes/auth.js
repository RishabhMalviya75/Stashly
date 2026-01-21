/**
 * Authentication Routes
 * =====================
 * Handles user registration, login, logout, and password management.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. EXPRESS-VALIDATOR: Server-side validation is CRITICAL!
 *    Never trust client-side validation alone - it can be bypassed.
 * 
 * 2. SESSION-BASED AUTH: After login, we store userId in the session.
 *    The session ID is sent as a cookie to the browser.
 *    On subsequent requests, Express reads the cookie and loads the session.
 * 
 * 3. ERROR HANDLING: We use try-catch to handle async errors.
 *    Always return meaningful error messages to the frontend.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

const router = express.Router();

// =====================
// VALIDATION MIDDLEWARE
// =====================

// Reusable validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Display name must be 2-50 characters'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain a letter')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Helper to check validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(e => e.msg)
        });
    }
    next();
};

// =================
// REGISTRATION
// =================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register',
    isNotAuthenticated,
    registerValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, displayName, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'An account with this email already exists'
                });
            }

            // Create new user
            // Note: passwordHash field is used - the pre-save hook will hash it
            const user = new User({
                email,
                displayName,
                passwordHash: password, // Will be hashed by pre-save hook
                authProvider: 'local'
            });

            await user.save();

            // Log the user in automatically after registration
            req.session.userId = user._id;

            // Return user data (without password)
            res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        displayName: user.displayName,
                        avatar: user.avatar,
                        settings: user.settings,
                        createdAt: user.createdAt
                    }
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create account. Please try again.'
            });
        }
    }
);

// =================
// LOGIN
// =================

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
    isNotAuthenticated,
    loginValidation,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user (must explicitly select passwordHash)
            const user = await User.findOne({ email: email.toLowerCase() })
                .select('+passwordHash');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            user.lastLoginAt = new Date();
            await user.save();

            // Create session
            req.session.userId = user._id;

            res.json({
                success: true,
                message: 'Login successful!',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        displayName: user.displayName,
                        avatar: user.avatar,
                        settings: user.settings,
                        lastLoginAt: user.lastLoginAt
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed. Please try again.'
            });
        }
    }
);

// =================
// LOGOUT
// =================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (destroy session)
 * @access  Private
 */
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// =================
// GET CURRENT USER
// =================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            // Session exists but user was deleted
            req.session.destroy();
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    settings: user.settings,
                    storageUsed: user.storageUsed,
                    storageLimit: user.storageLimit,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
});

// ====================
// FORGOT PASSWORD
// ====================

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * 
 * 📚 NOTE: In a production app, you would send an email here.
 * For the MVP, we'll generate a token that could be used in an email.
 */
router.post('/forgot-password',
    body('email').isEmail().withMessage('Please enter a valid email'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findByEmail(email);

            // Don't reveal if user exists or not (security)
            if (!user) {
                return res.json({
                    success: true,
                    message: 'If an account exists with this email, you will receive reset instructions.'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Hash the token before storing (security)
            const hashedToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // Save to user
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // In production: Send email with reset link containing resetToken
            // For MVP: We'll just return success
            // The reset link would be: ${CLIENT_URL}/reset-password?token=${resetToken}

            console.log(`Password reset token for ${email}: ${resetToken}`);

            res.json({
                success: true,
                message: 'If an account exists with this email, you will receive reset instructions.',
                // Only in development - remove in production!
                ...(process.env.NODE_ENV === 'development' && { devToken: resetToken })
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process request'
            });
        }
    }
);

// ====================
// RESET PASSWORD
// ====================

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password',
    [
        body('token').notEmpty().withMessage('Reset token is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { token, password } = req.body;

            // Hash the provided token to match stored hash
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Find user with valid token
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Update password
            user.passwordHash = password; // Pre-save hook will hash it
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.json({
                success: true,
                message: 'Password reset successful! Please login with your new password.'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reset password'
            });
        }
    }
);

module.exports = router;
