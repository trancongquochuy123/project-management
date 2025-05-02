// [GET] admin/products
const Product = require("../../models/product.model");

const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
module.exports.index = async (req, res) => {
    // console.log(req.query.status);

    const filterStatus = filterStatusHelper(req.query);

    let findProducts = {
        deleted: false,
    };

    if (req.query.status) {
        findProducts.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        findProducts.title = objectSearch.regex;
    }

    // Pagination
    const countProducts = await Product.countDocuments(findProducts);

    const objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 5,
        },
        req.query,
        countProducts
    );

    // End Pagination

    const products = await Product.find(findProducts).limit(objectPagination.limitItem).skip(objectPagination.skip);

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
        pagination: objectPagination,
    });
}