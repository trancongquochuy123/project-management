const Account = require('../../models/account.model');
const Role = require('../../models/role.model');
const systemConfig = require("../../config/system");
var md5 = require('md5');

// [GET] admin/my-account
module.exports.index = (req, res) => {
    res.render("admin/pages/my-account/index.pug", {
        pageTitle: "My Account",
        description: "Manage your account settings."
    });
}

// [GET] admin/my-account/edit
module.exports.edit = (req, res) => {
    res.render("admin/pages/my-account/edit.pug", {
        pageTitle: "Edit My Account",
        description: "Edit your account settings.",
    });
}

// [PATCH] admin/my-account/edit
// [PATCH] admin/my-account/edit
module.exports.editPatch = async (req, res) => {
    const id = res.locals.user._id;

    try {
        const { fullName, email, password, phone, status, avatar } = req.body;

        const account = await Account.findById(id);

        // Kiểm tra email đã tồn tại cho account khác chưa
        const existingEmail = await Account.findOne({
            _id: { $ne: id },  //
            email,
            deleted: false,
        });

        if (existingEmail) {
            req.flash("error", "Email đã tồn tại");
            return res.redirect(`${systemConfig.prefixAdmin}/my-account/edit`);
        }

        // Update password nếu có nhập
        if (password && password.trim() !== "") {
            account.password = md5(password);
        }

        // Update các field khác
        account.fullName = fullName;
        account.email = email;
        account.phone = phone;
        account.status = status;
        account.avatar = avatar;

        await account.save();

        req.flash("success", "Cập nhật tài khoản thành công");
        res.redirect(`${systemConfig.prefixAdmin}/my-account/edit`);
    } catch (error) {
        console.error("Error updating account:", error);
        req.flash("error", "Có lỗi khi cập nhật tài khoản");
        res.redirect(`${systemConfig.prefixAdmin}/my-account/edit`);
    }
}
