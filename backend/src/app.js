/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { errorHandler, notFoundHandler, apiLimiter } = require('./middlewares');

/**
 * Create and configure Express application
 */
const createApp = () => {
    const app = express();

    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));

    // CORS configuration
    const corsOptions = {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
    };
    app.use(cors(corsOptions));

    // Body parsing middleware
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Rate limiting
    app.use('/api', apiLimiter);

    // API routes
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Pastebin API Server',
            version: '1.0.0',
            documentation: '/api',
            timestamp: new Date().toISOString()
        });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

module.exports = createApp;
