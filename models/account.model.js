const mongoose = require('mongoose');
const generate = require('../helper/generate');

// Define account schema
const accountSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        token: { type: String, default: generate.generateRandomString(32)},
        phone: { type: String },
        avatar: { type: String },
        roleId: { type: mongoose.Schema.Types.ObjectId },
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

// Export Account model
const Account = mongoose.model('Account', accountSchema, 'accounts');
module.exports = Account;
