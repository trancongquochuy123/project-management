const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {uploadCloudinary} = require('../../middlewares/admin/uploadCloud.middleware.js');
const controller = require('../../controllers/admin/product-category.controller');
const validate = require('../../validate/admin/product-category.validate');

router.get("/", controller.index);

router.get("/create", controller.create);

router.delete("/delete/:id", controller.deleteItem);

// Multer
router.post('/create',
    upload.single('thumbnail'),
    uploadCloudinary('products-category/thumbnails'),
    validate.createProduct,
    controller.createProduct,
);

router.get("/edit/:id", controller.edit);

router.patch("/edit/:id",
    upload.single('thumbnail'),
    uploadCloudinary('products-category/thumbnails'),
    validate.createProduct,
    controller.editPatch
);

router.get("/detail/:id",
    controller.detail,
);

module.exports = router;