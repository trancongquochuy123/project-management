const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/cart.controller');

// Hiển thị trang giỏ hàng
router.get('/', controller.index);

// Cập nhật số lượng sản phẩm
router.patch('/update', controller.update);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/delete/:productId', controller.delete);

router.post('/add/:productId', controller.addToCart);

module.exports = router;