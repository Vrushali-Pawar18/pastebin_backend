/**
 * Database Configuration
 * Configures Sequelize ORM connection
 * Supports both PostgreSQL (production) and SQLite (development)
 */

const { Sequelize } = require('sequelize');
const path = require('path');

/**
 * Creates and configures the Sequelize instance
 * Uses DATABASE_URL for production (Neon Postgres) 
 * Falls back to SQLite for local development
 */
const createSequelizeInstance = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Use SQLite for local development if no DATABASE_URL is provided
  if (!databaseUrl || databaseUrl.includes('username:password')) {
    console.log('📦 Using SQLite database for local development');

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: nodeEnv === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true
      }
    });

    return sequelize;
  }

  // Use PostgreSQL for production
  console.log('🐘 Using PostgreSQL database');

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: nodeEnv === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });

  return sequelize;
};

const sequelize = createSequelizeInstance();

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

/**
 * Sync database models
 * @param {boolean} force - If true, drops existing tables (use carefully)
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
