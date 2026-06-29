const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    defaultValue: 'customer',
  },
  shopId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'shop_id',
  },
  upiId: {
    type: DataTypes.STRING(100),
    defaultValue: null,
    field: 'upi_id',
  },
  upiEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'upi_enabled',
  },
  // Naye Account Status aur Suspension fields yahan add kiye hain
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
  },
  suspendedReason: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'suspended_reason',
  },
  paymentDueDate: {
    type: DataTypes.DATEONLY,
    defaultValue: null,
    field: 'payment_due_date',
  },
  suspensionContact: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'suspension_contact',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true, // camelCase → snake_case automatically
  hooks: {
    // Save se pehle password hash karo
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Password compare method
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;