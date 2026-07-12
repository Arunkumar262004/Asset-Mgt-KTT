const { AssetCategory } = require('../models');

// get all categories from db
exports.getAllCategories = async (req, res) => {
  try {
    const catsList = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.json(catsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// create a new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newCat = await AssetCategory.create({ name, description });
    res.status(201).json(newCat);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// edit existing category
exports.editCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const { name, description } = req.body;
    const catObj = await AssetCategory.findByPk(catId);
    
    if (!catObj) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await catObj.update({
      name: name || catObj.name,
      description: description !== undefined ? description : catObj.description
    });

    res.json(catObj);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};
