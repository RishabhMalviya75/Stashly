/**
 * Resource Routes
 * ===============
 * API endpoints for resource management.
 * 
 * All routes require authentication (isAuthenticated middleware).
 */

const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @route   GET /api/resources/stats
 * @desc    Get resource statistics (counts by type)
 * @access  Private
 * @note    Must be defined before /:id to avoid conflicts
 */
router.get('/stats', resourceController.getStats);

/**
 * @route   GET /api/resources
 * @desc    Get all resources for current user
 * @query   type, folderId, favorite, tags, search, page, limit
 * @access  Private
 */
router.get('/', resourceController.getResources);

/**
 * @route   GET /api/resources/:id
 * @desc    Get a single resource by ID
 * @access  Private
 */
router.get('/:id', resourceController.getResourceById);

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Private
 */
router.post('/', resourceController.createResource);

/**
 * @route   PUT /api/resources/:id
 * @desc    Update a resource
 * @access  Private
 */
router.put('/:id', resourceController.updateResource);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private
 */
router.delete('/:id', resourceController.deleteResource);

/**
 * @route   PATCH /api/resources/:id/favorite
 * @desc    Toggle favorite status
 * @access  Private
 */
router.patch('/:id/favorite', resourceController.toggleFavorite);

module.exports = router;
