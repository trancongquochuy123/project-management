const Product = require('../../models/product.model.js');
const Cart = require('../../models/cart.model.js');

// [GET] /cart
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        
        if (!cartId) {
            return res.render('client/pages/cart/index', {
                pageTitle: 'Giỏ hàng',
                cart: null
            });
        }
        
        const cart = await Cart.findById(cartId)
            .populate('products.product_id');
        
        if (!cart) {
            return res.render('client/pages/cart/index', {
                pageTitle: 'Giỏ hàng',
                cart: null
            });
        }
        
        // Lọc bỏ các sản phẩm đã bị xóa hoặc không tồn tại
        cart.products = cart.products.filter(item => {
            return item.product_id && 
                   !item.product_id.deleted && 
                   item.product_id.status === 'active';
        });
        
        // Cập nhật lại cart nếu có sản phẩm bị xóa
        await cart.save();
        
        res.render('client/pages/cart/index', {
            pageTitle: 'Giỏ hàng',
            cart: cart
        });
        
    } catch (error) {
        console.error('Error in cart index:', error);
        res.render('client/pages/cart/index', {
            pageTitle: 'Giỏ hàng',
            cart: null
        });
    }
};

// [PATCH] /cart/update
module.exports.update = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const { productId, quantity } = req.body;
        
        if (!productId || !quantity) {
            return res.status(400).json({ 
                code: 400,
                message: 'Thiếu thông tin!' 
            });
        }
        
        const newQuantity = parseInt(quantity);
        if (newQuantity < 1) {
            return res.status(400).json({ 
                code: 400,
                message: 'Số lượng phải lớn hơn 0!' 
            });
        }
        
        // Kiểm tra tồn kho
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                code: 404,
                message: 'Sản phẩm không tồn tại!' 
            });
        }
        
        if (newQuantity > product.stock) {
            return res.status(400).json({ 
                code: 400,
                message: `Chỉ còn ${product.stock} sản phẩm trong kho!` 
            });
        }
        
        // Cập nhật giỏ hàng
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ 
                code: 404,
                message: 'Giỏ hàng không tồn tại!' 
            });
        }
        
        const productIndex = cart.products.findIndex(
            item => item.product_id.toString() === productId
        );
        
        if (productIndex === -1) {
            return res.status(404).json({ 
                code: 404,
                message: 'Sản phẩm không có trong giỏ hàng!' 
            });
        }
        
        cart.products[productIndex].quantity = newQuantity;
        await cart.save();
        
        res.json({
            code: 200,
            message: 'Cập nhật thành công!'
        });
        
    } catch (error) {
        console.error('Error in update:', error);
        res.status(500).json({ 
            code: 500,
            message: 'Có lỗi xảy ra!' 
        });
    }
};

// [DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const productId = req.params.productId;
        
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ 
                code: 404,
                message: 'Giỏ hàng không tồn tại!' 
            });
        }
        
        // Xóa sản phẩm khỏi giỏ hàng
        cart.products = cart.products.filter(
            item => item.product_id.toString() !== productId
        );
        
        await cart.save();
        
        res.json({
            code: 200,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng!'
        });
        
    } catch (error) {
        console.error('Error in delete:', error);
        res.status(500).json({ 
            code: 500,
            message: 'Có lỗi xảy ra!' 
        });
    }
};

// [POST] /cart/add/:productId
module.exports.addToCart = async (req, res) => {
    try {
        console.log('🛒 [AddToCart] Controller invoked');
        console.log('➡️ req.params:', req.params);
        console.log('➡️ req.body:', req.body);

        // --- 1. Lấy dữ liệu ---
        const { productId } = req.params;
        const quantity = parseInt(req.body.quantity) || 1;

        if (!productId) {
            return res.status(400).json({ message: 'Thiếu productId trong URL' });
        }

        const cartId = req.cartId;
        if (!cartId) {
            return res.status(400).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        // --- 2. Kiểm tra giỏ hàng ---
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // --- 3. Kiểm tra sản phẩm đã có trong giỏ hàng chưa ---
        const existingProduct = cart.products.find(
            p => p.product_id?.toString() === productId
        );

        if (existingProduct) {
            // Nếu có: tăng số lượng
            await Cart.updateOne(
                { _id: cartId, 'products.product_id': productId },
                { $inc: { 'products.$.quantity': quantity } }
            );
            console.log(`🔁 Tăng số lượng sản phẩm ${productId} +${quantity}`);
        } else {
            // Nếu chưa có: thêm mới
            await Cart.updateOne(
                { _id: cartId },
                { $push: { products: { product_id: productId, quantity } } }
            );
            console.log(`🆕 Thêm sản phẩm ${productId} vào giỏ hàng`);
        }

        // --- 4. Trả về kết quả ---
        const updatedCart = await Cart.findById(cartId).populate('products.product_id');

        res.status(200).json({
            message: 'Thêm sản phẩm vào giỏ hàng thành công!',
            cart: updatedCart
        });

    } catch (error) {
        console.error('❌ Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm sản phẩm vào giỏ hàng' });
    }
};
