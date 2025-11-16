const productRoutes = require('./product.route.js');
const homeRoutes = require('./home.route.js');
const searchRoutes = require('./search.route.js');
const cartRoutes = require('./cart.route.js');
const checkoutRoutes = require('./checkout.route.js');
const userRoutes = require('./user.route.js');
const categoryMiddleware = require('../../middlewares/client/category.middleware.js');
const cartMiddleware = require('../../middlewares/client/cart.middleware.js');
const userMiddleware = require('../../middlewares/client/user.middleware.js');

module.exports = (app) => {
    // Middleware chung cho tất cả routes
    app.use(categoryMiddleware.category);
    app.use(cartMiddleware.cartId);
    
    // Middleware lấy thông tin user nếu có (không bắt buộc login)
    // Dùng cho các trang như home, products để hiển thị tên user nếu đã login
    app.use(userMiddleware.infoUser);

    app.use('/', homeRoutes);
    app.use('/products', productRoutes);
    app.use('/search', searchRoutes);
    app.use('/cart', cartRoutes);
    
    // Checkout cần đăng nhập -> thêm requireAuth vào từng route trong checkout.route.js
    app.use('/checkout', checkoutRoutes);
    
    // User routes đã có middleware riêng trong user.route.js
    app.use('/user', userRoutes);
}