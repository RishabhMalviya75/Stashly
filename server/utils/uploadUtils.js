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
                type: 'upload', // Public upload type (not authenticated)
                access_mode: 'public', // Ensure files are publicly accessible
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

/**
 * Generate a signed URL for accessing a Cloudinary file
 * Signed URLs include authentication and can access restricted files
 * 
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} resourceType - The resource type (image, video, raw)
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {string} Signed URL
 */
const generateSignedUrl = (publicId, resourceType = 'image', expiresIn = 3600) => {
    try {
        // Generate a signed URL with expiration
        const signedUrl = cloudinary.url(publicId, {
            resource_type: resourceType,
            type: 'authenticated', // For authenticated uploads
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + expiresIn
        });

        return signedUrl;
    } catch (error) {
        console.error('Cloudinary signed URL error:', error);
        throw error;
    }
};

/**
 * Extract public ID and resource type from a Cloudinary URL
 * 
 * @param {string} fileUrl - The Cloudinary file URL
 * @returns {Object} { publicId, resourceType }
 */
const parseCloudinaryUrl = (fileUrl) => {
    if (!fileUrl || !fileUrl.includes('cloudinary.com')) {
        return null;
    }

    try {
        // Cloudinary URL format: https://res.cloudinary.com/cloud_name/resource_type/type/version/public_id.extension
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.pdf

        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/').filter(Boolean);

        // pathParts: [cloud_name, resource_type, type, version?, ...public_id_parts]
        if (pathParts.length < 4) return null;

        const resourceType = pathParts[1]; // 'image', 'video', 'raw'
        const uploadType = pathParts[2]; // 'upload', 'authenticated', etc.

        // Find where public_id starts (after version if present)
        let publicIdStartIndex = 3;
        if (pathParts[3] && pathParts[3].startsWith('v') && /^v\d+$/.test(pathParts[3])) {
            publicIdStartIndex = 4;
        }

        // Join remaining parts as public_id (remove extension from last part)
        const publicIdParts = pathParts.slice(publicIdStartIndex);
        let publicId = publicIdParts.join('/');

        // Remove file extension for proper public_id
        // But keep it for raw files as they need the extension
        if (resourceType !== 'raw') {
            publicId = publicId.replace(/\.[^/.]+$/, '');
        }

        return {
            publicId,
            resourceType,
            uploadType
        };
    } catch (error) {
        console.error('Error parsing Cloudinary URL:', error);
        return null;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getFileDetails,
    generateSignedUrl,
    parseCloudinaryUrl
};
