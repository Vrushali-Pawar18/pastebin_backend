/**
 * Middlewares Index
 * Exports all middleware modules
 */

const { errorHandler, notFoundHandler } = require('./errorHandler');
const { handleValidation, createPasteValidation, pasteIdValidation } = require('./validator');
const { apiLimiter, createPasteLimiter } = require('./rateLimiter');

module.exports = {
    errorHandler,
    notFoundHandler,
    handleValidation,
    createPasteValidation,
    pasteIdValidation,
    apiLimiter,
    createPasteLimiter
};
