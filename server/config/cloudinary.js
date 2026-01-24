/**
 * Cloudinary Configuration
 * ========================
 * Configures the Cloudinary SDK for file uploads.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. CLOUDINARY: Cloud-based image and video management service
 *    - Handles file storage, transformations, and CDN delivery
 * 
 * 2. ENVIRONMENT VARIABLES: Keep credentials secure
 *    - Never commit actual credentials to version control
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
