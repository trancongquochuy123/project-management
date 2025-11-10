const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");

const { priceNewProduct, getPriceNew } = require('../../helper/products.js');
const { getSubCategories } = require('../../helper/product-category.js');

// [GET] /products
module.exports.index = async (req, res) => {
    try {

        const products = await Product.find({
            deleted: false,
            status: "active",
        })
            .populate('product_category_id', 'title')
            .sort({ position: "desc" });

        const newProducts = priceNewProduct(products);

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
        const product = await Product
            .findOne({ slug: slug, deleted: false, status: "active" })
            .populate('product_category_id', 'title slug')
            .sort({ position: "desc" });

        if (!product) {
            return res.status(404).send("Product not found");
        }

        product.priceNew = getPriceNew(product.price, product.discountPercentage);

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


// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
    const slugCategory = req.params.slugCategory;

    try {
        // Lấy category cha
        const parentCategory = await ProductCategory.findOne({ slug: slugCategory, deleted: false, status: "active" });
        if (!parentCategory) {
            return res.status(404).send("Category not found");
        }

        const allSubCategories = await getSubCategories(parentCategory._id);

        // Lấy danh sách category ids (bao gồm cả parent)
        const categoryIds = [parentCategory._id, ...allSubCategories.map(c => c._id)];

        // Lấy sản phẩm thuộc các category này
        const products = await Product
            .find({ product_category_id: { $in: categoryIds }, deleted: false })
            .populate('product_category_id', 'title').sort({ createdAt: 'desc' });

        const newProducts = priceNewProduct(products);

        // Render view
        res.render("client/pages/products/category.pug", {
            pageTitle: `Products in ${parentCategory.title}`,
            description: "Welcome to our products page!",
            products: newProducts,
            category: parentCategory
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

