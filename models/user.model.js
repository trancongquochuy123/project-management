const mongoose = require('mongoose');
const generate = require('../helper/generate');

// Define user schema
const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        tokenUser: { type: String, default: generate.generateRandomString(32)},
        phone: { type: String },
        avatar: { type: String },
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

// Export User model
const User = mongoose.model('User', userSchema, 'users');
module.exports = User;