/**
 * Resource Model
 * ==============
 * Polymorphic schema for all resource types: bookmark, prompt, snippet, document, note
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. POLYMORPHIC DESIGN: Single collection with a 'type' field determines
 *    which additional fields are relevant. This is simpler than multiple collections.
 * 
 * 2. DISCRIMINATORS: Mongoose feature for inheritance - we could use this
 *    but for simplicity, we use conditional validation.
 * 
 * 3. INDEXES: We add indexes on frequently queried fields for performance.
 * 
 * 4. VIRTUALS & POPULATION: We reference User and Folder models using ObjectId.
 */

const mongoose = require('mongoose');

// Resource types enum
const RESOURCE_TYPES = ['bookmark', 'prompt', 'snippet', 'document', 'note'];

const resourceSchema = new mongoose.Schema({
    // ====================
    // BASE FIELDS (All Types)
    // ====================

    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    type: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: {
            values: RESOURCE_TYPES,
            message: 'Invalid resource type. Must be: bookmark, prompt, snippet, document, or note'
        }
    },

    // Owner reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Optional folder for organization
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
        index: true
    },

    // Personal notes about why you saved this
    annotations: {
        type: String,
        trim: true,
        maxlength: [2000, 'Annotations cannot exceed 2000 characters']
    },

    // Tags for categorization
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],

    // Quick access flag
    favorite: {
        type: Boolean,
        default: false,
        index: true
    },

    // ====================
    // BOOKMARK-SPECIFIC FIELDS
    // ====================

    url: {
        type: String,
        trim: true,
        // Only required if type is 'bookmark'
        validate: {
            validator: function (v) {
                if (this.type === 'bookmark') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'URL is required for bookmarks'
        }
    },

    favicon: {
        type: String,
        default: null
    },

    // ====================
    // PROMPT-SPECIFIC FIELDS
    // ====================

    // AI platform (ChatGPT, Claude, Midjourney, etc.)
    platform: {
        type: String,
        trim: true,
        maxlength: [50, 'Platform name cannot exceed 50 characters']
    },

    // Prompt category (coding, writing, image, etc.)
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },

    // ====================
    // SNIPPET-SPECIFIC FIELDS
    // ====================

    // Programming language (renamed to avoid MongoDB text index conflict)
    codeLanguage: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Language name cannot exceed 30 characters']
    },

    // ====================
    // DOCUMENT-SPECIFIC FIELDS
    // ====================

    fileUrl: {
        type: String,
        trim: true
    },

    fileName: {
        type: String,
        trim: true,
        maxlength: [255, 'File name cannot exceed 255 characters']
    },

    fileSize: {
        type: Number, // in bytes
        default: 0
    },

    fileType: {
        type: String, // MIME type
        trim: true
    },

    // Cloudinary public ID for file management
    cloudinaryPublicId: {
        type: String,
        trim: true
    },

    // ====================
    // SHARED CONTENT FIELD
    // Used by: prompt, snippet, note
    // ====================

    content: {
        type: String,
        trim: true,
        maxlength: [100000, 'Content cannot exceed 100,000 characters'],
        validate: {
            validator: function (v) {
                // Content is required for prompt, snippet, and note types
                if (['prompt', 'snippet', 'note'].includes(this.type)) {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Content is required for prompts, snippets, and notes'
        }
    },

    // Short description/summary
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }

}, {
    timestamps: true // createdAt, updatedAt
});

// ====================
// INDEXES
// ====================

// Compound index for user's resources by type
resourceSchema.index({ userId: 1, type: 1 });

// Compound index for user's resources in a folder
resourceSchema.index({ userId: 1, folderId: 1 });

// Text index for search functionality
resourceSchema.index({
    title: 'text',
    annotations: 'text',
    content: 'text',
    description: 'text',
    tags: 'text'
});

// ====================
// STATIC METHODS
// ====================

/**
 * Get resources by user with optional filters
 */
resourceSchema.statics.findByUser = function (userId, filters = {}) {
    const query = { userId };

    if (filters.type) query.type = filters.type;
    if (filters.folderId) query.folderId = filters.folderId;
    if (filters.favorite === true) query.favorite = true;
    if (filters.tags && filters.tags.length) {
        query.tags = { $in: filters.tags };
    }

    return this.find(query).sort({ createdAt: -1 });
};

/**
 * Search resources by text
 */
resourceSchema.statics.search = function (userId, searchQuery) {
    return this.find({
        userId,
        $text: { $search: searchQuery }
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' }
    });
};

// ====================
// INSTANCE METHODS
// ====================

/**
 * Toggle favorite status
 */
resourceSchema.methods.toggleFavorite = async function () {
    this.favorite = !this.favorite;
    return this.save();
};

// Export the model
const Resource = mongoose.model('Resource', resourceSchema);

// Export types for use in controllers
Resource.TYPES = RESOURCE_TYPES;

module.exports = Resource;
