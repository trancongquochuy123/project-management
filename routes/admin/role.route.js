const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const controller = require('../../controllers/admin/role.controller');

router.get("/", controller.index);
router.get("/create", controller.create);

// upload.none() cho phép multer xử lý dữ liệu dạng multipart mà không cần có file.
router.post("/create", upload.none(), controller.createRole); 

module.exports = router;