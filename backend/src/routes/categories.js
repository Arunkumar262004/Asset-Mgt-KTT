const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.editCategory);

module.exports = router;
