const Product = require('../../models/product.model.js');
const { priceNewProduct } = require('../../helper/products.js');

// [GET] /
module.exports.index = async (req, res) => {
    try {
        // Featured Products
        const keyword = req.query.keyword || '';

        let newProducts = [];

        if (keyword) {
            const regex = new RegExp(keyword, 'i'); // 'i' for case-insensitive
            const products = await Product
                .find({ title: regex, deleted: false, status: 'active' })
                .populate('product_category_id', 'title')
                .limit(20)
                .exec();

            newProducts = priceNewProduct(products);
        }

        res.render("client/pages/search/index.pug", {
            pageTitle: "Search Results",
            description: `Search results for ${keyword}`,
            products: newProducts,
            keyword: keyword,
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }
}

