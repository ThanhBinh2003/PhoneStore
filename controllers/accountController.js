exports.index = (req, res) => {
    const title = "Profile";
    res.render('account/index', { title, page: 'page/account.ejs' });
}

exports.dashboard = (req, res) => {
    const title = "Dashboard";
    res.render('account/index', { title, page: 'page/dashboard.ejs' });
}

exports.user = (req, res) => {
    const title = "User management";
    res.render('account/index', { title, page: 'page/user.ejs' });
}

exports.category = (req, res) => {
    const title = "Category management";
    res.render('account/index', { title, page: 'page/category.ejs' });
}

exports.product = (req, res) => {
    const title = "Product management";
    res.render('account/index', { title, page: 'page/product.ejs' });
}

exports.order = (req, res) => {
    const title = "Order management";
    res.render('account/index', { title, page: 'page/order.ejs' });
}

