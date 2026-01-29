/**
 * Routes Index
 * Exports all route modules
 */

const express = require('express');
const pasteRoutes = require('./pasteRoutes');
const { sendSuccess } = require('../utils');

const router = express.Router();

/**
 * API Root endpoint
 */
router.get('/', (req, res) => {
    sendSuccess(res, {
        name: 'Pastebin API',
        version: '1.0.0',
        endpoints: {
            pastes: '/api/pastes',
            health: '/api/health'
        }
    }, 'Welcome to Pastebin API');
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    sendSuccess(res, {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    }, 'API is healthy');
});

/**
 * Mount routes
 */
router.use('/pastes', pasteRoutes);

module.exports = router;
