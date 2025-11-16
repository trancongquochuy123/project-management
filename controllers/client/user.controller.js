const User = require('../../models/user.model.js');
const md5 = require('md5');
const ForgotPassword = require('../../models/forgot-password.model.js');
const generate = require('../../helper/generate.js');
const sendMailHelper = require('../../helper/sendMail.js');

// [GET] /register
module.exports.register = async (req, res) => {
    try {
        res.render("client/pages/user/register.pug", {
            pageTitle: "Register",
            description: "Create a new account",
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /register
module.exports.registerPost = async (req, res) => {
    try {
        const existEmail = await User.findOne({ email: req.body.email });
        if (existEmail) {
            req.flash('error', 'Email đã tồn tại!');
            return res.status(400).render("client/pages/user/register.pug", {
                pageTitle: "Register",
                description: "Create a new account",
                errorMessage: "Email đã tồn tại!",
            });
        }

        const { fullName, email, password } = req.body;
        // Add user registration logic here
        const hashedPassword = md5(password);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.cookie('tokenUser', newUser.tokenUser, { httpOnly: true });

        res.redirect('/user/login');
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Internal Server Error");
    }
}


// [GET] /login
module.exports.login = async (req, res) => {
    try {
        res.render("client/pages/user/login.pug", {
            pageTitle: "Login",
            description: "Login to your account",
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /login
module.exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = md5(password);
        const user = await User.findOne(
            { email, deleted: false }
        );

        if (!user) {
            req.flash('error', 'Invalid email or password!');
            return res.status(400).render("client/pages/user/login.pug", {
                pageTitle: "Login",
                description: "Login to your account",
                errorMessage: "Invalid email or password!",
            });
        }

        if (!md5(password) === user.password) {
            req.flash('error', 'Invalid email or password!');
            return res.status(400).render("client/pages/user/login.pug", {
                pageTitle: "Login",
                description: "Login to your account",
                errorMessage: "Invalid email or password!",
            });
        }

        if (user.status !== 'active') {
            req.flash('error', 'Account is inactive or deleted!');
            return res.status(400).render("client/pages/user/login.pug", {
                pageTitle: "Login",
                description: "Login to your account",
                errorMessage: "Account is inactive or deleted!",
            });
        }

        res.cookie('tokenUser', user.tokenUser, { httpOnly: true });

        res.redirect('/');
    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [GET] /logout
module.exports.logout = async (req, res) => {
    try {
        res.clearCookie('tokenUser');
        res.redirect('/user/login');
    } catch (err) {
        console.error("Error logging out user:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [GET] /password/forgot
module.exports.forgotPassword = async (req, res) => {
    try {
        console.log("Rendering forgot password page");
        res.render("client/pages/user/forgot-password.pug", {
            pageTitle: "Forgot Password",
            description: "Reset your password",
        });
    } catch (err) {
        console.error("Error rendering forgot password page:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, deleted: false });
        if (!user) {
            req.flash('error', 'Email not found!');
            return res.status(400).render("client/pages/user/forgot-password.pug", {
                pageTitle: "Forgot Password",
                description: "Reset your password",
                errorMessage: "Email not found!",
            });
        }
        await ForgotPassword.deleteMany({ email });

        const otp = generate.generateOTP(8); // Generate a 8-digit OTP
        const forgotPasswordEntry = new ForgotPassword({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Set expiration time to 5 minutes from now
        });
        await forgotPasswordEntry.save();
        
        const emailTemplate = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Xác thực OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Xin chào!</h2>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Bạn hoặc ai đó đã yêu cầu lấy mã OTP cho việc xác minh tài khoản trên hệ thống.
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">
                                Mã OTP của bạn là:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="margin: 0 0 25px 0;">
                                <tr>
                                    <td style="
                                        font-size: 28px;
                                        font-weight: bold;
                                        color: #2e6bff;
                                        background-color: #f2f6ff;
                                        padding: 15px 30px;
                                        border-radius: 8px;
                                        border: 2px solid #d3e3ff;
                                        letter-spacing: 4px;
                                        text-align: center;
                                    ">
                                        ${otp}
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                Mã OTP sẽ hết hạn sau <strong style="color: #ff4757;">5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
                            </p>
                            
                            <!-- Divider -->
                            <div style="border-top: 1px solid #e0e0e0; margin: 25px 0;"></div>
                            
                            <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                Nếu bạn không yêu cầu lấy OTP, vui lòng bỏ qua email này.
                            </p>
                            
                            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                                Trân trọng,<br/>
                                <strong>Đội ngũ hỗ trợ hệ thống</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; border-radius: 0 0 8px 8px;">
                            <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                Email này được gửi tự động, vui lòng không trả lời.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        
        await sendMailHelper.sendEmail(
            email,
            "🔐 Xác thực OTP - Không chia sẻ mã này",
            emailTemplate
        );

        res.redirect('/user/password/otp?email=' + encodeURIComponent(email));
    } catch (err) {
        console.error("Error handling forgot password form submission:", err);
        res.status(500).send("Internal Server Error");
    }
}
// [GET] /password/otp
module.exports.otpPassword = async (req, res) => {
    try {
        const { email } = req.query;
        res.render("client/pages/user/otp-password.pug", {
            pageTitle: "Enter OTP",
            description: "Enter the OTP sent to your email",
            email
        });
    } catch (err) {
        console.error("Error rendering OTP page:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /password/otp
module.exports.otpPasswordPost = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            req.flash('error', 'Email and OTP are required!');
            return res.status(400).render("client/pages/user/otp-password.pug", {
                pageTitle: "Enter OTP",
                description: "Enter the OTP sent to your email",
                email: email || ''
            });
        }

        // Tìm OTP hợp lệ (chưa hết hạn)
        const otpEntry = await ForgotPassword.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() } // còn hiệu lực
        });

        if (!otpEntry) {
            req.flash('error', 'Invalid or expired OTP!');
            return res.status(400).render("client/pages/user/otp-password.pug", {
                pageTitle: "Enter OTP",
                description: "Enter the OTP sent to your email",
                email
            });
        }

        // Xoá OTP sau khi dùng để tránh dùng lại
        await ForgotPassword.deleteOne({ _id: otpEntry._id });

        const user = await User.findOne({ email, deleted: false });
        if (!user) {
            req.flash('error', 'User not found!');
            return res.status(400).render("client/pages/user/otp-password.pug", {
                pageTitle: "Enter OTP",
                description: "Enter the OTP sent to your email",
                email
            });
        }
        res.cookie('tokenUser', user.tokenUser, { httpOnly: true });
        // Chuyển hướng sang trang reset password
        res.redirect('/user/password/reset?email=' + encodeURIComponent(email));

    } catch (err) {
        console.error("Error verifying OTP:", err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.status(500).render("client/pages/user/otp-password.pug", {
            pageTitle: "Enter OTP",
            description: "Enter the OTP sent to your email",
            email: req.body.email || ''
        });
    }
};

// [GET] /password/reset
module.exports.resetPassword = async (req, res) => {
    try {
        const { email } = req.query;
        res.render("client/pages/user/reset-password.pug", {
            pageTitle: "Reset Password",
            description: "Reset your password",
            email
        });
    } catch (err) {
        console.error("Error rendering reset password page:", err);
        res.status(500).send("Internal Server Error");
    }
}

// [POST] /password/reset
module.exports.resetPasswordPost = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        const tokenUser = req.cookies.tokenUser;

        console.log("Resetting password for email:", email);
        console.log("Password:", newPassword);
        console.log("Confirm Password:", confirmPassword);

        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match!');
            return res.redirect('/user/password/reset?email=' + encodeURIComponent(email));
        }
        const hashedPassword = md5(newPassword);
        await User.updateOne(
            { tokenUser, deleted: false },
            { $set: { password: hashedPassword } }
        );
        req.flash('success', 'Password has been reset successfully!');
        res.redirect('/user/login');
    }
    catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).send("Internal Server Error");
    }
};