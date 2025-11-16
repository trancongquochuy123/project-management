const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/checkout.controller');
const userMiddleware = require('../../middlewares/client/user.middleware.js');

router.get('/', controller.index);

router.post('/order',userMiddleware.infoUser, controller.order);

router.get('/success/:orderId', controller.success);

module.exports = router;