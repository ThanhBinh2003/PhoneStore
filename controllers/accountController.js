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