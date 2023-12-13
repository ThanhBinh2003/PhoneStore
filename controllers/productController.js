const Product = require('../models/product');
const moment = require('moment');

const getProductWithCategory = async (search) => {
    let result = await Product
        .aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $match: {
                    $or: [
                        { 'name': search ? { $regex: search, $options: 'i' } : { $ne: null } },
                        { 'barCode': search ? { $regex: search, $options: 'i' } : { $ne: null } },
                    ]
                }
            },
        ])
        .exec();
    return result
}
exports.index = async (req, res) => {
    try {
        const search = req.query.search
        let result = []
        if (search) {
            result = await getProductWithCategory(search)
        } else {
            result = await getProductWithCategory()
        }

        // delete costPrice if role != admin
        const data = result.map(item => {
            if (req.user.role !== 'admin') {
                delete item.costPrice
            }
            return item
        })
        res.status(200).json({ data: data });
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: e.message });
    }
}

exports.detail = async (req, res) => {
    try {

        // find product by slug
        const result = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $match: { _id: req.params._id }
            },
            {
                $limit: 1
            },
        ]).exec();
        const data = result.map(item => {
            if (req.user.role !== 'admin') {
                delete item.costPrice
            }
            return item
        })
        const product = data[0];
        if (!product) {
            return res.redirect('/notfound');
        }
        res.status(200).json({ data: product });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

const { ObjectId } = require("mongodb");
exports.store = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            categoryId: new ObjectId(req.body.categoryId),
            createdAt: moment().format('MM/DD/YYYY, hh:mm:ss'),
        });
        await product.save();
        res.status(200).json({ data: product, message: 'Created successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const body = {
            ...req.body,
            categoryId: new ObjectId(req.body.categoryId),

        }
        await Product.findByIdAndUpdate(req.params.id, body);
        const updatedProduct = await Product.findOne({ _id: req.params.id });
        res.status(200).json({ data: updatedProduct, message: 'Updated successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

exports.delete = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sold > 0) {
            return res.status(404).json({ message: 'Product is sold' });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully', status: 'ok' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};