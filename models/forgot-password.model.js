const mongoose = require('mongoose');
const generate = require('../helper/generate');

// Define forgot-password schema
const forgotPasswordSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
    },
    {
        timestamps: true,
    }
);

// Export ForgotPassword model
const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema, 'forgot-password');
module.exports = ForgotPassword;