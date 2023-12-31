const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Category = require('../models/category');
const User = require('../models/user');
// Kiểm tra token
const checkToken = (req, res, next) => {
    const cookies = req.cookies; // Lấy danh sách cookies
    const token = cookies.token; // Lấy giá trị của cookie có tên "token"

    if (!token) {
        console.log('Không có token');
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, 'phonestore'); // Giải mã token
        next(); // Tiếp tục xử lý các tác vụ trong route hoặc chuyển tới route tiếp theo
    } catch (error) {
        console.log('Middleware error - checkToken[1]:')
        return res.redirect('/auth/login');
    }
};

const getUser = async (req, res, next) => {
    res.locals.title = 'Phone Store'
    const cookies = req.cookies;
    const token = cookies.token;
    //get Category
    try {
        const categories = await Category.find();
        if (categories) {
            res.locals.categories = categories;
        } else {
            res.locals.categories = null;
        }
    } catch (error) {
        console.log('Middleware error - GetUser[1]:')
        res.locals.categories = null;
    }

    // handle data for header
    if (token) {
        try {
            const decoded = jwt.verify(token, 'phonestore');
            let userData = await User.findOne({ username: decoded.data.username });
            req.user = userData;
            res.locals.user = userData;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                // Token has expired
                res.locals.user = null;
            } else {
                // Other error occurred during token verification
                res.locals.user = null;
                console.log('Middleware error - GetUser[2]:')
            }
        }
    } else {
        res.locals.user = null;
    }

    next();
}

const checkRole = (roles) => {
    return (req, res, next) => {
        const cookies = req.cookies; // Lấy danh sách cookies
        const token = cookies.token; // Lấy giá trị của cookie có tên "token"
        const decoded = jwt.verify(token, 'phonestore'); // Giải mã token
        if (roles.includes(decoded.data.role)) {
            if (decoded.data.status == 'active') {
                return next();
            } else if (decoded.data.status == 'pending_password') {
                return res.redirect('/auth/changepassword');
            } else {
                return res.redirect('/auth/login');
            }
        } else {
            return res.redirect('/auth/login');
        }
    }
}

module.exports = {
    checkToken,
    getUser,
    checkRole
};