const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const { processDescription } = require("../../helper/handleDescriptionImage");
const createTreeHelper = require("../../helper/createTree");

// [GET] /products
module.exports.index = async (req, res) => {
    try {
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

        // Sort 
        let sort = {};

        if (req.query.sortKey && req.query.sortValue) {
            const { sortKey, sortValue } = req.query;
            sort[sortKey] = sortValue === 'asc' ? 1 : -1;
        } else {
            sort.position = -1;
        }
        // End Sort

        const products = await Product.find(findProducts)
            .populate('product_category_id', 'title')
            .sort(sort)
            .limit(objectPagination.limitItem)
            .skip(objectPagination.skip);

        const newProducts = products.map(item => {
            item.priceNew = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2);
            return item;
        });

        // Lỗi do schema của mongoose trả về là một object chứ không phải là một plain JS object (cụ thể hơn
        // Kiểu	| Có truy cập được position không? | Ghi chú
        // item (Mongoose document) |	❌ Có thể undefined nếu không trong schema hoặc không được chọn | Mongoose không hiển thị hết các trường tùy config
        // item.toObject()	| ✅ Truy cập đầy đủ các trường | Plain JavaScript object
        // )
        // const newProducts = products.map(item => {
        //     const plainItem = item.toObject(); // chuyển về plain JS object

        //     plainItem.priceNew = (plainItem.price - (plainItem.price * plainItem.discountPercentage) / 100).toFixed(2);

        //     console.log(plainItem.position); // now '100'
        //     plainItem.position = Number(plainItem.position);
        //     console.log(plainItem.position); // now 100

        //     return plainItem;
        // });

        for (const product of products) {
            // Lấy ra thông tin người tạo 
            const user = await Account.findById(product.createdBy.accountId).select("fullName").lean();
            if (!user) continue;
            product.accountFullName = user.fullName;

            // Lấy ra thông tin người update mới nhất
            const lastUpdated = product.updatedBy[product.updatedBy.length - 1];
            if (lastUpdated) {
                const userUpdate = await Account.findById(lastUpdated.accountId).select("fullName").lean();
                if (userUpdate) {
                    product.accountUpdateFullName = userUpdate.fullName;
                }
            }
        }

        res.render("admin/pages/products/index.pug", {
            pageTitle: "Products",
            description: "Welcome to the admin products!",
            products: newProducts,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            pagination: objectPagination,
        });
    } catch (error) {
        console.error("Error in products index:", error);
        req.flash('error', 'An error occurred while loading products.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [PATCH] admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const status = req.params.status;
        const id = req.params.id;

        await Product.findByIdAndUpdate(id, {
            status: status,
            $push: {
                updatedBy: {
                    accountId: res.locals.user._id,
                    updatedAt: new Date()
                }
            }
        });

        req.flash('success', 'Change status product successfully!');

        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        console.error("Error in change status:", error);
        req.flash('error', 'An error occurred while changing product status.');
        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    }
}

// [PATCH] admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        // Validation: Kiểm tra req.body.ids có tồn tại không
        if (!req.body.ids || req.body.ids.trim() === '') {
            req.flash('error', 'No products selected.');
            return res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
        }

        const ids = req.body.ids.split(", ");
        const type = req.body.type;

        switch (type) {
            case "active":
            case "inactive":
                await Product.updateMany(
                    { _id: { $in: ids } },
                    {
                        status: type,
                        $push: {
                            updatedBy: {
                                accountId: res.locals.user._id,
                                updatedAt: new Date()
                            }
                        }
                    }
                );
                req.flash('success', `Change status of ${ids.length} product successfully!`);
                break;

            case "delete-all":
                await Product.updateMany(
                    { _id: { $in: ids } },
                    {
                        deleted: true,
                        deletedBy: {
                            accountId: res.locals.user._id,
                            deletedAt: new Date()
                        }
                    }
                );
                req.flash('success', `Delete ${ids.length} product successfully!`);
                break;

            case "change-position":
                await Promise.all(ids.map(async (item) => {
                    let [id, position] = item.split("-");
                    position = parseInt(position);
                    await Product.findByIdAndUpdate(id, {
                        position: position,
                        $push: {
                            updatedBy: {
                                accountId: res.locals.user._id,
                                updatedAt: new Date()
                            }
                        }
                    });
                }));
                req.flash('success', `Change position of ${ids.length} product successfully!`);
                break;

            default:
                req.flash('error', 'Invalid action type.');
                break;
        }


        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        console.error("Error in change multi:", error);
        req.flash('error', 'An error occurred while updating products.');
        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    }
}

