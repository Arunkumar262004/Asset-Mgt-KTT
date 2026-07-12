const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAllAssets);
router.get('/stock', assetController.getInStockAssets);
router.get('/stats', assetController.getBranchWiseStockStats);
router.get('/:id', assetController.getSingleAssetDetails);
router.post('/', assetController.addNewAsset);
router.put('/:id', assetController.updateAssetDetails);

module.exports = router;
