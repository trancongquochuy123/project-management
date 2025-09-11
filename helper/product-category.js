const ProductCategory = require("../models/product-category.model");
module.exports.getSubCategories = async (parentId) => {
    const getCategory = async (parentId) => {
        const subs = await ProductCategory.find({ parent_id: parentId, status: "active", deleted: false });
        let allSubs = [...subs];

        for (const sub of subs) {
            const children = await getCategory(sub._id);
            allSubs = allSubs.concat(children);
        }
        return allSubs;
    }

    const result = await getCategory(parentId);
    return result;
};
