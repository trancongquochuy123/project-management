const Product = require('../../models/product.model.js');
const { priceNewProduct } = require('../../helper/products.js');

// [GET] /
module.exports.index = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ feature: '1', deleted: false, status: 'active' })
            .populate('product_category_id', 'title')
            .limit(8)
            .exec();

        const newProducts = priceNewProduct(featuredProducts);

        res.render("client/pages/home/index.pug", {
            pageTitle: "Home",
            description: "Welcome to our home page!",
            featuredProducts: featuredProducts,
            products: newProducts,
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }


}

