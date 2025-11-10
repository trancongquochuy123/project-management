const Cart = require('../../models/cart.model.js');

module.exports.cartId = async (req, res, next) => {
    try {
        const cartId = req.cookies.cartId;
        
        if (!cartId) {
            // Tạo cart mới nếu chưa có
            const newCart = new Cart({
                products: [],
                totalQuantity: 0
            });
            await newCart.save();
            
            console.log('New cart created:', newCart._id);
            
            // Set cookie với thời hạn 30 ngày
            const expiresCookie = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            res.cookie('cartId', newCart._id.toString(), {
                expires: expiresCookie,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS trong production
                sameSite: 'lax'
            });

            req.cartId = newCart._id.toString();
            
            // Set miniCart với cart rỗng
            res.locals.miniCart = {
                _id: newCart._id,
                products: [],
                totalQuantity: 0
            };
        } else {
            // Lấy cart hiện tại
            const cart = await Cart.findById(cartId).populate('products.product_id');
            
            if (!cart) {
                // Nếu cart không tồn tại, tạo mới
                const newCart = new Cart({
                    products: [],
                    totalQuantity: 0
                });
                await newCart.save();
                
                const expiresCookie = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                res.cookie('cartId', newCart._id.toString(), {
                    expires: expiresCookie,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
                
                req.cartId = newCart._id.toString();
                res.locals.miniCart = {
                    _id: newCart._id,
                    products: [],
                    totalQuantity: 0
                };
            } else {
                // Tính tổng số lượng sản phẩm
                cart.totalQuantity = cart.products.reduce((total, item) => {
                    return total + (item.quantity || 0);
                }, 0);
                
                req.cartId = cart._id.toString();
                res.locals.miniCart = cart;
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in cartId middleware:', error);
        
        // Tạo cart mặc định trong trường hợp lỗi
        res.locals.miniCart = {
            products: [],
            totalQuantity: 0
        };
        
        next(); // Tiếp tục thay vì trả về lỗi 500
    }
}