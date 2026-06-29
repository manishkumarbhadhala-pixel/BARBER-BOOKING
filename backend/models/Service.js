const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // unique: true,
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'display_name',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    field: 'duration_minutes',
  },
  // Naya Column Jo Tune Bola:
  barberId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'barber_id',
  },
}, {
  tableName: 'services',
  timestamps: true,
  underscored: true,
});

module.exports = Service;