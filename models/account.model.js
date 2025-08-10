const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const generate = require('../helper/generate');


// 1. Register plugin before creating schema
mongoose.plugin(slug);

// Define product schema
const accountSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        token: { type: String, default: generate.generateRandomString(32)},
        phone: { type: String },
        avatar: { type: String },
        roleId: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    {
        timestamps: true,
    }
);

// Export Product model
const Product = mongoose.model('Product', accountSchema, 'products');
module.exports = Product;
