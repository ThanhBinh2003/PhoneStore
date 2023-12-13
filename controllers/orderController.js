const Order = require('../models/order');
const Product = require('../models/product');
const moment = require('moment');
exports.index = async (req, res, next) => { }

const { ObjectId } = require("mongodb");
const { user } = require('./accountController');
exports.store = async (req, res, next) => {
    try {
        const { username, items, totalReceived, totalChange } = req.body;
        let totalPrice = 0
        const products = items.map((item) => {
            totalPrice += item.sellingPrice * item.quantity
            return {
                productId: new ObjectId(item._id),
                quantity: item.quantity,
            }
        })

        const order = new Order({
            username,
            items: products,
            totalPrice,
            totalReceived,
            totalChange,
            createdAt: moment().format('MM/DD/YYYY, hh:mm:ss'),
        });

        products.forEach(async (product) => {
            const productInDB = await Product.findById(product.productId);
            if (productInDB.quantity < product.quantity) {
                throw new Error('Not enough product in stock');
            }
            productInDB.quantity -= product.quantity;
            productInDB.sold += product.quantity;
            await productInDB.save();
        });
        const newOrder = await order.save();
        res.status(200).json({ data: newOrder });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const getOrderWithUserAndProduct = async (id) => {
    const result = await Order.aggregate([
        {
            $match: { _id: new ObjectId(id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'username',
                foreignField: 'username',
                as: 'user',
            }
        },
        {
            $unwind: '$user'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'products',
            }
        },
        {
            $addFields: {
                products: {
                    $map: {
                        input: '$products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$items',
                                                as: 'item',
                                                cond: {
                                                    $eq: ['$$item.productId', '$$product._id']
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
        },
        {
            $project: {
                items: 0,
                'user.password': 0,
                'user.role': 0,
            }
        },
    ]).exec();
    return result[0];

}
exports.detail = async (req, res, next) => {
    try {
        const result = await getOrderWithUserAndProduct(req.params.id)
        res.status(200).json({ data: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.pdf = async (req, res, next) => {
    try {
        const result = await getOrderWithUserAndProduct(req.params.id)
        const title = result._id
        res.render('order/pdf', { title, order: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}