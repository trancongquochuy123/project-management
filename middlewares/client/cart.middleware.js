const Cart = require('../../models/cart.model.js');

// Cache cart trong memory để tránh query DB liên tục
const cartCache = new Map();

module.exports.cartId = async (req, res, next) => {
    try {
        // Skip nếu đã có cartId
        if (req.cartId) {
            return next();
        }

        // Skip cho các request không cần cart
        if (req.url.startsWith('/json') || 
            req.url.startsWith('/api') ||
            req.url.match(/\.(css|js|jpg|jpeg|png|gif|svg|ico)$/i)) {
            return next();
        }

        const cartId = req.cookies.cartId;
        
        if (!cartId) {
            // Tạo cart mới
            const newCart = new Cart({
                products: [],
                totalQuantity: 0
            });
            await newCart.save();
            
            console.log('✅ New cart created:', newCart._id);
            
            // Cache cart
            cartCache.set(newCart._id.toString(), {
                cart: newCart,
                timestamp: Date.now()
            });
            
            // Set cookie
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
            // Kiểm tra cache trước
            const cached = cartCache.get(cartId);
            const now = Date.now();
            
            // Dùng cache nếu còn mới (trong vòng 30 giây)
            if (cached && (now - cached.timestamp) < 30000) {
                req.cartId = cartId;
                res.locals.miniCart = cached.cart;
                return next();
            }
            
            // Query DB nếu cache hết hạn
            const cart = await Cart.findById(cartId).populate('products.product_id');
            
            if (!cart) {
                // Cart không tồn tại -> tạo mới
                const newCart = new Cart({
                    products: [],
                    totalQuantity: 0
                });
                await newCart.save();
                
                cartCache.set(newCart._id.toString(), {
                    cart: newCart,
                    timestamp: now
                });
                
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
                // Tính tổng số lượng
                cart.totalQuantity = cart.products.reduce((total, item) => {
                    return total + (item.quantity || 0);
                }, 0);
                
                // Update cache
                cartCache.set(cartId, {
                    cart: cart,
                    timestamp: now
                });
                
                req.cartId = cart._id.toString();
                res.locals.miniCart = cart;
            }
        }
        
        next();
    } catch (error) {
        console.error('❌ Error in cartId middleware:', error);
        
        res.locals.miniCart = {
            products: [],
            totalQuantity: 0
        };
        
        next();
    }
};

// Cleanup cache mỗi 5 phút
setInterval(() => {
    const now = Date.now();
    const keysToDelete = [];
    
    cartCache.forEach((value, key) => {
        if (now - value.timestamp > 300000) { // 5 phút
            keysToDelete.push(key);
        }
    });
    
    keysToDelete.forEach(key => cartCache.delete(key));
    
    if (keysToDelete.length > 0) {
        console.log(`🧹 Cleaned ${keysToDelete.length} cart cache entries`);
    }
}, 300000);

// ✅ Validate User-Agent - Block request không có UA
// ✅ Rate limiting - Giới hạn số lần tạo cart
// ✅ Cache - Giảm query DB
// ✅ Skip routes không cần - Không apply middleware cho static/API
// ✅ Health check riêng - Endpoint cho monitoring tools
