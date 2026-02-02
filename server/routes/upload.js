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
const { uploadToCloudinary, deleteFromCloudinary, generateSignedUrl, parseCloudinaryUrl } = require('../utils/uploadUtils');
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

/**
 * GET /api/upload/signed-url
 * Generate a signed URL for accessing a Cloudinary file
 * This creates an authenticated URL that can access restricted files
 * 
 * Query params: url (the original Cloudinary file URL)
 */
router.get('/signed-url', isAuthenticated, async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL parameter is required'
            });
        }

        // Security: Only allow Cloudinary URLs
        if (!url.includes('cloudinary.com')) {
            return res.status(403).json({
                success: false,
                message: 'Only Cloudinary URLs are allowed'
            });
        }

        // Parse the Cloudinary URL to extract public ID and resource type
        const parsed = parseCloudinaryUrl(url);

        if (!parsed) {
            // If we can't parse, try returning the original URL
            // It might already be public
            return res.json({
                success: true,
                data: { signedUrl: url }
            });
        }

        // Generate a signed URL (valid for 1 hour)
        const signedUrl = generateSignedUrl(parsed.publicId, parsed.resourceType, 3600);

        res.json({
            success: true,
            data: { signedUrl }
        });

    } catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate signed URL'
        });
    }
});

/**
 * GET /api/upload/proxy
 * Proxy endpoint to fetch files from Cloudinary
 * Uses signed URLs to access authenticated files
 * 
 * Query params: url (the Cloudinary file URL)
 */
router.get('/proxy', isAuthenticated, async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL parameter is required'
            });
        }

        // Security: Only allow Cloudinary URLs
        if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
            return res.status(403).json({
                success: false,
                message: 'Only Cloudinary URLs are allowed'
            });
        }

        // Parse the URL and generate a signed URL for authenticated access
        const parsed = parseCloudinaryUrl(url);
        let fetchUrl = url;

        if (parsed) {
            // Try to generate a signed URL
            try {
                fetchUrl = generateSignedUrl(parsed.publicId, parsed.resourceType, 3600);
            } catch (signError) {
                console.warn('Could not generate signed URL, using original:', signError.message);
            }
        }

        // Fetch the file from Cloudinary using the signed URL
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            // If signed URL fails, try original URL as fallback
            if (fetchUrl !== url) {
                console.log('Signed URL failed, trying original URL...');
                const fallbackResponse = await fetch(url);
                if (fallbackResponse.ok) {
                    const contentType = fallbackResponse.headers.get('content-type') || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', 'inline');
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    const buffer = await fallbackResponse.arrayBuffer();
                    return res.send(Buffer.from(buffer));
                }
            }

            console.error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({
                success: false,
                message: `Failed to fetch file: ${response.statusText}`
            });
        }

        // Get content type from response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Set headers for inline viewing (not download)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Stream the response to client
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('File proxy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to proxy file'
        });
    }
});

module.exports = router;

