const Cart = require('../../models/cart.model');
const Order = require('../../models/order.model.js');
const Product = require('../../models/product.model.js');

// [GET] /checkout
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

        res.render("client/pages/checkout/index.pug", {
            pageTitle: "Checkout",
            description: "Proceed to checkout your items.",
            cart: cart,
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /checkout/order
module.exports.order = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const userInfo = req.body;
        console.log(userInfo);

        if (!cartId) {
            return res.status(400).send("No cart found.");
        }

        const cart = await Cart.findById(cartId).populate('products.product_id');

        if (!cart || cart.products.length === 0) {
            return res.status(400).send("Cart is empty.");
        }
        const products = [];

        for (const item of cart.products) {
            const product = item.product_id;
            console.log("product", product);

            if (!product || product.deleted || product.status !== 'active') {
                return res.status(400).send(`Product ${item.product_id} is not available.`);
            }

            if (item.quantity > product.stock) {
                return res.status(400).send(`Insufficient stock for product ${product.title}.`);
            }

            products.push({
                product_id: product._id,
                discountPercentage: product.discountPercentage || 0,
                quantity: item.quantity,
                price: product.price,
            });
        }


        const newOrder = new Order({
            cart_id: cartId,
            userInfo: userInfo,
            products: products
        });

        await newOrder.save();

        await Cart.updateOne(
            { _id: cartId },
            { $set: { products: [] } }
        );

        res.redirect('/checkout/success/' + newOrder._id);
    } catch (err) {
        console.error("Error processing order:", err);
        return res.status(500).send("Internal Server Error");
    }

}

// [GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('products.product_id');
        console.log("order", order);
        if (!order) {
            return res.status(404).send("Order not found.");
        }

        for (const item of order.products) {
            const productInfo = await Product.findById(item.product_id).select('title thumbnail slug');
            item.productInfo = productInfo;
            item.finalPrice = item.price * (1 - item.discountPercentage / 100);
            item.totalPrice = item.finalPrice * item.quantity;
        }

        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

        res.render("client/pages/checkout/success.pug", {
            pageTitle: "Order Success",
            description: "Your order has been placed successfully.",
            order: order,

        });
    } catch (err) {
        console.error("Error fetching order:", err);
        return res.status(500).send("Internal Server Error");
    }
}

