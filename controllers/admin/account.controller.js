const Account = require('../../models/account.model');
const Role = require('../../models/role.model');
const systemConfig = require("../../config/system");
var md5 = require('md5');

// [GET] admin/accounts
module.exports.index = async (req, res) => {

    let findAccounts = {
        deleted: false,
    };

    const records = await Account.find(findAccounts).select("-password -token");

    for (const record of records) {
        const role = await Role.findOne({
            deleted: false,
            _id: record.roleId
        });
        record.role = role;
    }

    res.render("admin/pages/accounts/index.pug", {
        pageTitle: "Accounts",
        description: "Manage accounts in the admin panel",
        records: records
    });
}


// [GET] admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({ deleted: false });

    let findAccounts = {
        deleted: false
    };

    const records = await Account.find(findAccounts);

    res.render("admin/pages/accounts/create.pug", {
        pageTitle: "Create Account",
        description: "Create a new account in the admin panel",
        records: records,
        roles: roles
    });
}

// [POST] admin/accounts/create
module.exports.createAccount = async (req, res) => {
    try {
        const { fullName, email, password, phone, roleId, status, avatar } = req.body;

        const existingAccount = await Account.findOne({ email });

        if (existingAccount) {
            req.flash("error", "Email already exists");
            return res.redirect(`${systemConfig.prefixAdmin}/accounts/create`);
        }
        // Validate and create the account
        const newAccount = new Account({
            fullName,
            email,
            password: md5(password),
            phone,
            roleId,
            status,
            avatar
        });

        await newAccount.save();

        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        console.error("Error creating account:", error);
        req.flash("error", "An error occurred while creating the account");
        res.redirect(`${systemConfig.prefixAdmin}/accounts/create`);
    }
}