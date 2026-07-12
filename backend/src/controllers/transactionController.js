const { Asset, Employee, AssetHistory, sequelize } = require('../models');

// Allocate an asset to an active employee
exports.allocateAssetToEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { assetId, employeeId, notes } = req.body;

    if (!assetId || !employeeId) {
      return res.status(400).json({ error: 'Asset ID and Employee ID are required' });
    }

    // check if asset is available in stock
    const assetObj = await Asset.findByPk(assetId);
    if (!assetObj) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (assetObj.status !== 'In Stock') {
      return res.status(400).json({ error: `Asset is currently ${assetObj.status} and cannot be issued.` });
    }

    // check if employee is active in list
    const empObj = await Employee.findByPk(employeeId);
    if (!empObj) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    if (empObj.status !== 'Active') {
      return res.status(400).json({ error: 'Cannot allocate asset to an Inactive employee.' });
    }

    // update asset properties
    await assetObj.update({
      status: 'Issued',
      currentEmployeeId: employeeId
    }, { transaction: t });

    // create timeline log
    await AssetHistory.create({
      assetId,
      employeeId,
      actionType: 'Issue',
      actionDate: new Date(),
      notes: notes || 'Asset allocated to employee.'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Asset issued successfully', asset: assetObj });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Return an asset back to warehouse stock
exports.returnAssetToStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { assetId, reason, notes } = req.body;

    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    // check if asset exists
    const assetObj = await Asset.findByPk(assetId);
    if (!assetObj) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (assetObj.status !== 'Issued') {
      return res.status(400).json({ error: 'Asset is not currently issued to anyone.' });
    }

    const empId = assetObj.currentEmployeeId;

    // update asset status back to in stock
    await assetObj.update({
      status: 'In Stock',
      currentEmployeeId: null
    }, { transaction: t });

    // log returned history
    await AssetHistory.create({
      assetId,
      employeeId: empId,
      actionType: 'Return',
      actionDate: new Date(),
      reason: reason || 'Return',
      notes: notes || 'Asset returned to stock.'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Asset returned successfully', asset: assetObj });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Scrap an asset to write off
exports.scrapAssetObsolete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { assetId, reason, notes } = req.body;

    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    // check asset object
    const assetObj = await Asset.findByPk(assetId);
    if (!assetObj) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (assetObj.status === 'Scraped') {
      return res.status(400).json({ error: 'Asset is already marked as scraped/obsolete.' });
    }

    const prevEmpId = assetObj.currentEmployeeId;

    // write off asset to scraped status
    await assetObj.update({
      status: 'Scraped',
      currentEmployeeId: null
    }, { transaction: t });

    // log write off
    await AssetHistory.create({
      assetId,
      employeeId: prevEmpId,
      actionType: 'Scrap',
      actionDate: new Date(),
      reason: reason || 'Obsolete',
      notes: notes || 'Asset marked as scrap.'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Asset marked as scrap successfully', asset: assetObj });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Get timeline movement history of a specific asset
exports.getAssetMovementHistory = async (req, res) => {
  try {
    const targetAssetId = req.params.assetId;
    const movementLogs = await AssetHistory.findAll({
      where: { assetId: targetAssetId },
      include: [
        { model: Employee, as: 'employee', attributes: ['name', 'employeeCode'] },
        { model: Asset, as: 'asset', attributes: ['assetCode', 'serialNumber', 'make', 'model'] }
      ],
      order: [['actionDate', 'DESC']]
    });
    res.json(movementLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// fetch all operations logs (for audit log reports)
exports.getAllTransactionLogs = async (req, res) => {
  try {
    const logsList = await AssetHistory.findAll({
      include: [
        { model: Employee, as: 'employee', attributes: ['name', 'employeeCode'] },
        { model: Asset, as: 'asset', attributes: ['assetCode', 'serialNumber', 'make', 'model'] }
      ],
      order: [['actionDate', 'DESC']]
    });
    res.json(logsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
