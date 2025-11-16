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

module.exports.registerPost = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('error', 'Full Name is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/register`);
    }

    if (!req.body.email) {
        req.flash('error', 'Email is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/register`);
    }

    if (!req.body.password) {
        req.flash('error', 'Password is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/register`);
    }

    next();
} 

module.exports.forgotPasswordPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash('error', 'Email is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/password/forgot`);
    }

    next();
}

module.exports.otpPasswordPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash('error', 'Email is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/password/otp`);
    }

    next();
}   
module.exports.resetPasswordPost = (req, res, next) => {
    if (!req.body.email) {
        req.flash('error', 'Email is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/password/reset`);
    }

    next();
}   


module.exports.infoPost = (req, res, next) => {
    if (!req.body.fullName) {
        req.flash('error', 'Full Name is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/user/info`);
    }
    next();
}