const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.token) {
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    try {
        const user = await Account.findOne({ token: req.cookies.token }).select("-password").lean();
        if (!user) {
            return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        }

        const role = await Role.findOne({ _id: user.roleId }).select("title permissions").lean();

        res.locals.user = user;
        res.locals.role = role;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
};