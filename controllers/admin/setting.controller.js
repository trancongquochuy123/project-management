const SettingsGeneral = require('../../models/settings-general.model');
const systemConfig = require("../../config/system");
// [GET] admin/settings/general
module.exports.generalGet = async (req, res) => {
    const settingsGeneral = await SettingsGeneral.findOne();
    res.render("admin/pages/settings/general.pug", {
        pageTitle: "General Settings",
        description: "Manage your general settings.",
        settingsGeneral
    });
}

// [POST] admin/settings/general
module.exports.generalPost = async (req, res) => {
    try {
        const { websiteName, phoneNumber, address, email, copyright } = req.body;
        console.log(req.body);
        console.log(websiteName, phoneNumber, address, email, copyright);
        
        let logo = req.body.logo; // Default to existing logo
        if (req.file && req.file.path) {
            logo = req.file.path; // Update logo if a new file is uploaded
        }
        let settings = await SettingsGeneral.findOne();
        if (!settings) {
            settings = new SettingsGeneral();
        }
        settings.websiteName = websiteName;
        settings.logo = logo;
        settings.phoneNumber = phoneNumber;
        settings.address = address;
        settings.email = email;
        settings.copyright = copyright;
        await settings.save();
        res.redirect(`${systemConfig.prefixAdmin}/settings/general`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}