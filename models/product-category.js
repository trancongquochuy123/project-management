const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

// 1. Register plugin before creating schema
mongoose.plugin(slug);

// Define product category schema
const productCategorySchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null},
        description: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        images: [String],
        thumbnail: { type: String },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        position: { type: Number },
        slug: { type: String, slug: "title", unique: true }
    },
    {
        timestamps: true,
    }
);

// Export ProductCategory model
const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, 'products-category');
module.exports = ProductCategory;
