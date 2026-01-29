/**
 * Config Index
 * Exports all configuration modules
 */

const { sequelize, testConnection, syncDatabase } = require('./database');
const constants = require('./constants');

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
    constants
};
