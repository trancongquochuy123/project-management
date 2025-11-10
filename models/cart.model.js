// models/cart.model.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
}, { timestamps: true });

// Export Cart model
const Cart = mongoose.model('Cart', cartSchema, 'carts');
module.exports = Cart;
