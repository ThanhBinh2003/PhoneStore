exports.index = (req, res) => {
    const title = "Trang cá nhân";
    res.render('account/index', { title });
}