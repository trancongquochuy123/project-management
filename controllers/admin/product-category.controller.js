const ProductCategory = require("../../models/product-category");
const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination");
const createTreeHelper = require("../../helper/createTree");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    let findProducts = {
        deleted: false,
    };

    // Pagination
    const countProducts = await ProductCategory.countDocuments(findProducts);

    const objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 5,
        },
        req.query,
        countProducts
    );
    // End Pagination

    const records = await ProductCategory.find(findProducts)

    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/products-category/index.pug", {
        pageTitle: "Products Category",
        description: "Welcome to the products category!",
        records: newRecords,
        pagination: objectPagination,
    });
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let findProducts = {
        deleted: false,
    };

    const records = await ProductCategory.find(findProducts);

    const newRecords = createTreeHelper.createTree(records);

    res.render("admin/pages/products-category/create.pug", {
        pageTitle: "Create Product Category",
        description: "Create a new product category",
        records: newRecords,
    });
}

// [POST] /admin/products-category/create
module.exports.createProduct = async (req, res) => {

    const { title, parent_id, description, images, thumbnail, status, position } = req.body;

    const categoryData = {
        title,
        description,
        images,
        thumbnail,
        status,
        position,
    };

    if (categoryData.position != "") {
        categoryData.position = parseInt(categoryData.position);
    } else {
        const counts = await ProductCategory.countDocuments();
        categoryData.position = counts + 1;
    }

    // Nếu parent_id không phải chuỗi rỗng thì gán vào
    if (parent_id && parent_id !== '') {
        categoryData.parent_id = parent_id;
    }

    const record = new ProductCategory(categoryData);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`); // redirect về trang danh sách sản phẩm
}
