const ProductCategory = require("../../models/product-category.model");
const createTreeHelper = require("../../helper/createTree");

module.exports.category = async (req, res, next) => {

    try {
        const productCategories = await ProductCategory.find({ deleted: false });

        const newProductCategories = createTreeHelper.createTree(productCategories);

        res.locals.layoutProductCategories = newProductCategories;

    } catch (error) {
        console.error('Error in category middleware:', error);
        return res.status(500).send('Internal Server Error');

    }
    next();

}