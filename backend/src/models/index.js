const sequelize = require('../config/database');
const Employee = require('./employee');
const AssetCategory = require('./category');
const Asset = require('./asset');
const AssetHistory = require('./assetHistory');

// Associations

// Asset <-> AssetCategory
AssetCategory.hasMany(Asset, { foreignKey: 'categoryId', as: 'assets' });
Asset.belongsTo(AssetCategory, { foreignKey: 'categoryId', as: 'category' });

// Asset <-> Employee (Current Allocation)
Employee.hasMany(Asset, { foreignKey: 'currentEmployeeId', as: 'assets' });
Asset.belongsTo(Employee, { foreignKey: 'currentEmployeeId', as: 'currentEmployee' });

// AssetHistory associations
Asset.hasMany(AssetHistory, { foreignKey: 'assetId', as: 'history' });
AssetHistory.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });

Employee.hasMany(AssetHistory, { foreignKey: 'employeeId', as: 'history' });
AssetHistory.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

module.exports = {
  sequelize,
  Employee,
  AssetCategory,
  Asset,
  AssetHistory
};
