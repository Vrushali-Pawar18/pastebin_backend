/**
 * Paste Routes
 * Defines all paste-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { pasteController } = require('../controllers');
const {
    createPasteValidation,
    pasteIdValidation,
    createPasteLimiter
} = require('../middlewares');

/**
 * @route   POST /api/pastes
 * @desc    Create a new paste
 * @access  Public
 */
router.post(
    '/',
    createPasteLimiter,
    createPasteValidation,
    pasteController.createPaste
);

/**
 * @route   GET /api/pastes/health
 * @desc    Health check for paste service
 * @access  Public
 */
router.get('/health', pasteController.healthCheck);

/**
 * @route   GET /api/pastes/stats
 * @desc    Get paste statistics
 * @access  Public
 */
router.get('/stats', pasteController.getStats);

/**
 * @route   GET /api/pastes/:id
 * @desc    Get a paste by ID (increments view count)
 * @access  Public
 */
router.get(
    '/:id',
    pasteIdValidation,
    pasteController.getPaste
);

/**
 * @route   GET /api/pastes/:id/meta
 * @desc    Get paste metadata without incrementing view count
 * @access  Public
 */
router.get(
    '/:id/meta',
    pasteIdValidation,
    pasteController.getPasteMeta
);

/**
 * @route   DELETE /api/pastes/:id
 * @desc    Delete a paste by ID
 * @access  Public
 */
router.delete(
    '/:id',
    pasteIdValidation,
    pasteController.deletePaste
);

module.exports = router;
