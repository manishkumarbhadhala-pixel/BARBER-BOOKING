const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by', // DB column name match karne ke liye
  },
  barberId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'barber_id',
  },
  type: {
    type: DataTypes.ENUM('superadmin', 'barber'),
    defaultValue: 'superadmin',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'announcements',
  timestamps: true,
  underscored: true, // created_at, updated_at formatting ke liye
});

module.exports = Announcement;