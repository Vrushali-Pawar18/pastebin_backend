/**
 * Expiration Calculator Utility
 * Calculates expiration dates based on different configurations
 */

const { TIME_OPTIONS } = require('../config/constants');

/**
 * Calculate expiration date from minutes
 * @param {number} minutes - Number of minutes until expiration
 * @returns {Date} - Expiration date
 */
const calculateExpirationFromMinutes = (minutes) => {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60 * 1000);
};

/**
 * Get expiration date from preset option
 * @param {string} option - Preset option key (e.g., 'ONE_HOUR')
 * @returns {Date|null} - Expiration date or null if invalid
 */
const getExpirationFromPreset = (option) => {
    const minutes = TIME_OPTIONS[option];
    if (!minutes) return null;
    return calculateExpirationFromMinutes(minutes);
};

/**
 * Validate expiration configuration
 * @param {Object} config - Expiration configuration
 * @param {string} config.type - 'never', 'time', 'views', or 'both'
 * @param {number} [config.minutes] - Minutes until expiration (for time/both)
 * @param {number} [config.maxViews] - Max view count (for views/both)
 * @returns {Object} - { valid: boolean, error?: string, data?: Object }
 */
const validateExpirationConfig = (config) => {
    const { type, minutes, maxViews } = config;

    // Validate type
    const validTypes = ['never', 'time', 'views', 'both'];
    if (!validTypes.includes(type)) {
        return {
            valid: false,
            error: `Invalid expiration type. Must be one of: ${validTypes.join(', ')}`
        };
    }

    const result = {
        valid: true,
        data: {
            expiration_type: type,
            expires_at: null,
            max_views: null
        }
    };

    // Handle time-based expiration
    if (type === 'time' || type === 'both') {
        if (!minutes || typeof minutes !== 'number' || minutes <= 0) {
            return {
                valid: false,
                error: 'Minutes must be a positive number for time-based expiration'
            };
        }
        // Max 1 year
        if (minutes > 525600) {
            return {
                valid: false,
                error: 'Expiration time cannot exceed 1 year (525600 minutes)'
            };
        }
        result.data.expires_at = calculateExpirationFromMinutes(minutes);
    }

    // Handle view-based expiration
    if (type === 'views' || type === 'both') {
        if (!maxViews || typeof maxViews !== 'number' || maxViews <= 0) {
            return {
                valid: false,
                error: 'Max views must be a positive number for view-based expiration'
            };
        }
        if (maxViews > 1000000) {
            return {
                valid: false,
                error: 'Max views cannot exceed 1,000,000'
            };
        }
        result.data.max_views = Math.floor(maxViews);
    }

    return result;
};

/**
 * Format remaining time for display
 * @param {number} milliseconds - Remaining time in milliseconds
 * @returns {string} - Formatted string (e.g., "2 hours, 30 minutes")
 */
const formatRemainingTime = (milliseconds) => {
    if (milliseconds <= 0) return 'Expired';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? `, ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''}`;
    }
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? `, ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
};

module.exports = {
    calculateExpirationFromMinutes,
    getExpirationFromPreset,
    validateExpirationConfig,
    formatRemainingTime
};
