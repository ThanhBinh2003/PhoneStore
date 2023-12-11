const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const moment = require('moment');
exports.postRegister = async (req, res) => {
    try {
        const { username, avatar, name, email, password, phone, role, address, status } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Chuyển hướng về trang đăng ký với thông báo lỗi
            req.flash('error', 'Người dùng đã tồn tại');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            name: name,
            phone: phone,
            status: status,
            avatar: avatar,
            address: address,
            role: role,
            createAt: moment().format('MM/DD/YYYY, hh:mm:ss')
        });

        await newUser.save();

        res.status(200).json({ data: newUser, message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Cấu hình Passport LocalStrategy
passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            // Tìm người dùng trong cơ sở dữ liệu theo email
            const user = await User.findOne({ username });

            // Kiểm tra người dùng
            if (!user) {
                return done(null, false, { message: 'Tài khoản hoặc mật khẩu không đúng' });
            }

            // So sánh mật khẩu
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    // Mật khẩu khớp, tạo token
                    const token = jwt.sign({ _id: user._id, data: user }, 'phonestore', { expiresIn: '24h' });
                    return done(null, user, { token });
                } else {
                    // Mật khẩu không khớp, trả về thông báo lỗi
                    return done(null, false, { message: 'Tài khoản hoặc mật khẩu không đúng' });
                }
            });

        } catch (error) {
            return done(error);
        }
    }
));

// Cấu hình Passport serialization và deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});



//Lấy trang đăng nhập
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Đăng nhập',
    });
}

// Đăng nhập người dùng
exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }
        // Đăng nhập thành công
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            res.cookie('token', info.token, { maxAge: 60 * 60 * 1000 }); // Cookie hết hạn sau 60 phút (60 * 60 * 1000 ms)
            const data = user;
            // Xóa mật khẩu trong data trả về
            data.password = undefined;
            return res.status(200).json({ data: data });
        });
    })(req, res, next);
}

// Đăng xuất người dùng
exports.logout = (req, res) => {
    req.logout(function (err) {
        //delete cookies
        res.clearCookie('token');
        if (err) { return next(err); }
        res.redirect('/');
    });
}
