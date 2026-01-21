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

// Start the server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Start Express server
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

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();
