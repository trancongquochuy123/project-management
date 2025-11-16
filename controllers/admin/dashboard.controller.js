const Account = require('../../models/account.model');
const Product = require('../../models/product.model');
const User = require('../../models/user.model');
const ProductCategory = require('../../models/product-category.model');
const systemConfig = require("../../config/system");

// [GET] admin/dashboard
module.exports.dashboard = async (req, res) => {
    try {
        // Thống kê tổng quan
        const totalProducts = await Product.countDocuments({ deleted: false });
        const activeProducts = await Product.countDocuments({ deleted: false, status: 'active' });
        const inactiveProducts = await Product.countDocuments({ deleted: false, status: 'inactive' });
        const outOfStock = await Product.countDocuments({ deleted: false, stock: 0 });
        
        const totalUsers = await User.countDocuments({ deleted: false });
        const activeUsers = await User.countDocuments({ deleted: false, status: 'active' });
        
        const totalAccounts = await Account.countDocuments({ deleted: false });
        const activeAccounts = await Account.countDocuments({ deleted: false, status: 'active' });
        
        const totalCategories = await ProductCategory.countDocuments({ deleted: false });
        const activeCategories = await ProductCategory.countDocuments({ deleted: false, status: 'active' });

        // Thống kê doanh thu (giả định)
        const products = await Product.find({ deleted: false });
        let totalRevenue = 0;
        let totalValue = 0;
        
        products.forEach(product => {
            const salePrice = product.price * (1 - (product.discountPercentage || 0) / 100);
            totalRevenue += salePrice * (product.stock || 0);
            totalValue += product.price * (product.stock || 0);
        });

        // Sản phẩm nổi bật
        const featuredProducts = await Product.find({ 
            deleted: false, 
            feature: '1',
            status: 'active'
        })
        .sort({ position: 1 })
        .limit(5)
        .select('title price thumbnail rating stock');

        // Sản phẩm mới nhất
        const latestProducts = await Product.find({ 
            deleted: false,
            status: 'active'
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title price thumbnail createdAt');

        // Sản phẩm bán chạy (rating cao)
        const topRatedProducts = await Product.find({ 
            deleted: false,
            status: 'active'
        })
        .sort({ rating: -1 })
        .limit(5)
        .select('title price thumbnail rating');

        // Sản phẩm sắp hết hàng
        const lowStockProducts = await Product.find({ 
            deleted: false,
            status: 'active',
            stock: { $gt: 0, $lte: 10 }
        })
        .sort({ stock: 1 })
        .limit(5)
        .select('title stock thumbnail');

        // Thống kê theo danh mục
        const categoryStats = await Product.aggregate([
            { $match: { deleted: false } },
            { 
                $group: { 
                    _id: '$product_category_id', 
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' }
                } 
            },
            { $limit: 5 }
        ]);

        // Lấy thông tin danh mục
        const categoryIds = categoryStats.map(stat => stat._id);
        const categories = await ProductCategory.find({ _id: { $in: categoryIds } });
        
        const categoryStatsWithNames = categoryStats.map(stat => {
            const category = categories.find(cat => cat._id.toString() === stat._id?.toString());
            return {
                name: category ? category.title : 'Chưa phân loại',
                count: stat.count,
                totalStock: stat.totalStock
            };
        });

        // Người dùng mới trong 7 ngày
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const newUsersThisWeek = await User.countDocuments({ 
            deleted: false,
            createdAt: { $gte: sevenDaysAgo }
        });

        const newProductsThisWeek = await Product.countDocuments({ 
            deleted: false,
            createdAt: { $gte: sevenDaysAgo }
        });

        const statistics = {
            products: {
                total: totalProducts,
                active: activeProducts,
                inactive: inactiveProducts,
                outOfStock: outOfStock
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                newThisWeek: newUsersThisWeek
            },
            accounts: {
                total: totalAccounts,
                active: activeAccounts
            },
            categories: {
                total: totalCategories,
                active: activeCategories
            },
            revenue: {
                total: totalRevenue.toFixed(2),
                totalValue: totalValue.toFixed(2)
            },
            featuredProducts,
            latestProducts,
            topRatedProducts,
            lowStockProducts,
            categoryStats: categoryStatsWithNames,
            newThisWeek: {
                users: newUsersThisWeek,
                products: newProductsThisWeek
            }
        };

        res.render("admin/pages/dashboard/index.pug", {
            pageTitle: "Dashboard",
            description: "Welcome to the admin dashboard!",
            statistics
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.render("admin/pages/dashboard/index.pug", {
            pageTitle: "Dashboard",
            description: "Welcome to the admin dashboard!",
            statistics: {
                products: { total: 0, active: 0, inactive: 0, outOfStock: 0 },
                users: { total: 0, active: 0, newThisWeek: 0 },
                accounts: { total: 0, active: 0 },
                categories: { total: 0, active: 0 },
                revenue: { total: 0, totalValue: 0 },
                featuredProducts: [],
                latestProducts: [],
                topRatedProducts: [],
                lowStockProducts: [],
                categoryStats: [],
                newThisWeek: { users: 0, products: 0 }
            }
        });
    }
}