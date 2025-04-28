// [GET] admin/products
const Product = require("../../models/product.model");
module.exports.index = async (req, res) => { 

    const products = await Product.find({
        deleted: false,
        status: "active",
    }).limit(10);

    const newProducts = products.map(item => {    
        item.priceNew = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2); 
        return item;
    });


    res.render("admin/pages/products/index.pug", {
        pageTitle: "Products",
        description: "Welcome to the admin products!",
        products: newProducts,
    });
}