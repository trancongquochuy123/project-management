const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

module.exports.infoUser = async (req, res, next) => {
    const publicPaths = ['/user/login', '/user/register', '/user/logout'];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    if (!req.cookies.tokenUser) {
        return res.redirect(`/user/login`);
    }

    try {
        const user = await User.findOne(
            {
                tokenUser: req.cookies.tokenUser,
                deleted: false,
                status: 'active'
            }
        ).select("-password").lean();
        if (!user) {
            res.clearCookie("tokenUser");
            return res.redirect(`/user/login`);
        }

        res.locals.user = user;
        next();
    } catch (error) {
        console.error("User middleware error:", error);
        return res.redirect(`/user/login`);
    }
};