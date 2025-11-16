const mongoose = require('mongoose');

// Define settings-general schema
const settingsGeneralSchema = new mongoose.Schema(
    {
        websiteName: { type: String, required: true },
        logo: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        email: { type: String },
        copyright: { type: String },
    },
    {
        timestamps: true,
    }
);

// Export SettingsGeneral model
const SettingsGeneral = mongoose.model('SettingsGeneral', settingsGeneralSchema, 'settings-general');
module.exports = SettingsGeneral;