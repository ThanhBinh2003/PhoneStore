const mongoose = require('mongoose');
const Category = require('./category');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: 'https://firebasestorage.googleapis.com/v0/b/phone-c4bc5.appspot.com/o/default_product.png?alt=media&token=ba27cb80-4022-4400-abeb-98cc5234f0e5'
        },
        barCode: {
            type: String,
            required: true,
            unique: true
        },
        costPrice: {
            type: Number,
            required: true
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default: 0,
            required: true
        },
        sold: {
            type: Number,
            default: 0,
        },
        categoryId: {
            type: Object,
        },
        createdAt: {
            type: String,
            required: true
        }
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

productSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
    justOne: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;