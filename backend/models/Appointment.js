const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id',
  },
  shopId: {
  type: DataTypes.INTEGER,
  defaultValue: null,
  field: 'shop_id',
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'customer_name',
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'service_id',
  },
  serviceName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'service_name',
  },
  slotStart: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'slot_start',
  },
  slotEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'slot_end',
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed',
  },
  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_cancelled',
  },
  // NEW: Barber ID add ki gayi h
  barberId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'barber_id', // DB column name
  },
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
});

module.exports = Appointment;