const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

// 1. Register plugin before creating schema
mongoose.plugin(slug);

// Define review schema
const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String },
    date: { type: Date, required: true },
    reviewerName: { type: String, required: true },
    reviewerEmail: { type: String, required: true }
});

// Define product schema
const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: '' },
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
        images: [String],
        thumbnail: { type: String },
        deleted: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        position: { type: Number },
        slug: { type: String, slug: "title", unique: true },
        createdBy: {
            accountId: { type: mongoose.Schema.Types.ObjectId },
            createdAt: { type: Date, default: Date.now }
        },
        deletedBy: {
            accountId: { type: mongoose.Schema.Types.ObjectId },
            deletedAt: { type: Date }
        },
        updatedBy: [
            {
                accountId: { type: mongoose.Schema.Types.ObjectId },
                updatedAt: { type: Date, default: Date.now }
            }
        ]
        
    },
    {
        timestamps: true,
    }
);

// Export Product model
const Product = mongoose.model('Product', productSchema, 'products');
module.exports = Product;
