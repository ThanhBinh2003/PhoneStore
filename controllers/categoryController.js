const Category = require('../models/category');

exports.index = async (req, res) => {
    try {
        let categories = await Category.find();
        return res.json({ data: categories });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
