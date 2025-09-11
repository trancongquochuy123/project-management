const productRoutes = require('./product.route.js');
const homeRoutes = require('./home.route.js');
const categoryMiddleware = require('../../middlewares/client/category.middleware.js');

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use('/', homeRoutes);

    app.use('/products', productRoutes);
    
}