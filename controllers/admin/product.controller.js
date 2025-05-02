// [GET] admin/products
const Product = require("../../models/product.model");

const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
module.exports.index = async (req, res) => {
    // console.log(req.query.status);
    
    const filterStatus = filterStatusHelper(req.query);

    console.log(filterStatus);

    let findProducts = {
        deleted: false,
    };

    if (req.query.status) {
        findProducts.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.keyword) {
        findProducts.title = objectSearch.regex;
    }

    const products = await Product.find(findProducts);

    const newProducts = products.map(item => {
        item.priceNew = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2);
        return item;
    });

    res.render("admin/pages/products/index.pug", {
        pageTitle: "Products",
        description: "Welcome to the admin products!",
        products: newProducts,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
    });
}