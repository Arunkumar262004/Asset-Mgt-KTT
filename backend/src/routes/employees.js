const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getSingleEmployee);
router.post('/', employeeController.saveEmployeeDetails);
router.put('/:id', employeeController.updateEmployeeDetails);

module.exports = router;
