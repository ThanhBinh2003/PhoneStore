const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const moment = require('moment');
exports.index = async (req, res, next) => { }

const { ObjectId } = require("mongodb");
const { user } = require('./accountController');
exports.store = async (req, res, next) => {
    try {
        const { customerId, items, totalReceived, totalChange } = req.body;
        let totalPrice = 0
        const products = items.map((item) => {
            totalPrice += item.sellingPrice * item.quantity
            return {
                productId: new ObjectId(item._id),
                quantity: item.quantity,
            }
        })

        const order = new Order({
            customerId,
            sellerId: req.user.username,
            items: products,
            totalPrice,
            totalReceived,
            totalChange,
            createdAt: moment().format('MM/DD/YYYY, hh:mm:ss'),
            timestamp: moment().unix(),
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

const getOrderWithUserAndProduct = async (id, usernameInput, type) => {
    const pipeline = [
        {
            $match: {
                $and: [
                    id && { _id: new ObjectId(id) },
                    usernameInput && { [`${type}Id`]: usernameInput },
                ].filter(Boolean)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'customerId',
                foreignField: 'username',
                as: 'customer',
            }
        },
        {
            $unwind: '$customer'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sellerId',
                foreignField: 'username',
                as: 'seller',
            }
        },
        {
            $unwind: '$seller'
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
                'customer.password': 0,
                'customer.role': 0,
                'seller.password': 0,
                'seller.role': 0,
            }
        },
    ].filter(Boolean);

    const result = await Order.aggregate(pipeline).exec();
    return result;
}

exports.detail = async (req, res, next) => {
    try {
        const result = await getOrderWithUserAndProduct(req.params.id)
        res.status(200).json({ data: result[0] });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.customerOrders = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        res.render('order/customer-orders', { title: 'Customer Orders', customer: user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.sellerOrders = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        res.render('order/seller-orders', { title: 'Seller Orders', seller: user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.apiCustomerOrders = async (req, res, next) => {
    try {
        const username = req.params.username
        const result = await getOrderWithUserAndProduct(null, username, 'customer')
        res.status(200).json({ data: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.apiSellerOrders = async (req, res, next) => {
    const username = req.params.username
    try {
        const result = await getOrderWithUserAndProduct(null, username, 'seller')
        res.status(200).json({ data: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.pdf = async (req, res, next) => {
    try {
        const result = await getOrderWithUserAndProduct(req.params.id, null, null)
        const title = result[0]._id
        res.render('order/pdf', { title, order: result[0] });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


exports.getOrdersByTimeRange = async (req, res, next) => {
    try {
        const { startTime, endTime } = req.query;

        let filter = {};

        if (startTime && endTime) {
            // Nếu có thời gian bắt đầu và kết thúc được chỉ định, sử dụng nó trong bộ lọc
            filter.timestamp = {
                $gte: moment(startTime).startOf('day').unix(),
                $lte: moment(endTime).endOf('day').unix(),
            };
        } else {
            // Nếu không có thời gian được chỉ định, mặc định lấy đơn hàng của ngày hôm nay
            filter.timestamp = {
                $gte: moment().startOf('day').unix(),
                $lte: moment().endOf('day').unix(),
            };
        }

        const orders = await Order.find(filter)
        const ordersWithUserAndProductPromises = orders.map(async (order) => {
            const res = await getOrderWithUserAndProduct(order._id.toString(), null, null);
            return res[0];
        });

        const ordersWithUserAndProduct = await Promise.all(ordersWithUserAndProductPromises);
        res.status(200).json({ data: ordersWithUserAndProduct });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getRevenue = async (req, res, next) => {
    try {
        // get revenue all time
        const orders = await Order.find({});
        const revenueAllTime = orders.reduce((acc, order) => {
            return acc + order.totalPrice;
        }, 0);
        res.status(200).json({ data: revenueAllTime });
    } catch (error) {
        res.status(400).json({ message: err.message });
    }
}