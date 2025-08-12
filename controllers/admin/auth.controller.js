const Account = require('../../models/account.model');
const systemConfig = require("../../config/system");
var md5 = require('md5');

// [GET] admin/dashboard
module.exports.login = (req, res) => {
    if (req.cookies.token) {
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    } else {
        res.render("admin/pages/auth/login.pug", {
            pageTitle: "Login page",
        });
    }
}

// [POST] admin/auth/login
module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;

    // TODO: Handle login logic here
    const user = await Account.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Invalid email");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    const hashedPassword = md5(password);
    if (user.password !== hashedPassword) {
        req.flash("error", "Invalid password");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    if (user.status !== "active") {
        req.flash("error", "Account is not active");
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    res.cookie("token", user.token, {
        httpOnly: true,
        path: '/',         // đảm bảo cookie có cùng path với khi xóa
        // secure: true,    // bật nếu dùng HTTPS
        maxAge: 24 * 60 * 60 * 1000, // thời gian sống cookie (ví dụ 1 ngày)
    });

    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
}

// [GET] admin/auth/logout
module.exports.logout = (req, res) => {
    res.clearCookie("token", { path: '/' });
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}
