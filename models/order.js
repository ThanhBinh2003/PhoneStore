const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
    },
    sellerId: {
        type: String,
        required: true,
    },
    items: {
        type: [
            {
                productId: {
                    type: Object,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        required: true,
    },
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
    createdAt: {
        type: String,
        required: true,
    }
},
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

orderSchema.virtual('customer', {
    ref: 'User',
    localField: 'customerId',
    foreignField: 'username',
    justOne: true,
});


orderSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
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