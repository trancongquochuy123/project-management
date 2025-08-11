const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadCloudinary } = require('../../middlewares/admin/uploadCloud.middleware.js');

const upload = multer();

const controller = require('../../controllers/admin/account.controller');


router.get("/", controller.index);
router.get("/create", controller.create);

// Multer
router.post('/create',
    upload.single('avatar'),
    uploadCloudinary('accounts/avatars'),
    // validate.createAccount,
    controller.createAccount
);

module.exports = router;