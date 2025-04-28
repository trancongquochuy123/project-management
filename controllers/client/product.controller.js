const Product = require("../../models/product.model");
module.exports.index = async (req, res) => {
    try {
        console.log("Fetching products...");

        const products = await Product.find({}).limit(10);

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
