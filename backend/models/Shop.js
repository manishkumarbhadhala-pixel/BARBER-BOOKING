const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // ✅ FIX: shopCode field explicitly map kiya shop_code se
  shopCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'shop_code', // DB column name
    set(value) {
      // ✅ Save karte time automatically uppercase ho jaye
      this.setDataValue('shopCode', value?.toUpperCase());
    },
  },
  location: {
    type: DataTypes.STRING(200),
    defaultValue: null,
  },
}, {
  tableName: 'shops',
  timestamps: true,
  underscored: true,
});

module.exports = Shop;