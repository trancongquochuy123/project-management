// [GET] /
module.exports.index = async (req, res) => {
  

    res.render("client/pages/home/index.pug", {
        pageTitle: "Home",
        description: "Welcome to our home page!",
        layoutProductCategories: res.locals.layoutProductCategories,
    });
}