/**
 * Resource Controller
 * ===================
 * Handles CRUD operations for resources.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. CONTROLLER PATTERN: Controllers handle request/response logic.
 *    They call models for data operations and return formatted responses.
 * 
 * 2. AUTH CHECK: Every controller method assumes req.session.userId exists
 *    (auth middleware protects the routes).
 * 
 * 3. OWNERSHIP: We always filter by userId to ensure users only access
 *    their own resources.
 */

const Resource = require('../models/Resource');
const Folder = require('../models/Folder');

/**
 * Create a new resource
 * POST /api/resources
 */
exports.createResource = async (req, res) => {
    try {
        const { type, title, folderId, annotations, tags, ...typeFields } = req.body;

        // Validate resource type
        if (!Resource.TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid resource type. Must be one of: ${Resource.TYPES.join(', ')}`
            });
        }

        // If folderId provided, verify it exists and belongs to user
        if (folderId) {
            const folder = await Folder.findOne({
                _id: folderId,
                userId: req.session.userId
            });
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }
        }

        // Create resource
        const resource = new Resource({
            type,
            title,
            userId: req.session.userId,
            folderId: folderId || null,
            annotations,
            tags: tags || [],
            ...typeFields
        });

        await resource.save();

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: { resource }
        });

    } catch (error) {
        console.error('Create resource error:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            console.error('Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create resource'
        });
    }
};

/**
 * Get all resources for the current user
 * GET /api/resources
 * Query params: type, folderId, favorite, tags, search
 */
exports.getResources = async (req, res) => {
    try {
        const { type, folderId, favorite, tags, search, page = 1, limit = 50 } = req.query;

        // Build filter
        const filter = { userId: req.session.userId };

        if (type && Resource.TYPES.includes(type)) {
            filter.type = type;
        }

        if (folderId === 'null' || folderId === 'root') {
            filter.folderId = null;
        } else if (folderId) {
            filter.folderId = folderId;
        }

        if (favorite === 'true') {
            filter.favorite = true;
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            filter.tags = { $in: tagArray.map(t => t.toLowerCase().trim()) };
        }

        // Text search
        if (search) {
            filter.$text = { $search: search };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const [resources, total] = await Promise.all([
            Resource.find(filter)
                .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('folderId', 'name color'),
            Resource.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources'
        });
    }
};

/**
 * Get a single resource by ID
 * GET /api/resources/:id
 */
exports.getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            _id: req.params.id,
            userId: req.session.userId
        }).populate('folderId', 'name color');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            data: { resource }
        });

    } catch (error) {
        console.error('Get resource error:', error);

        // Invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch resource'
        });
    }
};

/**
 * Update a resource
 * PUT /api/resources/:id
 */
exports.updateResource = async (req, res) => {
    try {
        const { title, folderId, annotations, tags, favorite, ...typeFields } = req.body;

        // Find the resource first
        const resource = await Resource.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // If changing folder, verify new folder exists and belongs to user
        if (folderId !== undefined && folderId !== resource.folderId?.toString()) {
            if (folderId && folderId !== 'null') {
                const folder = await Folder.findOne({
                    _id: folderId,
                    userId: req.session.userId
                });
                if (!folder) {
                    return res.status(404).json({
                        success: false,
                        message: 'Folder not found'
                    });
                }
            }
            resource.folderId = folderId === 'null' ? null : folderId;
        }

        // Update fields
        if (title !== undefined) resource.title = title;
        if (annotations !== undefined) resource.annotations = annotations;
        if (tags !== undefined) resource.tags = tags;
        if (favorite !== undefined) resource.favorite = favorite;

        // Update type-specific fields
        Object.keys(typeFields).forEach(key => {
            if (typeFields[key] !== undefined) {
                resource[key] = typeFields[key];
            }
        });

        await resource.save();

        res.json({
            success: true,
            message: 'Resource updated successfully',
            data: { resource }
        });

    } catch (error) {
        console.error('Update resource error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update resource'
        });
    }
};

/**
 * Delete a resource
 * DELETE /api/resources/:id
 */
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Resource deleted successfully',
            data: { resource }
        });

    } catch (error) {
        console.error('Delete resource error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete resource'
        });
    }
};

/**
 * Toggle favorite status
 * PATCH /api/resources/:id/favorite
 */
exports.toggleFavorite = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        resource.favorite = !resource.favorite;
        await resource.save();

        res.json({
            success: true,
            message: `Resource ${resource.favorite ? 'added to' : 'removed from'} favorites`,
            data: { resource }
        });

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle favorite'
        });
    }
};

/**
 * Get resource counts by type
 * GET /api/resources/stats
 */
exports.getStats = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.session.userId);

        const stats = await Resource.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to object
        const counts = {};
        Resource.TYPES.forEach(type => {
            counts[type] = 0;
        });
        stats.forEach(s => {
            counts[s._id] = s.count;
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const favorites = await Resource.countDocuments({
            userId: req.session.userId,
            favorite: true
        });

        res.json({
            success: true,
            data: {
                counts,
                total,
                favorites
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
};
