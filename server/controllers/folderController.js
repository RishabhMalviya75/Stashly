/**
 * Folder Controller
 * =================
 * Handles CRUD operations for folders.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. HIERARCHICAL DATA: Folders can be nested. We use parentId to create
 *    a tree structure (adjacency list pattern).
 * 
 * 2. CASCADE DELETE: When deleting a folder, we have options:
 *    - Prevent if not empty (safer)
 *    - Move contents to parent folder
 *    - Delete everything (dangerous but sometimes needed)
 */

const Folder = require('../models/Folder');
const Resource = require('../models/Resource');

/**
 * Create a new folder
 * POST /api/folders
 */
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId, color, icon } = req.body;

        // If parentId provided, verify it exists and belongs to user
        if (parentId) {
            const parentFolder = await Folder.findOne({
                _id: parentId,
                userId: req.session.userId
            });
            if (!parentFolder) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent folder not found'
                });
            }
        }

        // Create folder
        const folder = new Folder({
            name,
            userId: req.session.userId,
            parentId: parentId || null,
            color: color || '#3B82F6',
            icon: icon || 'folder'
        });

        await folder.save();

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            data: { folder }
        });

    } catch (error) {
        console.error('Create folder error:', error);

        // Duplicate folder name error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A folder with this name already exists in the same location'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create folder'
        });
    }
};

/**
 * Get all folders for the current user
 * GET /api/folders
 * Query params: tree (boolean) - return as tree structure
 */
exports.getFolders = async (req, res) => {
    try {
        const { tree } = req.query;

        let folders;
        if (tree === 'true') {
            // Return hierarchical tree structure
            folders = await Folder.getTree(req.session.userId);
        } else {
            // Return flat list
            folders = await Folder.findByUser(req.session.userId);
        }

        res.json({
            success: true,
            data: { folders }
        });

    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch folders'
        });
    }
};

/**
 * Get a single folder by ID
 * GET /api/folders/:id
 */
exports.getFolderById = async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            userId: req.session.userId
        })
            .populate('childCount')
            .populate('resourceCount');

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        res.json({
            success: true,
            data: { folder }
        });

    } catch (error) {
        console.error('Get folder error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid folder ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch folder'
        });
    }
};

/**
 * Update a folder
 * PUT /api/folders/:id
 */
exports.updateFolder = async (req, res) => {
    try {
        const { name, parentId, color, icon, sortOrder } = req.body;

        const folder = await Folder.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // If changing parent, verify new parent exists and belongs to user
        if (parentId !== undefined && parentId !== folder.parentId?.toString()) {
            if (parentId && parentId !== 'null') {
                // Prevent moving to self
                if (parentId === folder._id.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot move folder into itself'
                    });
                }

                // Prevent moving to a descendant
                const descendants = await folder.getDescendantIds();
                if (descendants.some(d => d.toString() === parentId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot move folder into one of its subfolders'
                    });
                }

                const parentFolder = await Folder.findOne({
                    _id: parentId,
                    userId: req.session.userId
                });
                if (!parentFolder) {
                    return res.status(404).json({
                        success: false,
                        message: 'Parent folder not found'
                    });
                }
            }
            folder.parentId = parentId === 'null' ? null : parentId;
        }

        // Update other fields
        if (name !== undefined) folder.name = name;
        if (color !== undefined) folder.color = color;
        if (icon !== undefined) folder.icon = icon;
        if (sortOrder !== undefined) folder.sortOrder = sortOrder;

        await folder.save();

        res.json({
            success: true,
            message: 'Folder updated successfully',
            data: { folder }
        });

    } catch (error) {
        console.error('Update folder error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A folder with this name already exists in the same location'
            });
        }

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
                message: 'Invalid folder ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update folder'
        });
    }
};

/**
 * Delete a folder
 * DELETE /api/folders/:id
 * Query params: 
 *   - force: delete even if not empty (moves contents to parent)
 */
exports.deleteFolder = async (req, res) => {
    try {
        const { force } = req.query;

        const folder = await Folder.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Check if folder is empty
        const isEmpty = await Folder.isEmpty(folder._id);

        if (!isEmpty && force !== 'true') {
            return res.status(400).json({
                success: false,
                message: 'Folder is not empty. Use force=true to move contents to parent folder and delete.'
            });
        }

        // If force delete, move contents to parent folder
        if (!isEmpty && force === 'true') {
            // Move resources to parent folder
            await Resource.updateMany(
                { folderId: folder._id },
                { folderId: folder.parentId }
            );

            // Move child folders to parent folder
            await Folder.updateMany(
                { parentId: folder._id },
                { parentId: folder.parentId }
            );
        }

        // Delete the folder
        await folder.deleteOne();

        res.json({
            success: true,
            message: 'Folder deleted successfully',
            data: { folder }
        });

    } catch (error) {
        console.error('Delete folder error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid folder ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete folder'
        });
    }
};

/**
 * Get available folder colors
 * GET /api/folders/colors
 */
exports.getColors = (req, res) => {
    res.json({
        success: true,
        data: { colors: Folder.COLORS }
    });
};
