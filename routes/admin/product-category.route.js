const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {uploadCloudinary} = require('../../middlewares/admin/uploadCloud.middleware.js');
const controller = require('../../controllers/admin/product-category.controller');
const validate = require('../../validate/admin/product-category.validate');

router.get("/", controller.index);

router.get("/create", controller.create);

// Multer
router.post('/create',
    upload.single('thumbnail'),
    uploadCloudinary('products-category/thumbnails'), // middleware upload ảnh lên Cloudinary
    validate.createProduct,
    controller.createProduct,
);


module.exports = router;