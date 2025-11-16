const express = require('express');
const router = express.Router();

const validate = require('../../validate/client/user.validate.js');
const controller = require('../../controllers/client/user.controller');
const userMiddleware = require('../../middlewares/client/user.middleware.js');

// Routes không cần đăng nhập (dùng checkLoggedIn để tránh user đã login vào lại)
router.get('/register', userMiddleware.checkLoggedIn, controller.register);
router.post('/register', userMiddleware.checkLoggedIn, validate.registerPost, controller.registerPost);

router.get('/login', userMiddleware.checkLoggedIn, controller.login);
router.post('/login', userMiddleware.checkLoggedIn, validate.loginPost, controller.loginPost);

// Forgot password không cần check logged in (vì user quên mật khẩu có thể đang không login)
router.get('/password/forgot', controller.forgotPassword);
router.post('/password/forgot', validate.forgotPasswordPost, controller.forgotPasswordPost);
router.get('/password/otp', controller.otpPassword);
router.post('/password/otp', validate.otpPasswordPost, controller.otpPasswordPost);
router.get('/password/reset', controller.resetPassword);
router.post('/password/reset', validate.resetPasswordPost, controller.resetPasswordPost);

// Logout cần đăng nhập
router.get('/logout', userMiddleware.requireAuth, controller.logout);

// Thêm các routes cần đăng nhập khác (ví dụ)
// router.get('/profile', userMiddleware.requireAuth, controller.profile);
// router.get('/orders', userMiddleware.requireAuth, controller.orders);

module.exports = router;