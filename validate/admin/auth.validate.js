module.exports.loginPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash('error', 'Email is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/auth/login`);
    }

    if (!req.body.password) {
        req.flash('error', 'Password is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/auth/login`);
    }

    next();
} 