const express = require('express');
const router = express.Router();

const employeeRoutes = require('./employees');
const categoryRoutes = require('./categories');
const assetRoutes = require('./assets');
const transactionRoutes = require('./transactions');

router.use('/employees', employeeRoutes);
router.use('/categories', categoryRoutes);
router.use('/assets', assetRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
