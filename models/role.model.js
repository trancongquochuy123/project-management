const mongoose = require('mongoose');

// Define role schema
const roleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        permissions: { type: Array, default: [] },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Export Role model
const Role = mongoose.model('Role', roleSchema, 'roles');
module.exports = Role;
