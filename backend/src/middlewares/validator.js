/**
 * Request Validator Middleware
 * Validation middleware using express-validator
 */

const { body, param, validationResult } = require('express-validator');
const { MAX_CONTENT_LENGTH } = require('../config/constants');
const { sendValidationError } = require('../utils');

/**
 * Handle validation results
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));
        return sendValidationError(res, formattedErrors);
    }

    next();
};

/**
 * Validation rules for creating a paste
 */
const createPasteValidation = [
    body('content')
        .exists({ checkFalsy: true })
        .withMessage('Content is required')
        .isString()
        .withMessage('Content must be a string')
        .isLength({ min: 1, max: MAX_CONTENT_LENGTH })
        .withMessage(`Content must be between 1 and ${MAX_CONTENT_LENGTH} characters`)
        .trim(),

    body('title')
        .optional()
        .isString()
        .withMessage('Title must be a string')
        .isLength({ max: 255 })
        .withMessage('Title cannot exceed 255 characters')
        .trim(),

    body('syntax')
        .optional()
        .isString()
        .withMessage('Syntax must be a string')
        .isLength({ max: 50 })
        .withMessage('Syntax cannot exceed 50 characters'),

    body('expirationType')
        .optional()
        .isIn(['never', 'time', 'views', 'both'])
        .withMessage('Expiration type must be one of: never, time, views, both'),

    body('expirationMinutes')
        .optional()
        .isInt({ min: 1, max: 525600 })
        .withMessage('Expiration minutes must be between 1 and 525600 (1 year)'),

    body('maxViews')
        .optional()
        .isInt({ min: 1, max: 1000000 })
        .withMessage('Max views must be between 1 and 1,000,000'),

    handleValidation
];

/**
 * Validation rules for paste ID parameter
 */
const pasteIdValidation = [
    param('id')
        .exists()
        .withMessage('Paste ID is required')
        .isString()
        .withMessage('Paste ID must be a string')
        .isLength({ min: 6, max: 20 })
        .withMessage('Invalid paste ID format')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Paste ID can only contain alphanumeric characters'),

    handleValidation
];

module.exports = {
    handleValidation,
    createPasteValidation,
    pasteIdValidation
};
