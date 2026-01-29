/**
 * API Response Utility
 * Standardized response format for consistency
 */

const { HTTP_STATUS } = require('../config/constants');

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
    const response = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Additional error details
 */
const sendError = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
    const response = {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Send a not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Send a gone response (410) for expired resources
 * @param {Object} res - Express response object
 * @param {string} message - Gone message
 */
const sendGone = (res, message = 'Resource is no longer available') => {
    return sendError(res, message, HTTP_STATUS.GONE);
};

/**
 * Send a bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} errors - Validation errors
 */
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST, errors);
};

/**
 * Send a validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
const sendValidationError = (res, errors) => {
    return sendError(res, 'Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
};

module.exports = {
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendGone,
    sendBadRequest,
    sendValidationError
};
