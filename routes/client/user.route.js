const express = require('express');
const router = express.Router();

const validate = require('../../validate/client/user.validate.js');
const controller = require('../../controllers/client/user.controller');

router.get('/register', controller.register);
router.post(
    '/register',
    validate.registerPost,
    controller.registerPost
);
router.get('/login', controller.login);
router.post(
    '/login',
    validate.loginPost,
    controller.loginPost
);
router.get('/logout', controller.logout);
router.get('/password/forgot', controller.forgotPassword);
router.post('/password/forgot', controller.forgotPasswordPost);
// router.get('/reset-password/:token', controller.resetPassword);
// router.post('/reset-password/:token', controller.resetPasswordPost);
module.exports = router;