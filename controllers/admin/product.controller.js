// [GET] admin/products
const Product = require("../../models/product.model");
module.exports.index = async (req, res) => {
    // console.log(req.query.status);
    let filterStatus = [

        {
            name: "All",
            status: "",
            class: ""
        },
        {
            name: "Active",
            status: "active",
            class: ""
        },
        {
            name: "Inactive",
            status: "inactive",
            class: ""
        },
    ]

    if (req.query.status) {
        const index = filterStatus.findIndex(
            item => item.status === req.query.status
        );
        filterStatus[index].class = "active";
    } else {
        const index = filterStatus.findIndex(
            item => item.status === ""
        );
        filterStatus[index].class = "active";
    }

    let findProducts = {
        deleted: false,
    };

    if (req.query.status) {
        findProducts.status = req.query.status;
    }

    let keyword = "";

    if (req.query.keyword) {
        keyword = req.query.keyword;

        const regex = new RegExp(keyword, "i"); // 'i' for case-insensitive
        findProducts.title = regex;
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
        keyword: keyword,
    });
}