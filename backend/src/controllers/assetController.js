const { Op } = require('sequelize');
const { Asset, AssetCategory, Employee, AssetHistory, sequelize } = require('../models');

// fetch all assets with search and category filters, hiding Scraped status by default
exports.getAllAssets = async (req, res) => {
  try {
    const { categoryId, search, includeScraped } = req.query;
    const filterOptions = {};

    // by default we don't show scraped assets
    if (includeScraped === 'true') {
      // get all
    } else {
      filterOptions.status = { [Op.ne]: 'Scraped' };
    }

    if (categoryId) {
      filterOptions.categoryId = categoryId;
    }

    if (search) {
      filterOptions[Op.or] = [
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { assetCode: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const assetsList = await Asset.findAll({
      where: filterOptions,
      include: [
        { model: AssetCategory, as: 'category', attributes: ['name'] },
        { model: Employee, as: 'currentEmployee', attributes: ['name', 'employeeCode'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json(assetsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// fetch all assets in stock (ready to allocate)
exports.getInStockAssets = async (req, res) => {
  try {
    const assetsList = await Asset.findAll({
      where: { status: 'In Stock' },
      include: [
        { model: AssetCategory, as: 'category', attributes: ['name'] }
      ],
      order: [['id', 'ASC']]
    });
    res.json(assetsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// calculate stock totals grouped by branch location
exports.getBranchWiseStockStats = async (req, res) => {
  try {
    const assetsList = await Asset.findAll({
      where: { status: 'In Stock' }
    });

    const branchTotals = {};
    let grandTotalValue = 0;
    let grandTotalCount = 0;

    assetsList.forEach(asset => {
      const branchLoc = asset.branch || 'Coimbatore';
      const assetVal = parseFloat(asset.value) || 0;
      
      if (!branchTotals[branchLoc]) {
        branchTotals[branchLoc] = { count: 0, value: 0 };
      }
      branchTotals[branchLoc].count += 1;
      branchTotals[branchLoc].value += assetVal;
      
      grandTotalCount += 1;
      grandTotalValue += assetVal;
    });

    res.json({
      branchTotals: Object.entries(branchTotals).map(([name, stats]) => ({
        branch: name,
        count: stats.count,
        value: stats.value.toFixed(2)
      })),
      grandTotal: {
        count: grandTotalCount,
        value: grandTotalValue.toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// fetch single asset details with logs
exports.getSingleAssetDetails = async (req, res) => {
  try {
    const assetId = req.params.id;
    const assetObj = await Asset.findByPk(assetId, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' },
        { model: AssetHistory, as: 'history', include: [{ model: Employee, as: 'employee', attributes: ['name', 'employeeCode'] }] }
      ],
      order: [[{ model: AssetHistory, as: 'history' }, 'actionDate', 'DESC']]
    });
    if (!assetObj) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(assetObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// create a new asset record
exports.addNewAsset = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { assetCode, serialNumber, categoryId, make, model, purchaseDate, value, branch } = req.body;

    const assetObj = await Asset.create({
      assetCode,
      serialNumber,
      categoryId,
      make,
      model,
      purchaseDate,
      value,
      branch: branch || 'Coimbatore',
      status: 'In Stock'
    }, { transaction: t });

    // log purchase transaction in audit history
    await AssetHistory.create({
      assetId: assetObj.id,
      actionType: 'Purchase',
      actionDate: new Date(),
      notes: `Initial purchase of asset. Value: ${value}.`
    }, { transaction: t });

    await t.commit();
    
    // send back fully populated asset object
    const populatedAsset = await Asset.findByPk(assetObj.id, {
      include: [{ model: AssetCategory, as: 'category' }]
    });
    res.status(201).json(populatedAsset);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Asset Code or Serial Number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// update asset details in database
exports.updateAssetDetails = async (req, res) => {
  try {
    const assetId = req.params.id;
    const { assetCode, serialNumber, categoryId, make, model, purchaseDate, value, branch } = req.body;
    const assetObj = await Asset.findByPk(assetId);

    if (!assetObj) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await assetObj.update({
      assetCode: assetCode || assetObj.assetCode,
      serialNumber: serialNumber || assetObj.serialNumber,
      categoryId: categoryId || assetObj.categoryId,
      make: make || assetObj.make,
      model: model || assetObj.model,
      purchaseDate: purchaseDate || assetObj.purchaseDate,
      value: value || assetObj.value,
      branch: branch || assetObj.branch
    });

    res.json(assetObj);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Asset Code or Serial Number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};
