/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
    // Paste ID configuration
    PASTE_ID_LENGTH: 8,

    // Content limits
    MAX_CONTENT_LENGTH: 512000, // 500KB
    MIN_CONTENT_LENGTH: 1,

    // Expiration options
    EXPIRATION_TYPES: {
        NEVER: 'never',
        TIME: 'time',
        VIEWS: 'views',
        BOTH: 'both'
    },

    // Time-based expiration options (in minutes)
    TIME_OPTIONS: {
        TEN_MINUTES: 10,
        ONE_HOUR: 60,
        ONE_DAY: 1440,
        ONE_WEEK: 10080,
        ONE_MONTH: 43200
    },

    // View-based expiration options
    VIEW_OPTIONS: {
        ONE: 1,
        TEN: 10,
        HUNDRED: 100,
        THOUSAND: 1000
    },

    // Rate limiting
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        GONE: 410,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500
    },

    // Error messages
    ERROR_MESSAGES: {
        PASTE_NOT_FOUND: 'Paste not found',
        PASTE_EXPIRED: 'This paste has expired',
        PASTE_EXPIRED_VIEWS: 'This paste has reached its maximum view count',
        PASTE_EXPIRED_TIME: 'This paste has expired due to time limit',
        INVALID_CONTENT: 'Content is required and must be a non-empty string',
        CONTENT_TOO_LONG: 'Content exceeds maximum length',
        INVALID_EXPIRATION: 'Invalid expiration configuration',
        SERVER_ERROR: 'An unexpected error occurred',
        RATE_LIMITED: 'Too many requests, please try again later'
    },

    // Success messages
    SUCCESS_MESSAGES: {
        PASTE_CREATED: 'Paste created successfully',
        PASTE_RETRIEVED: 'Paste retrieved successfully',
        PASTE_DELETED: 'Paste deleted successfully'
    }
};
