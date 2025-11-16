const rateLimit = new Map();

module.exports.cartCreationLimit = (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Lấy thông tin rate limit
    const userLimit = rateLimit.get(identifier);
    
    if (userLimit) {
        const timeDiff = now - userLimit.lastCreation;
        
        // Nếu tạo cart trong vòng 5 giây
        if (timeDiff < 5000) {
            userLimit.attempts += 1;
            
            // Nếu tạo quá 3 lần trong 5 giây -> block
            if (userLimit.attempts > 3) {
                console.log('⚠️ Rate limit exceeded for:', identifier);
                return res.status(429).json({ 
                    error: 'Too many requests',
                    message: 'Please wait before creating a new cart'
                });
            }
        } else {
            // Reset counter nếu đã quá 5 giây
            userLimit.attempts = 1;
            userLimit.lastCreation = now;
        }
    } else {
        // Lần đầu tiên
        rateLimit.set(identifier, {
            lastCreation: now,
            attempts: 1
        });
    }
    
    // Cleanup old entries sau 1 phút
    if (rateLimit.size > 1000) {
        const oldEntries = [];
        rateLimit.forEach((value, key) => {
            if (now - value.lastCreation > 60000) {
                oldEntries.push(key);
            }
        });
        oldEntries.forEach(key => rateLimit.delete(key));
    }
    
    next();
};