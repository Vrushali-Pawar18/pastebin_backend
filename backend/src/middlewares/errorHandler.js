/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
};

/**
 * Global Error Handler
 * Handles all unhandled errors
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation error',
            errors,
            timestamp: new Date().toISOString()
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Duplicate entry error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: `${e.path} must be unique`
            })),
            timestamp: new Date().toISOString()
        });
    }

    // Sequelize database connection errors
    if (err.name === 'SequelizeConnectionError') {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Database connection error',
            timestamp: new Date().toISOString()
        });
    }

    // JSON parse errors
    if (err.type === 'entity.parse.failed') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Invalid JSON in request body',
            timestamp: new Date().toISOString()
        });
    }

    // Default error response
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = process.env.NODE_ENV === 'production'
        ? ERROR_MESSAGES.SERVER_ERROR
        : err.message || ERROR_MESSAGES.SERVER_ERROR;

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
