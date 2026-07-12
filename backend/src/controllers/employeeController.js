const { Employee, Asset } = require('../models');

// get all employees from db. filtering status optionally
exports.getAllEmployees = async (req, res) => {
  try {
    const { status } = req.query;
    const filterOptions = {};
    if (status) {
      filterOptions.status = status;
    }
    const employeesList = await Employee.findAll({ where: filterOptions, order: [['id', 'ASC']] });
    res.json(employeesList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single employee details using ID
exports.getSingleEmployee = async (req, res) => {
  try {
    const empId = req.params.id;
    const singleEmp = await Employee.findByPk(empId, {
      include: [{ model: Asset, as: 'assets' }]
    });
    if (!singleEmp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(singleEmp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// add new employee details to DB
exports.saveEmployeeDetails = async (req, res) => {
  try {
    const { name, email, branch, status } = req.body;
    
    // auto generating code if not typed by user
    const empCodeVal = req.body.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmp = await Employee.create({
      employeeCode: empCodeVal,
      name,
      email,
      branch,
      status: status || 'Active'
    });
    res.status(201).json(newEmp);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Employee Code or Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// update employee details
exports.updateEmployeeDetails = async (req, res) => {
  try {
    const empId = req.params.id;
    const { name, email, branch, status, employeeCode } = req.body;
    const empObj = await Employee.findByPk(empId);
    
    if (!empObj) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await empObj.update({
      employeeCode: employeeCode || empObj.employeeCode,
      name: name || empObj.name,
      email: email || empObj.email,
      branch: branch || empObj.branch,
      status: status || empObj.status
    });

    res.json(empObj);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Employee Code or Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};
