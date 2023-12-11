exports.index = (req, res) => {
    const title = "Trang chủ";
    res.render('home/index', { title: title });
};
