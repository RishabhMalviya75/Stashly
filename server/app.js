/**
 * Express Application Configuration
 * ==================================
 * This file sets up the Express app with all middleware and routes.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. MIDDLEWARE ORDER MATTERS!
 *    - Security middleware first (helmet, cors)
 *    - Parsing middleware next (json, urlencoded)
 *    - Session middleware before routes
 *    - Routes
 *    - Error handlers LAST
 * 
 * 2. HELMET: Adds security headers to prevent common attacks
 *    - XSS protection, clickjacking prevention, etc.
 * 
 * 3. CORS: Controls which domains can access your API
 *    - Essential for frontend-backend communication
 * 
 * 4. RATE LIMITING: Prevents abuse and DDoS attacks
 *    - Limits requests per IP address
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();

// Trust Vercel's proxy (required for secure cookies)
app.set('trust proxy', 1);

// ===================
// SECURITY MIDDLEWARE
// ===================

// Helmet hooks
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',  // PWA may use this instead of localhost
    'https://stashly-k535.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean);

// Automatically add www or non-www version of the custom domain
if (process.env.CLIENT_URL) {
    try {
        const url = new URL(process.env.CLIENT_URL);
        const host = url.hostname;
        const protocol = url.protocol; // 'https:'

        if (host.startsWith('www.')) {
            // If variable is www.stashly.in, also allow stashly.in
            const nonWwwInfo = protocol + '//' + host.replace('www.', '');
            if (!allowedOrigins.includes(nonWwwInfo)) allowedOrigins.push(nonWwwInfo);
        } else {
            // If variable is stashly.in, also allow www.stashly.in
            const wwwInfo = protocol + '//www.' + host;
            if (!allowedOrigins.includes(wwwInfo)) allowedOrigins.push(wwwInfo);
        }
    } catch (e) {
        console.error('Invalid CLIENT_URL:', process.env.CLIENT_URL);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version']
}));

// Rate Limiting: Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limit for auth endpoints (prevent brute force)
// Higher limit in development for testing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 in prod, 50 in dev
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// =================
// PARSING MIDDLEWARE
// =================

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================
// SESSION CONFIGURATION
// ====================

/**
 * 📚 SESSION MANAGEMENT:
 * - Sessions store user authentication state on the server
 * - A session ID cookie is sent to the browser
 * - connect-mongo stores sessions in MongoDB (persistent across restarts)
 */
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,              // Don't save session if unmodified
    saveUninitialized: false,   // Don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,        // Session TTL: 24 hours
        autoRemove: 'native',     // Use MongoDB's TTL index
        touchAfter: 24 * 3600     // Update session only once per 24 hours (unless data changes)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,           // Prevents JavaScript access (XSS protection)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in prod
    }
}));

// ======
// ROUTES
// ======

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Stashly API is running!',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Resource management routes
app.use('/api/folders', require('./routes/folders'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));

// ==============
// ERROR HANDLERS
// ==============

// 404 Handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Default server error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
