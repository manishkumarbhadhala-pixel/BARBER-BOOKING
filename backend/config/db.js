// MySQL se connection
// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,      // database name
//   process.env.DB_USER,      // username
//   process.env.DB_PASSWORD,  // password
//   {
//     host: process.env.DB_HOST,
//      port: process.env.DB_PORT,
//     dialect: 'mysql',
//     logging: false, // SQL queries terminal me mat dikhao
//   }
// );

// // Connection test karo
// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ MySQL Connected!');
//   } catch (error) {
//     console.error('❌ MySQL Connection Error:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { sequelize, connectDB };


// for aiven set up

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected!');
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
  }
};

module.exports = { sequelize, connectDB };