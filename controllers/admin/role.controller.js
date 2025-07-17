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

