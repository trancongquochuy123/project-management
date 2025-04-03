module.exports.index = (req, res) => {
    res.render("client/pages/products/index.pug", {
        pageTitle: "Products",
        description: "Welcome to our products page!"
    });
}