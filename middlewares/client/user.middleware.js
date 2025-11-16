// Middleware xác thực user cho client-side routes
// 3 Middleware khác nhau:
    // requireAuth - BẮT BUỘC login:
        // Dùng cho logout, profile, orders, etc.
        // Redirect về login nếu chưa đăng nhập

    // infoUser - KHÔNG bắt buộc login:
        // Dùng globally để lấy info user nếu có
        // Không redirect, chỉ set res.locals.user = null nếu không có

    // checkLoggedIn - Ngăn user đã login:
        // Dùng cho trang login/register
        // Redirect về home nếu đã đăng nhập

// Lợi ích:
// ✅ Phân biệt rõ routes cần/không cần auth
// ✅ Tránh redirect loop
// ✅ Xử lý đầy đủ edge cases
// ✅ Có thể hiển thị thông tin user ở mọi trang
// ✅ Code rõ ràng, dễ maintain

const User = require("../../models/user.model");

// Middleware để check user đã login chưa (bắt buộc)
module.exports.requireAuth = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;

    // Không có token -> redirect đến login
    if (!tokenUser) {
        req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
        return res.redirect(`/user/login`);
    }

    try {
        const user = await User.findOne({
            tokenUser: tokenUser,
            deleted: false,
            status: 'active'
        }).select("-password").lean();

        // Token không hợp lệ hoặc user không tồn tại
        if (!user) {
            res.clearCookie("tokenUser");
            req.flash('error', 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại');
            return res.redirect(`/user/login`);
        }

        // Lưu thông tin user vào locals và request
        res.locals.user = user;
        req.user = user;
        
        next();
    } catch (error) {
        console.error("User auth middleware error:", error);
        res.clearCookie("tokenUser");
        req.flash('error', 'Đã có lỗi xảy ra. Vui lòng đăng nhập lại');
        return res.redirect(`/user/login`);
    }
};

// Middleware để lấy thông tin user nếu có (không bắt buộc)
module.exports.infoUser = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;

    // Không có token -> bỏ qua, không redirect
    if (!tokenUser) {
        res.locals.user = null;
        return next();
    }

    try {
        const user = await User.findOne({
            tokenUser: tokenUser,
            deleted: false,
            status: 'active'
        }).select("-password").lean();

        if (user) {
            res.locals.user = user;
            req.user = user;
        } else {
            // Token không hợp lệ -> xóa cookie nhưng không redirect
            res.clearCookie("tokenUser");
            res.locals.user = null;
        }
        
        next();
    } catch (error) {
        console.error("User info middleware error:", error);
        res.clearCookie("tokenUser");
        res.locals.user = null;
        next();
    }
};

// Middleware để check user chưa login (cho trang login/register)
module.exports.checkLoggedIn = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;

    if (!tokenUser) {
        return next();
    }

    try {
        const user = await User.findOne({
            tokenUser: tokenUser,
            deleted: false,
            status: 'active'
        }).select("-password").lean();

        // Nếu đã login -> redirect về trang chủ
        if (user) {
            req.flash('info', 'Bạn đã đăng nhập rồi');
            return res.redirect('/');
        }
        
        // Token không hợp lệ -> xóa và cho phép tiếp tục
        res.clearCookie("tokenUser");
        next();
    } catch (error) {
        console.error("Check logged in middleware error:", error);
        res.clearCookie("tokenUser");
        next();
    }
};

