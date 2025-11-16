const mongoose = require('mongoose');

// Define order schema
const orderSchema = new mongoose.Schema(
    {
        cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
        userInfo: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            note: { type: String }
        },
        products: [
            {
                product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                price: { type: Number, required: true },
                discountPercentage: { type: Number, default: 0 },
                quantity: { type: Number, required: true },
            }
        ],
        method: { type: String, enum: ['cod', 'online'], default: 'cod' },
        status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Export Order model
const Order = mongoose.model('Order', orderSchema, 'orders');
module.exports = Order;