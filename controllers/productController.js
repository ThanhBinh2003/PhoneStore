const Product = require('../models/product');

exports.index = async (req, res) => {
    try {
        let products = await Product.find();
        return res.json({ data: products });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

