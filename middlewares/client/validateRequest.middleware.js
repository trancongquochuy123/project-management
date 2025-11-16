module.exports.validateRequest = (req, res, next) => {
    // Bỏ qua static files
    if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|map)$/i)) {
        return next();
    }

    // Bỏ qua API/JSON routes không cần cart
    if (req.url.startsWith('/json') || 
        req.url.startsWith('/api/health') ||
        req.url.startsWith('/api/status')) {
        return next();
    }

    // Block request không có User-Agent (thường là bot/polling)
    const userAgent = req.get('user-agent');
    if (!userAgent && !req.url.startsWith('/api')) {
        console.log('🚫 Blocked request without User-Agent:', req.url);
        return res.status(403).json({ 
            error: 'Forbidden',
            message: 'User-Agent header required'
        });
    }

    next();
};