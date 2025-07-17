const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const controller = require('../../controllers/admin/role.controller');

router.get("/", controller.index);
router.get("/create", controller.create);
router.delete("/delete/:id", controller.deleteRole);

// upload.none() cho phép multer xử lý dữ liệu dạng multipart mà không cần có file.
router.post("/create", upload.none(), controller.createRole);

router.get("/edit/:id", controller.edit);

router.patch("/edit/:id",
    controller.editPatch
);

router.get("/detail/:id",
    controller.detail,
);

router.get("/permissions",
    controller.permissions,
)

// Cập nhật permissions
router.post('/permissions/update', controller.updatePermissions);


module.exports = router;