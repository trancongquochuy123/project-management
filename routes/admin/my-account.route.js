const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadCloudinary } = require('../../middlewares/admin/uploadCloud.middleware.js');
const upload = multer();

const controller = require('../../controllers/admin/my-account.controller');

router.get("/", controller.index);

router.get("/edit", controller.edit);

router.patch("/edit", 
    upload.single('avatar'),
    uploadCloudinary('accounts/avatars'),
    controller.editPatch,
);

module.exports = router;