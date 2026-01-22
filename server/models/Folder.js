/**
 * Folder Model
 * ============
 * Hierarchical folder structure for organizing resources.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. SELF-REFERENCING: parentId points to another Folder document,
 *    enabling nested folder structures (like a file system).
 * 
 * 2. MATERIALIZED PATH PATTERN: We could store the full path for
 *    faster queries, but for simplicity we use adjacency list pattern.
 * 
 * 3. CASCADE CONSIDERATIONS: When deleting a folder, we need to
 *    decide what happens to child folders and resources.
 */

const mongoose = require('mongoose');

// Predefined colors for folders
const FOLDER_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#F97316'  // Orange
];

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Folder name is required'],
        trim: true,
        maxlength: [100, 'Folder name cannot exceed 100 characters']
    },

    // Owner reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Parent folder for nesting (null = root level)
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
        index: true
    },

    // Visual customization
    color: {
        type: String,
        default: '#3B82F6', // Default blue
        trim: true
    },

    icon: {
        type: String,
        default: 'folder', // Lucide icon name
        trim: true
    },

    // Order within parent folder
    sortOrder: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ====================
// INDEXES
// ====================

// Compound index for user's folders
folderSchema.index({ userId: 1, parentId: 1 });

// Unique folder name within same parent for same user
folderSchema.index({ userId: 1, parentId: 1, name: 1 }, { unique: true });

// ====================
// VIRTUALS
// ====================

/**
 * Virtual for child folder count
 * Note: This requires an additional query, use sparingly
 */
folderSchema.virtual('childCount', {
    ref: 'Folder',
    localField: '_id',
    foreignField: 'parentId',
    count: true
});

/**
 * Virtual for resource count in this folder
 */
folderSchema.virtual('resourceCount', {
    ref: 'Resource',
    localField: '_id',
    foreignField: 'folderId',
    count: true
});

// ====================
// MIDDLEWARE
// ====================

/**
 * Pre-save: Prevent circular references
 */
folderSchema.pre('save', async function (next) {
    if (this.parentId && this.isModified('parentId')) {
        // Check if parentId is the folder itself
        if (this.parentId.equals(this._id)) {
            const error = new Error('A folder cannot be its own parent');
            error.status = 400;
            return next(error);
        }

        // Check for circular reference (parent chain leads back to this folder)
        let currentParent = await this.constructor.findById(this.parentId);
        const visited = new Set([this._id.toString()]);

        while (currentParent) {
            if (visited.has(currentParent._id.toString())) {
                const error = new Error('Circular folder reference detected');
                error.status = 400;
                return next(error);
            }
            visited.add(currentParent._id.toString());
            currentParent = currentParent.parentId
                ? await this.constructor.findById(currentParent.parentId)
                : null;
        }
    }
    next();
});

// ====================
// STATIC METHODS
// ====================

/**
 * Get all folders for a user as a flat list
 */
folderSchema.statics.findByUser = function (userId) {
    return this.find({ userId })
        .sort({ parentId: 1, sortOrder: 1, name: 1 })
        .populate('childCount')
        .populate('resourceCount');
};

/**
 * Get folder tree structure for a user
 */
folderSchema.statics.getTree = async function (userId) {
    const folders = await this.find({ userId })
        .sort({ sortOrder: 1, name: 1 })
        .lean();

    // Build tree structure
    const folderMap = {};
    const rootFolders = [];

    // First pass: create map
    folders.forEach(folder => {
        folder.children = [];
        folderMap[folder._id.toString()] = folder;
    });

    // Second pass: build tree
    folders.forEach(folder => {
        if (folder.parentId) {
            const parent = folderMap[folder.parentId.toString()];
            if (parent) {
                parent.children.push(folder);
            }
        } else {
            rootFolders.push(folder);
        }
    });

    return rootFolders;
};

/**
 * Check if folder is empty (no resources and no child folders)
 */
folderSchema.statics.isEmpty = async function (folderId) {
    const Resource = mongoose.model('Resource');

    const [resourceCount, childCount] = await Promise.all([
        Resource.countDocuments({ folderId }),
        this.countDocuments({ parentId: folderId })
    ]);

    return resourceCount === 0 && childCount === 0;
};

// ====================
// INSTANCE METHODS
// ====================

/**
 * Get all descendant folder IDs (for cascade operations)
 */
folderSchema.methods.getDescendantIds = async function () {
    const descendants = [];
    const queue = [this._id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await this.constructor.find({ parentId: currentId }).select('_id');

        children.forEach(child => {
            descendants.push(child._id);
            queue.push(child._id);
        });
    }

    return descendants;
};

// Export the model
const Folder = mongoose.model('Folder', folderSchema);

// Export colors for use in frontend
Folder.COLORS = FOLDER_COLORS;

module.exports = Folder;
