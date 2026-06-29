const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminRequest = sequelize.define('AdminRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  // ✅ FIX: shopId field zaroori hai — bina is ke approve karte waqt null jaata tha
  shopId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'shop_id',
  },
}, {
  tableName: 'admin_requests',
  timestamps: true,
  underscored: true,
});

module.exports = AdminRequest;