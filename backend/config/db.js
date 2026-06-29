// MySQL se connection
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // database name
  process.env.DB_USER,      // username
  process.env.DB_PASSWORD,  // password
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // SQL queries terminal me mat dikhao
  }
);

// Connection test karo
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected!');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };