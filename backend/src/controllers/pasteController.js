/**
 * Paste Controller
 * Handles HTTP requests for paste operations
 */

const { pasteService } = require('../services');
const {
    sendSuccess,
    sendCreated,
    sendNotFound,
    sendGone,
    sendBadRequest
} = require('../utils');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, HTTP_STATUS } = require('../config/constants');

/**
 * Create a new paste
 * POST /api/pastes
 */
const createPaste = async (req, res, next) => {
    try {
        const {
            content,
            title,
            syntax,
            expirationType,
            expirationMinutes,
            maxViews
        } = req.body;

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return sendBadRequest(res, ERROR_MESSAGES.INVALID_CONTENT);
        }

        // Create paste
        const paste = await pasteService.createPaste({
            content: content.trim(),
            title: title?.trim(),
            syntax,
            expirationType,
            expirationMinutes: expirationMinutes ? parseInt(expirationMinutes, 10) : undefined,
            maxViews: maxViews ? parseInt(maxViews, 10) : undefined
        });

        return sendCreated(res, paste, SUCCESS_MESSAGES.PASTE_CREATED);
    } catch (error) {
        // Handle validation errors from service
        if (error.message.includes('Invalid') || error.message.includes('must be')) {
            return sendBadRequest(res, error.message);
        }
        next(error);
    }
};

/**
 * Get a paste by ID
 * GET /api/pastes/:id
 */
const getPaste = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || id.length < 6) {
            return sendBadRequest(res, 'Invalid paste ID');
        }

        const result = await pasteService.getPasteById(id);

        if (!result.found) {
            return sendNotFound(res, ERROR_MESSAGES.PASTE_NOT_FOUND);
        }

        if (result.expired) {
            const message = result.reason === 'views'
                ? ERROR_MESSAGES.PASTE_EXPIRED_VIEWS
                : ERROR_MESSAGES.PASTE_EXPIRED_TIME;
            return sendGone(res, message);
        }

        // Include info if this was the last allowed view
        const responseData = result.data;
        if (result.lastView) {
            responseData.lastView = true;
            responseData.message = 'This was the last allowed view. The paste will expire after this.';
        }

        return sendSuccess(res, responseData, SUCCESS_MESSAGES.PASTE_RETRIEVED);
    } catch (error) {
        next(error);
    }
};

/**
 * Get paste metadata without incrementing view count
 * GET /api/pastes/:id/meta
 */
const getPasteMeta = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || id.length < 6) {
            return sendBadRequest(res, 'Invalid paste ID');
        }

        const result = await pasteService.getPasteMetadata(id);

        if (!result.found) {
            return sendNotFound(res, ERROR_MESSAGES.PASTE_NOT_FOUND);
        }

        if (result.expired) {
            const message = result.reason === 'views'
                ? ERROR_MESSAGES.PASTE_EXPIRED_VIEWS
                : ERROR_MESSAGES.PASTE_EXPIRED_TIME;
            return sendGone(res, message);
        }

        // Return only metadata, not content
        const { content, ...metadata } = result.data;
        return sendSuccess(res, metadata, 'Paste metadata retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a paste by ID
 * DELETE /api/pastes/:id
 */
const deletePaste = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || id.length < 6) {
            return sendBadRequest(res, 'Invalid paste ID');
        }

        const deleted = await pasteService.deletePaste(id);

        if (!deleted) {
            return sendNotFound(res, ERROR_MESSAGES.PASTE_NOT_FOUND);
        }

        return sendSuccess(res, { id }, SUCCESS_MESSAGES.PASTE_DELETED);
    } catch (error) {
        next(error);
    }
};

/**
 * Get paste statistics
 * GET /api/pastes/stats
 */
const getStats = async (req, res, next) => {
    try {
        const stats = await pasteService.getStats();
        return sendSuccess(res, stats, 'Statistics retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * Health check for paste service
 * GET /api/pastes/health
 */
const healthCheck = async (req, res) => {
    return sendSuccess(res, {
        status: 'healthy',
        service: 'paste'
    }, 'Paste service is healthy');
};

module.exports = {
    createPaste,
    getPaste,
    getPasteMeta,
    deletePaste,
    getStats,
    healthCheck
};
