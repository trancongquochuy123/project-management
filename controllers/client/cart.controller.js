const Product = require('../../models/product.model.js');
const Cart = require('../../models/cart.model.js');

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
