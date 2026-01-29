/**
 * Paste Service
 * Business logic layer for paste operations
 */

const { Paste } = require('../models');
const {
    generatePasteId,
    validateExpirationConfig
} = require('../utils');
const { ERROR_MESSAGES, EXPIRATION_TYPES } = require('../config/constants');

/**
 * Create a new paste
 * @param {Object} pasteData - Paste creation data
 * @param {string} pasteData.content - Paste content
 * @param {string} [pasteData.title] - Optional title
 * @param {string} [pasteData.syntax] - Syntax highlighting language
 * @param {string} [pasteData.expirationType] - 'never', 'time', 'views', 'both'
 * @param {number} [pasteData.expirationMinutes] - Minutes until expiration
 * @param {number} [pasteData.maxViews] - Maximum view count
 * @returns {Promise<Object>} - Created paste data
 */
const createPaste = async (pasteData) => {
    const {
        content,
        title = 'Untitled',
        syntax = 'plaintext',
        expirationType = EXPIRATION_TYPES.NEVER,
        expirationMinutes,
        maxViews
    } = pasteData;

    // Validate expiration config
    const expirationValidation = validateExpirationConfig({
        type: expirationType,
        minutes: expirationMinutes,
        maxViews: maxViews
    });

    if (!expirationValidation.valid) {
        throw new Error(expirationValidation.error);
    }

    // Generate unique ID
    let id = generatePasteId();
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure ID is unique (collision is rare but possible)
    while (attempts < maxAttempts) {
        const existing = await Paste.findByPk(id);
        if (!existing) break;
        id = generatePasteId();
        attempts++;
    }

    if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique paste ID. Please try again.');
    }

    // Create paste
    const paste = await Paste.create({
        id,
        content,
        title,
        syntax,
        expiration_type: expirationValidation.data.expiration_type,
        expires_at: expirationValidation.data.expires_at,
        max_views: expirationValidation.data.max_views,
        view_count: 0
    });

    return paste.toSafeJSON();
};

/**
 * Get a paste by ID
 * @param {string} id - Paste ID
 * @param {boolean} incrementView - Whether to increment view count
 * @returns {Promise<Object|null>} - Paste data or null if not found/expired
 */
const getPasteById = async (id, incrementView = true) => {
    const paste = await Paste.findByPk(id);

    if (!paste) {
        return { found: false, expired: false, data: null };
    }

    // Check for time expiration first
    if (paste.isTimeExpired()) {
        return {
            found: true,
            expired: true,
            reason: 'time',
            data: null
        };
    }

    // Check for view expiration
    if (paste.isViewExpired()) {
        return {
            found: true,
            expired: true,
            reason: 'views',
            data: null
        };
    }

    // Increment view count if requested
    if (incrementView) {
        const incrementResult = await paste.incrementView();

        // After incrementing, check if now expired (this was the last view)
        if (incrementResult.expired) {
            // Still return the data for this last view
            return {
                found: true,
                expired: false,
                lastView: true,
                data: paste.toSafeJSON()
            };
        }
    }

    return {
        found: true,
        expired: false,
        data: paste.toSafeJSON()
    };
};

/**
 * Get paste metadata without incrementing view count
 * @param {string} id - Paste ID
 * @returns {Promise<Object|null>}
 */
const getPasteMetadata = async (id) => {
    return getPasteById(id, false);
};

/**
 * Delete a paste by ID
 * @param {string} id - Paste ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
const deletePaste = async (id) => {
    const paste = await Paste.findByPk(id);

    if (!paste) {
        return false;
    }

    await paste.destroy();
    return true;
};

/**
 * Clean up expired pastes
 * @returns {Promise<number>} - Number of deleted pastes
 */
const cleanupExpiredPastes = async () => {
    const { Op } = require('sequelize');

    const result = await Paste.destroy({
        where: {
            [Op.or]: [
                // Time expired
                {
                    expires_at: {
                        [Op.ne]: null,
                        [Op.lt]: new Date()
                    }
                },
                // View expired (max_views reached)
                {
                    max_views: {
                        [Op.ne]: null
                    },
                    [Op.and]: Paste.sequelize.literal('view_count >= max_views')
                }
            ]
        }
    });

    return result;
};

/**
 * Get paste count statistics
 * @returns {Promise<Object>}
 */
const getStats = async () => {
    const totalPastes = await Paste.count();
    const activePastes = await Paste.count({
        where: {
            [require('sequelize').Op.or]: [
                { expires_at: null, max_views: null },
                {
                    expires_at: {
                        [require('sequelize').Op.gt]: new Date()
                    }
                }
            ]
        }
    });

    return {
        total: totalPastes,
        active: activePastes
    };
};

module.exports = {
    createPaste,
    getPasteById,
    getPasteMetadata,
    deletePaste,
    cleanupExpiredPastes,
    getStats
};