// [DELETE] admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        const id = req.params.id;

        await Product.findByIdAndUpdate(id, {
            deleted: true,
            deletedBy: {
                accountId: res.locals.user._id,
                deletedAt: new Date(),
            }
        });

        req.flash('success', 'Delete product successfully!');

        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        console.error("Error in delete item:", error);
        req.flash('error', 'An error occurred while deleting the product.');
        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
    }
}

// [GET] admin/products/create
module.exports.create = async (req, res) => {
    try {
        let findProducts = {
            deleted: false,
        };

        const records = await ProductCategory.find(findProducts);

        const newCategory = createTreeHelper.createTree(records);

        for (const record of records) {
            if (record.createdBy && record.createdBy.accountId) {
                const account = await Account.findById(record.createdBy.accountId);
                if (!account) continue;
                record.accountFullname = account.fullName;
            }
        }

        res.render("admin/pages/products/create.pug", {
            pageTitle: "Create Product",
            category: newCategory,
        });
    } catch (error) {
        console.error("Error in create page:", error);
        req.flash('error', 'An error occurred while loading create page.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [POST] admin/products/create
module.exports.createProduct = async (req, res) => {
    try {
        req.body.price = parseFloat(req.body.price);
        req.body.discountPercentage = parseFloat(req.body.discountPercentage);
        req.body.stock = parseFloat(req.body.stock);

        if (req.body.position != "") {
            req.body.position = parseInt(req.body.position);
        } else {
            const countProducts = await Product.countDocuments();
            req.body.position = countProducts + 1;
        }

        req.body.description = await processDescription(req.body.description);

        req.body.createdBy = {
            accountId: res.locals.user._id,
            createdAt: new Date()
        }

        const product = new Product(req.body);
        await product.save();

        req.flash('success', 'Create product successfully!');

        res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        console.error("Error in create product:", error);
        req.flash('error', 'An error occurred while creating the product.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [GET] admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const find = {
            _id: id,
            deleted: false,
        };

        const product = await Product.findOne(find);

        if (!product) {
            req.flash('error', 'Product not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/products`);
        }


        const records = await ProductCategory.find({
            deleted: false,
        });

        const newCategory = createTreeHelper.createTree(records);


        res.render("admin/pages/products/edit.pug", {
            pageTitle: "Edit Product",
            product: product,
            category: newCategory,
        });
    }
    catch (error) {
        console.error("Error in edit product:", error);
        req.flash('error', 'An error occurred while editing the product.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [PATCH] admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        req.body.price = parseFloat(req.body.price);
        req.body.discountPercentage = parseFloat(req.body.discountPercentage);
        req.body.stock = parseFloat(req.body.stock);
        req.body.position = parseInt(req.body.position);

        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {
            req.flash('error', 'Product not found.');
            return res.redirect(`${systemConfig.prefixAdmin}/products`);
        }

        // Xử lý ảnh trong description
        try {
            req.body.description = await processDescription(req.body.description);
        } catch (err) {
            console.error('[CLOUDINARY UPLOAD ERROR]', err);
            req.flash('error', 'Lỗi upload ảnh trong mô tả.');
            return res.redirect(`${systemConfig.prefixAdmin}/products`);
        }

        // Tạo bản sao dữ liệu cần update, không ghi đè updatedBy
        const updateData = { ...req.body };
        delete updateData.updatedBy; // chắc chắn không ghi đè updatedBy

        await Product.findByIdAndUpdate(req.params.id, {
            ...updateData,
            $push: {
                updatedBy: {
                    accountId: res.locals.user._id,
                    updatedAt: new Date()
                }
            }
        });

        req.flash('success', 'Update product successfully!');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        console.error("Error in edit patch:", error);
        req.flash('error', 'An error occurred while updating the product.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};


// [GET] admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const find = {
            _id: id,
            deleted: false,
            status: "active"
        };

        const product = await Product.findOne(find);

        if (!product) {
            req.flash('error', 'Product not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/products`);
        }

        res.render("admin/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product,
        });
    }
    catch (error) {
        console.error("Error in product detail:", error);
        req.flash('error', 'An error occurred while loading product detail.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}