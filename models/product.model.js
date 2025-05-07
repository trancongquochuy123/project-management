const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String },
    date: { type: Date, required: true },
    reviewerName: { type: String, required: true },
    reviewerEmail: { type: String, required: true }
});

const productSchema = new mongoose.Schema(
    {
        // id: { type: Number, unique: true, required: true },
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String },
        price: { type: Number, required: true },
        discountPercentage: { type: Number },
        rating: { type: Number },
        stock: { type: Number },
        tags: [String],
        brand: { type: String },
        sku: { type: String },
        weight: { type: Number },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            depth: { type: Number }
        },
        warrantyInformation: { type: String },
        shippingInformation: { type: String },
        availabilityStatus: { type: String },
        reviews: [reviewSchema],
        returnPolicy: { type: String },
        minimumOrderQuantity: { type: Number },
        meta: {
            createdAt: { type: Date },
            updatedAt: { type: Date },
            barcode: { type: String },
            qrCode: { type: String }
        },
        images: [String],
        thumbnail: { type: String },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        position: { type: Number},
        slug: { type: String, slug: "title", unique: true },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;