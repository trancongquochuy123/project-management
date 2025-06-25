const Product = require("../../models/product.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");

// [GET] /products

module.exports.index = async (req, res) => {
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

    const products = await Product.find(findProducts)
        .sort({ position: "desc" })
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

    res.render("admin/pages/products/index.pug", {
        pageTitle: "Products",
        description: "Welcome to the admin products!",
        products: newProducts,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
    });
}


// [PATCH] admin/products/change-status/:status/:id

module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.findByIdAndUpdate(id, { status: status });

    req.flash('success', 'Change status product successfully!');

    res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
}

// [PATCH] admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const ids = req.body.ids.split(", ")
    const type = req.body.type;

    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash('success', `Change status of ${ids.length} product successfully!`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash('success', `Change status of ${ids.length} product successfully!`);
            break;
        case "delete-all":
            await Product.updateMany({ _id: { $in: ids } }, {
                deleted: true,
                deletedAt: new Date()
            });
            req.flash('success', `Delete ${ids.length} product successfully!`);
            break;
        case "change-position":
            ids.forEach(async (item) => {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await Product.findByIdAndUpdate(id, { position: position });
            })
            req.flash('success', `Change position of ${ids.length} product successfully!`);
            break;
        default:
            break;
    }


    res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
}

// [DELETE] admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Product.findByIdAndUpdate(id, {
        deleted: true,
        deletedAt: new Date()
    });

    res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/products`);
}

// [GET] admin/products/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create.pug", {
        pageTitle: "Create Product",
    });
}

// [POST] admin/products/create
module.exports.createProduct = async (req, res) => {
    req.body.price = parseFloat(req.body.price);
    req.body.discountPercentage = parseFloat(req.body.discountPercentage);
    req.body.stock = parseFloat(req.body.stock);

    if (req.body.position != "") {
        req.body.position = parseInt(req.body.position);
    } else {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    }

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
        // req.body.thumbnail = req.file.path.replace(/\\/g, "/").replace("public", "");
    }
    const product = new Product(req.body);
    await product.save();

    req.flash('success', 'Create product successfully!');

    res.redirect(`${systemConfig.prefixAdmin}/products`);
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

        res.render("admin/pages/products/edit.pug", {
            pageTitle: "Edit Product",
            product: product,
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
    req.body.price = parseFloat(req.body.price);
    req.body.discountPercentage = parseFloat(req.body.discountPercentage);
    req.body.stock = parseFloat(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
        // req.body.thumbnail = req.file.path.replace(/\\/g, "/").replace("public", "");
    }
    try {
        await Product.findByIdAndUpdate(
            { _id: req.params.id },
            req.body
        ) 
        req.flash('success', 'Update product successfully!')
    } catch (error) {
        req.flash('error', 'An error occurred while updating the product.');
    }

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}   

// [GET] admin/products/detail/:id
module.exports.detail = async (req, res) => {
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

        res.render("admin/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product,
        });
    }
    catch (error) {
        console.error("Error in product:", error);
        req.flash('error', 'An error occurred in the product.');
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}