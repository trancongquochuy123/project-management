const Role = require('../../models/roles.model');
const systemConfig = require("../../config/system");

// [GET] admin/dashboard
module.exports.index = async (req, res) => {
    let findRoles = {
        deleted: false,
    };

    const records = await Role.find(findRoles);

    res.render("admin/pages/roles/index.pug", {
        pageTitle: "Roles",
        description: "Manage roles in the admin panel",
        records: records
    });
}

// [GET] admin/roles/create
module.exports.create = (req, res) => {
    res.render("admin/pages/roles/create.pug", {
        pageTitle: "Create Role",
        description: "Create a new role for the admin panel",
    });
}

// [POST] admin/roles/create
module.exports.createRole = async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;

        // Validate input
        if (!title) {
            req.flash('error', 'Title is required');
            return res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
        }

        // Create new role
        const newRole = new Role({
            title,
            description,
        });

        await newRole.save();

        req.flash('success', 'Role created successfully');
        return res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("Error creating role:", error);
        req.flash('error', 'An error occurred while creating the role');
        return res.redirect(`${systemConfig.prefixAdmin}/roles/create`);
    }
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const find = {
            _id: id,
            deleted: false,
        };

        const data = await Role.findOne(find);

        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        res.render("admin/pages/roles/edit.pug", {
            pageTitle: "Edit Role",
            description: "Edit an existing records category",
            record: data,
        });
    } catch (error) {
        console.error("❌  [ERROR in edit controller]", error);
        req.flash('error', 'An error occurred while loading edit page.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`); // redirect về trang danh sách sản phẩm
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

        const data = await Role.findOne(find);
        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        const { title, description } = req.body;

        const roleData = {
            title,
            description
        };

        await Role.updateOne(find, roleData);

        req.flash('success', 'Update Role successfully!');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("❌  [ERROR in editPatch controller]", error);
        req.flash('error', 'An error occurred while updating the role.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};
// [GET] admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const find = { _id: id, deleted: false };

        const data = await Role.findOne(find);
        if (!data) {
            req.flash('error', 'Role not found!');
            return res.redirect(`${systemConfig.prefixAdmin}/roles`);
        }

        res.render("admin/pages/roles/detail.pug", {
            pageTitle: "Role Details",
            description: "View Role details",
            record: data,
        });
    } catch (error) {
        console.error("❌  [ERROR in detail controller]", error);
        req.flash('error', 'An error occurred while loading Role details.');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
};

// [DELETE] admin/roles/delete/:id
module.exports.deleteRole = async (req, res) => {
    try {
        const id = req.params.id;

        await Role.findByIdAndUpdate(id, {
            deleted: true,
            deletedAt: new Date()
        });

        req.flash('success', 'Delete role successfully!');

        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.error("Error in delete item:", error);
        req.flash('error', 'An error occurred while deleting the role.');
        res.redirect(req.get('referer') || `${systemConfig.prefixAdmin}/roles`);
    }
}
