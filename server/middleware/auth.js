/**
 * Authentication Middleware
 * =========================
 * Middleware functions to protect routes and manage authentication.
 * 
 * 📚 LEARNING POINT:
 * Middleware are functions that run BETWEEN the request and your route handler.
 * They can:
 * - Check if a user is authenticated
 * - Add data to the request object
 * - Send error responses
 * - Call next() to continue to the route handler
 */

/**
 * isAuthenticated
 * Checks if the user has an active session.
 * Use this to protect any route that requires login.
 * 
 * Usage: router.get('/protected', isAuthenticated, (req, res) => {...})
 */
const isAuthenticated = (req, res, next) => {
    // Check if session exists and has a userId
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the route
        return next();
    }

    // Not authenticated
    return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
    });
};

/**
 * isNotAuthenticated
 * Opposite of isAuthenticated.
 * Use for routes that should only be accessed by non-logged-in users
 * (like login and register pages - redirect if already logged in)
 */
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.status(400).json({
            success: false,
            message: 'You are already logged in'
        });
    }
    next();
};

/**
 * attachUser
 * Middleware to fetch and attach the full user object to the request.
 * Useful when you need user details beyond just the ID.
 * 
 * Note: This makes a database call, so only use when necessary.
 */
const User = require('../models/User');

const attachUser = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next();
    }

    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        console.error('Error attaching user:', error);
        next();
    }
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    attachUser
};
