const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Permission schema defines one single action that can be granted to Roles.
 * - key: unique identifier in dot.notation (e.g. "product.category.view").
 * - label: human-readable name (e.g. "Xem danh mục sản phẩm").
 * - group: logical grouping/module (e.g. "Danh mục", "Sản phẩm").
 */
const permissionSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    group: {
        type: String,
        required: false,
        trim: true
    },
}, {
    timestamps: true
});

permissionSchema.index({ group: 1 });

const Permission = mongoose.model('Permission', permissionSchema, "permissions");
module.exports = Permission
