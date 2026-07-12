const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Coimbatore'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'In Stock',
    validate: {
      isIn: [['In Stock', 'Issued', 'Scraped']]
    }
  },
  currentEmployeeId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Asset;
