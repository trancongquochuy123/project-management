const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports.sendEmail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: `"Web Sản Phẩm thương mại" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });

        return true;

    } catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }
};