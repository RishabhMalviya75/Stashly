/**
 * Upload Utilities
 * ================
 * Helper functions for uploading and managing files on Cloudinary.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. USER-SPECIFIC FOLDERS: Each user gets their own folder structure
 *    - Keeps files organized and makes management easier
 *    - Format: stashly/users/{userId}/
 * 
 * 2. STREAM UPLOAD: We use streams for efficient memory usage
 *    - Files are uploaded directly without writing to disk
 * 
 * 3. RESOURCE_TYPE: 'auto' lets Cloudinary detect file type
 *    - Supports images, videos, PDFs, and raw files
 */

const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload a file to Cloudinary in the user's folder
 * 
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} originalName - Original filename for reference
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (fileBuffer, originalName, userId) => {
    return new Promise((resolve, reject) => {
        // Create a unique public_id based on timestamp and original name
        const timestamp = Date.now();
        const sanitizedName = originalName
            .replace(/\.[^/.]+$/, '') // Remove extension
            .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars
            .substring(0, 50); // Limit length

        const publicId = `stashly/users/${userId}/${timestamp}_${sanitizedName}`;

        // Create upload stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: 'auto', // Automatically detect file type
                folder: '', // We include folder in public_id
                overwrite: false,
                unique_filename: false,
                use_filename: true
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve({
                        publicId: result.public_id,
                        url: result.secure_url,
                        format: result.format,
                        resourceType: result.resource_type,
                        bytes: result.bytes,
                        originalFilename: originalName
                    });
                }
            }
        );

        // Convert buffer to readable stream and pipe to Cloudinary
        const readableStream = Readable.from(fileBuffer);
        readableStream.pipe(uploadStream);
    });
};

/**
 * Delete a file from Cloudinary
 * 
 * @param {string} publicId - The Cloudinary public ID of the file
 * @param {string} resourceType - The resource type (image, video, raw)
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
    try {
        // Try different resource types if auto doesn't work
        const types = resourceType === 'auto'
            ? ['image', 'video', 'raw']
            : [resourceType];

        for (const type of types) {
            try {
                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: type,
                    invalidate: true // Invalidate CDN cache
                });

                if (result.result === 'ok') {
                    return result;
                }
            } catch (err) {
                // Continue to next resource type
                continue;
            }
        }

        // If we get here, deletion failed for all types
        console.warn(`Could not delete file with publicId: ${publicId}`);
        return { result: 'not_found' };

    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

/**
 * Get a file's details from Cloudinary
 * 
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} resourceType - The resource type
 * @returns {Promise<Object>} File details
 */
const getFileDetails = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary get details error:', error);
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getFileDetails
};
