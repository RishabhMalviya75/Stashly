/**
 * Database Configuration
 * ======================
 * This file handles the MongoDB connection using Mongoose.
 * 
 * NOTE: Node.js 22 has SSL compatibility issues with MongoDB Atlas.
 * We use specific TLS settings to resolve this.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get the connection URI
    let mongoUri = process.env.MONGODB_URI;

    // Ensure proper TLS settings in the connection string
    // This fixes Node.js 22 + MongoDB Atlas SSL issues
    if (mongoUri && !mongoUri.includes('tls=true')) {
      const separator = mongoUri.includes('?') ? '&' : '?';
      mongoUri = `${mongoUri}${separator}tls=true&tlsInsecure=true`;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
