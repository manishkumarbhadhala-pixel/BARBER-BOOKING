const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkingHours = sequelize.define('WorkingHours', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Naya Column Jo Tune Bola:
  barberId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'barber_id',
  },
  startTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: '09:00',
    field: 'start_time',
  },
  endTime: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: '18:00',
    field: 'end_time',
  },
  breakStart: {
    type: DataTypes.STRING(5),
    defaultValue: null,
    field: 'break_start',
  },
  breakEnd: {
    type: DataTypes.STRING(5),
    defaultValue: null,
    field: 'break_end',
  },
  // "0,6" = Sunday aur Saturday off — comma separated store hoga
  offDays: {
    type: DataTypes.STRING(50),
    defaultValue: '0',
    field: 'off_days',
  },
}, {
  tableName: 'working_hours',
  timestamps: true,
  underscored: true,
});

module.exports = WorkingHours;