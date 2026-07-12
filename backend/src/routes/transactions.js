const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/issue', transactionController.allocateAssetToEmployee);
router.post('/return', transactionController.returnAssetToStock);
router.post('/scrap', transactionController.scrapAssetObsolete);
router.get('/history/:assetId', transactionController.getAssetMovementHistory);
router.get('/logs', transactionController.getAllTransactionLogs);

module.exports = router;
