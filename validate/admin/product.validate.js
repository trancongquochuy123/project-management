module.exports.createProduct = (req, res, next) => {
    if (!req.body.title) {
        req.flash('error', 'Title is required!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products/create`);
    }

    if (req.body.title.length < 8) {
        req.flash('error', 'Title must be at least 8 characters!');
        return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products/create`);
    }
    next();
} 