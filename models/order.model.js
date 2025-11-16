const mongoose = require('mongoose');

// Define order schema
const orderSchema = new mongoose.Schema(
    {
        cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
        userInfo: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },
        products: [
            {
                product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                price: { type: Number, required: true },
                discountPercentage: { type: Number, default: 0 },
                quantity: { type: Number, required: true },
            }
        ],
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