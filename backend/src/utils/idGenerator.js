/**
 * ID Generator Utility
 * Generates unique, URL-safe IDs for pastes
 */

const { customAlphabet } = require('nanoid');
const { PASTE_ID_LENGTH } = require('../config/constants');

// URL-safe alphabet (excludes confusing characters like 0, O, l, 1)
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique paste ID
 * @param {number} length - Length of the ID (default: PASTE_ID_LENGTH)
 * @returns {string} - Generated ID
 */
const generatePasteId = customAlphabet(ALPHABET, PASTE_ID_LENGTH);

/**
 * Generate a custom length ID
 * @param {number} length - Desired length
 * @returns {string} - Generated ID
 */
const generateCustomId = (length) => {
    const generator = customAlphabet(ALPHABET, length);
    return generator();
};

/**
 * Validate if a string is a valid paste ID format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid
 */
const isValidPasteId = (id) => {
    if (typeof id !== 'string') return false;
    if (id.length !== PASTE_ID_LENGTH) return false;
    return /^[a-zA-Z0-9]+$/.test(id);
};

module.exports = {
    generatePasteId,
    generateCustomId,
    isValidPasteId
};
