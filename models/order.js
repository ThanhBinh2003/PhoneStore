const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    totalReceived: {
        type: Number,
        required: true,
    },
    totalChange: {
        type: Number,
        required: true,
    },
    createAt: {
        type: String,
        required: true,
    }
},
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

orderSchema.virtual('user', {
    ref: 'User',
    localField: 'user',
    foreignField: 'username',
    justOne: true,
});

orderSchema.virtual('products', {
    ref: 'Product',
    localField: 'items.productId',
    foreignField: '_id',
    justOne: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;