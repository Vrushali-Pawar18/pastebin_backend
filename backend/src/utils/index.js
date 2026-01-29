/**
 * Utils Index
 * Exports all utility modules
 */

const { generatePasteId, generateCustomId, isValidPasteId } = require('./idGenerator');
const {
    calculateExpirationFromMinutes,
    getExpirationFromPreset,
    validateExpirationConfig,
    formatRemainingTime
} = require('./expirationCalculator');
const {
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendGone,
    sendBadRequest,
    sendValidationError
} = require('./apiResponse');

module.exports = {
    // ID Generator
    generatePasteId,
    generateCustomId,
    isValidPasteId,

    // Expiration Calculator
    calculateExpirationFromMinutes,
    getExpirationFromPreset,
    validateExpirationConfig,
    formatRemainingTime,

    // API Response
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendGone,
    sendBadRequest,
    sendValidationError
};
