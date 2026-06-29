const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuickNote = sequelize.define('QuickNote', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  content: { type: DataTypes.TEXT, defaultValue: null },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
}, {
  tableName: 'quick_notes',
  timestamps: true,
  underscored: true,
});

module.exports = QuickNote;