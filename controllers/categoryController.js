const Category = require('../models/category');

exports.index = async (req, res) => {
    try {
        let categories = await Category.find();
        return res.json({ data: categories });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.store = async (req, res) => {
    try {
        let category = new Category(req.body);
        await category.save();
        return res.status(200).json({ data: category });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        category.name = req.body.name;
        category.description = req.body.description;
        await category.save();
        return res.status(200).json({ data: category });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Deleted successfully', status: 'ok' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};