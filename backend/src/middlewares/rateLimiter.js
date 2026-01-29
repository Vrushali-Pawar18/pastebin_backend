/**
 * Rate Limiter Middleware
 * Protects API from abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const { RATE_LIMIT, HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    message: {
        success: false,
        message: ERROR_MESSAGES.RATE_LIMITED,
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: ERROR_MESSAGES.RATE_LIMITED,
            retryAfter: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000),
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Stricter rate limiter for paste creation
 * Prevents spam paste creation
 */
const createPasteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 pastes per minute
    message: {
        success: false,
        message: 'Too many pastes created. Please wait before creating more.',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many pastes created. Please wait before creating more.',
            retryAfter: 60,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = {
    apiLimiter,
    createPasteLimiter
};
