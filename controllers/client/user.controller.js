const User = require('../../models/user.model.js');
const md5 = require('md5');
const ForgotPassword = require('../../models/forgot-password.model.js');
const generate = require('../../helper/generate.js');
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
        const otp = generate.generateOTP(8); // Generate a 8-digit OTP
        const forgotPasswordEntry = new ForgotPassword({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Set expiration time to 5 minutes from now
        });
        await forgotPasswordEntry.save();

        // Add logic to handle forgot password form submission
        // For example, send the OTP to the user's email address
        // You can use a service like nodemailer to send emails
        // Example:
        // await sendEmail(email, "Your OTP", `Your OTP is: ${otp}`);


        res.send("Forgot password form submitted");
    } catch (err) {
        console.error("Error handling forgot password form submission:", err);
        res.status(500).send("Internal Server Error");
    }
}