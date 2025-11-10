const Cart = require('../../models/cart.model.js');

module.exports.cartId = async (req, res, next) => {
    try {
        const cartId = req.cookies.cartId;
        if (!cartId) {
            // Tạo một cartId mới nếu không có trong cookies
            const cart = new Cart();
            await cart.save();
            console.log('New cart created:', cart._id);
            const expiresCookie = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
            res.cookie('cartId', cart._id, {
                expires: expiresCookie,
                httpOnly: true
            });

            req.cartId = cart._id;
        } else {
            req.cartId = cartId;
        }
        console.log('Middleware for cart ID');
        next();
    } catch (error) {
        console.error('Error in cartId middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}