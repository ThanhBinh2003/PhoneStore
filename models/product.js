const mongoose = require('mongoose');
const Category = require('./category');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
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
        categoryId: {
            type: String,
        },
        createAt: {
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