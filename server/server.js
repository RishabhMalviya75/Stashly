/**
 * Server Entry Point
 * ==================
 * This is where our application starts!
 * 
 * 📚 LEARNING POINT:
 * We separate app.js (Express configuration) from server.js (startup).
 * This separation makes testing easier - you can import just the app
 * without starting the server.
 */

// Load environment variables FIRST (before anything else)
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// For Vercel serverless deployment - export the app
module.exports = app;

// Only start the server locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('');
        console.log('🚀 ================================');
        console.log('   STASHLY SERVER IS RUNNING!');
        console.log('================================');
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Server URL: http://localhost:${PORT}`);
        console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
        console.log('================================');
        console.log('');
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

