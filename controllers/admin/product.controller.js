module.exports.index = (req, res) => { 
    res.render("admin/pages/products/index.pug", {
        pageTitle: "Products",
        description: "Welcome to the admin products!"
    });
}