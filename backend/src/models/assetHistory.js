const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetHistory = sequelize.define('AssetHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Purchase', 'Issue', 'Return', 'Scrap']]
    }
  },
  actionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'AssetHistories'
});

module.exports = AssetHistory;
