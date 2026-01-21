/**
 * Database Configuration
 * ======================
 * This file handles the MongoDB connection using Mongoose.
 * 
 * 📚 LEARNING POINT:
 * Mongoose is an ODM (Object Document Mapper) for MongoDB.
 * It provides schema validation, type casting, and query building.
 * Think of it as the bridge between your JavaScript objects and MongoDB documents.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise
    // We use async/await for cleaner error handling
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are recommended for production:
      // - Helps with connection stability
      // - Enables new URL parser and topology engine
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code
    // In production, you might want to implement retry logic instead
    process.exit(1);
  }
};

module.exports = connectDB;
