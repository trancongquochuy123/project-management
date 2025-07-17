const ProductCategory = require("../../models/product-category");
const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination");
const createTreeHelper = require("../../helper/createTree");
const { processDescription } = require("../../helper/handleDescriptionImage");


// [GET] /admin/products-category
module.exports.index = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error in products-category index:", error);
        req.flash('error', 'An error occurred while loading product categories.');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error in products-category create page:", error);
        req.flash('error', 'An error occurred while loading create page.');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}

// [POST] /admin/products-category/create
module.exports.createProduct = async (req, res) => {
    try {
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

        categoryData.description = await processDescription(req.body.description);

        if (parent_id && parent_id !== '') {
            categoryData.parent_id = parent_id;
        }

        const record = new ProductCategory(categoryData);
        await record.save();

        req.flash('success', 'Create product category successfully!');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`); // redirect về trang danh sách sản phẩm
    } catch (error) {
        console.error("❌  [ERROR in createProduct controller]", error);
        req.flash('error', 'An error occurred while creating the product category.');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const find = {
            _id: id,
            deleted: false,
        };

        const data = await ProductCategory.findOne(find);

        if (!data) {
            req.flash('error', 'Product category not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
        }

        let findProducts = {
            deleted: false,
        };

        const records = await ProductCategory.find(findProducts);

        const newRecords = createTreeHelper.createTree(records);

        res.render("admin/pages/products-category/edit.pug", {
            pageTitle: "Edit Product Category",
            description: "Edit an existing records category",
            record: data,
            newRecords: newRecords,
        });
    } catch (error) {
        console.error("❌  [ERROR in edit controller]", error);
        req.flash('error', 'An error occurred while loading edit page.');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`); // redirect về trang danh sách sản phẩm
    }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        const find = {
            _id: id,
            deleted: false,
        };

        const data = await ProductCategory.findOne(find);
        if (!data) {
            req.flash('error', 'Product category not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
        }

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

        categoryData.description = await processDescription(req.body.description);

        if (parent_id && parent_id !== '') {
            categoryData.parent_id = parent_id;
        }

        await ProductCategory.updateOne(find, categoryData);

        req.flash('success', 'Update product category successfully!');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    } catch (error) {
        console.error("❌  [ERROR in editPatch controller]", error);
        req.flash('error', 'An error occurred while updating the product category.');
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const find = { _id: id, deleted: false };

    const data = await ProductCategory.findOne(find);
    if (!data) {
      req.flash('error', 'Product category not found!');
      return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }

    // thêm đoạn load tất cả category để tìm parent
    const allCats = await ProductCategory.find({ deleted: false });
    // nếu muốn hiển thị theo cây thì:
    const records = createTreeHelper.createTree(allCats);

    res.render("admin/pages/products-category/detail.pug", {
      pageTitle: "Product Category Details",
      description: "View product category details",
      record: data,
      records,         // truyền vào đây
    });
  } catch (error) {
    console.error("❌  [ERROR in detail controller]", error);
    req.flash('error', 'An error occurred while loading product category details.');
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};
