const SettingsGeneral = require('../../models/settings-general.model');
const systemConfig = require("../../config/system");

module.exports.SettingGeneral = async (req, res, next) => {
    const settingsGeneral = await SettingsGeneral.findOne();
    res.locals.settingsGeneral = settingsGeneral;
    next();
}
