/**
 * Upload Routes
 * =============
 * Handles file upload and deletion via Cloudinary.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. MULTER: Express middleware for handling multipart/form-data
 *    - We use memory storage to get file as buffer
 *    - Avoids writing temp files to disk
 * 
 * 2. FILE SIZE LIMITS: Prevent abuse by limiting upload size
 *    - Default: 10MB per file
 * 
 * 3. AUTHENTICATION: All upload routes require authentication
 *    - User ID determines the folder location in Cloudinary
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadUtils');
const { isAuthenticated } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Single file upload
    },
    fileFilter: (req, file, cb) => {
        // Allow common document and image types
        const allowedMimes = [
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            // Archives
            'application/zip',
            'application/x-rar-compressed',
            // Other
            'application/json'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} is not allowed`), false);
        }
    }
});

/**
 * POST /api/upload
 * Upload a file to Cloudinary
 * 
 * Returns: { fileUrl, publicId, fileName, fileSize, fileType }
 */
router.post('/', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        const userId = req.session.userId;
        const { buffer, originalname, mimetype, size } = req.file;

        // Upload to Cloudinary with user's folder
        const result = await uploadToCloudinary(buffer, originalname, userId);

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileUrl: result.url,
                publicId: result.publicId,
                fileName: result.originalFilename,
                fileSize: result.bytes || size,
                fileType: mimetype,
                format: result.format
            }
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 10MB limit'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file'
        });
    }
});

/**
 * DELETE /api/upload/:publicId
 * Delete a file from Cloudinary
 * 
 * Note: publicId is URL-encoded since it contains slashes
 */
router.delete('/:publicId(*)', isAuthenticated, async (req, res) => {
    try {
        const { publicId } = req.params;
        const userId = req.session.userId;

        // Security: Verify the file belongs to the user
        // Files are stored in stashly/users/{userId}/...
        const expectedPrefix = `stashly/users/${userId}/`;

        if (!publicId.startsWith(expectedPrefix)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this file'
            });
        }

        const result = await deleteFromCloudinary(publicId);

        res.json({
            success: true,
            message: 'File deleted successfully',
            data: { result }
        });

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete file'
        });
    }
});

/**
 * Error handling middleware for multer
 */
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 10MB limit'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
