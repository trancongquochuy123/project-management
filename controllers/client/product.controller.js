const Product = require("../../models/product.model");

// [GET] /products
module.exports.index = async (req, res) => {
    try {

        const products = await Product.find({
            deleted: false,
            status: "active",
        }).sort({ position: "desc" });

        // products.forEach(item => {
        //     item.priceNew = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2); 
        // });

        const newProducts = products.map(item => {
            item.priceNew = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2);
            return item;
        });

        res.render("client/pages/products/index.pug", {
            pageTitle: "Products",
            description: "Welcome to our products page!",
            products: newProducts,
        });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }
};


// [GET] /products/:slug
module.exports.detail = async (req, res) => {
    const slug = req.params.slug;
    try {
        const product = await Product.findOne({ slug: slug, deleted: false, status: "active" });
        if (!product) {
            return res.status(404).send("Product not found");
        }
        product.priceNew = (product.price - (product.price * product.discountPercentage) / 100).toFixed(2);
        res.render("client/pages/products/detail.pug", {
            pageTitle: product.title,
            description: product.description || "Product details",
            product: product,
        });
    } catch (err) {
        console.error("Error fetching product details:", err);
        res.status(500).send("Internal Server Error");

    }
}