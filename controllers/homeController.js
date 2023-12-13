exports.index = (req, res) => {
    const title = "Home - Phone Store";
    res.render('home/index', { title: title });
};
