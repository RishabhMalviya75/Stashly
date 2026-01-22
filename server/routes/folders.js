/**
 * Folder Routes
 * =============
 * API endpoints for folder management.
 * 
 * All routes require authentication (isAuthenticated middleware).
 */

const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const folderController = require('../controllers/folderController');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @route   GET /api/folders/colors
 * @desc    Get available folder colors
 * @access  Private
 * @note    Must be defined before /:id to avoid conflicts
 */
router.get('/colors', folderController.getColors);

/**
 * @route   GET /api/folders
 * @desc    Get all folders for current user
 * @query   tree (boolean) - return as tree structure
 * @access  Private
 */
router.get('/', folderController.getFolders);

/**
 * @route   GET /api/folders/:id
 * @desc    Get a single folder by ID
 * @access  Private
 */
router.get('/:id', folderController.getFolderById);

/**
 * @route   POST /api/folders
 * @desc    Create a new folder
 * @access  Private
 */
router.post('/', folderController.createFolder);

/**
 * @route   PUT /api/folders/:id
 * @desc    Update a folder
 * @access  Private
 */
router.put('/:id', folderController.updateFolder);

/**
 * @route   DELETE /api/folders/:id
 * @desc    Delete a folder
 * @query   force (boolean) - delete even if not empty
 * @access  Private
 */
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
