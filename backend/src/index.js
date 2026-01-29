/**
 * Application Entry Point
 * Starts the Express server with database connection
 */

require('dotenv').config();

const createApp = require('./app');
const { testConnection, syncDatabase } = require('./config');

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize and start the server
 */
const startServer = async () => {
    try {
        console.log('🚀 Starting Pastebin API Server...');
        console.log(`📍 Environment: ${NODE_ENV}`);

        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Sync database models
        const isSynced = await syncDatabase(false);
        if (!isSynced) {
            console.error('❌ Failed to sync database. Exiting...');
            process.exit(1);
        }

        // Create Express app
        const app = createApp();

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(() => {
                console.log('✅ HTTP server closed.');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                console.error('❌ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
