const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

module.exports.requireAuth = (req, res, next) => {
    if (!req.cookies.token) {
        return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    } else {
        const user = Account.findOne({ token: req.cookies.token });
        if (!user) {
            return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        } else {
            next();
        }
    }
}