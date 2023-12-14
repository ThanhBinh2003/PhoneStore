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
            createdAt: moment().format('MM/DD/YYYY, hh:mm:ss')
        });

        await newUser.save();

        res.status(200).json({ data: newUser, message: 'Register successfully' });
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
                return done(null, false, { message: 'Username or password incorrect' });
            }

            // Kiểm tra trạng thái tài khoản
            if (user.status === 'inactive' || user.status === 'banned') {
                return done(null, false, { message: 'Your account not available. Please contact admin for more information!' });
            }
            if (user.status === 'pending_verify') {
                return done(null, false, { message: 'Your account is pending verify. Please login by clicking on the link in your email.' });
            }

            // So sánh mật khẩu
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    // Mật khẩu khớp, tạo token
                    const token = jwt.sign({ _id: user._id, data: user }, 'phonestore', { expiresIn: '24h' });
                    return done(null, user, { token });
                } else {
                    // Mật khẩu không khớp, trả về thông báo lỗi
                    return done(null, false, { message: 'Username or password incorrect' });
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
    const title = "Login";
    res.render('auth/login', { title });
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
        if (user.status === 'inactive' || user.status === 'banned') {
            return res.status(400).json({ message: 'Your account not available. Please contact admin for more information!' });
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

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) {
            console.log('Token không hợp lệ 1')
            return res.status(400).json({ message: 'Token invalid' });
        }
        // Verify token
        jwt.verify(token, 'phonestore', async (err, decoded) => {
            if (err) {
                console.log('Token không hợp lệ 2')
                return res.status(400).json({ message: 'Token invalid' });
            }
            const { username } = decoded;
            const user = await User.findOne({ username });
            if (!user) {
                console.log('Token không hợp lệ 3')
                return res.status(400).json({ message: 'Token invalid' });
            }
            user.status = 'pending_password';
            await user.save();
            // Log in the user
            req.logIn(user, (err) => {
                if (err) {
                    console.log('Error logging in user after email verification:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                const new_token = jwt.sign({ _id: user._id, data: user }, 'phonestore', { expiresIn: '24h' });
                res.cookie('token', new_token, { maxAge: 60 * 60 * 1000 }); // Set the token in the cookie
                // Redirect or respond as needed after login
                return res.redirect('/auth/changepassword');
            });
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Change password
exports.getChangePassword = (req, res) => {
    res.render('auth/changepassword', {
        title: 'Change password',
    });
}

exports.postChangePassword = async (req, res) => {
    try {
        const { password, oldPassword } = req.body;
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ message: 'Token invalid' });
        }
        // Verify token

        const decoded = jwt.verify(token, 'phonestore').data;
        const { username } = decoded;
        const user = await User.findOne({ username });
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!user) {
            return res.status(400).json({ message: 'Token invalid' });
        }
        if (user.status !== 'pending_password') {
            // check old password
            if (!oldPassword) {
                return res.status(400).json({ message: 'Old password is required' });
            }
            const result = await bcrypt.compare(oldPassword, user.password);
            if (!result) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            } else {
                user.password = hashedPassword;
                user.status = 'active';
                await user.save();
                const new_token = jwt.sign({ _id: user._id, data: user }, 'phonestore', { expiresIn: '24h' });
                res.cookie('token', new_token, { maxAge: 60 * 60 * 1000 }); // Set the token in the cookie
                return res.status(200).json({ message: 'Change password successfully' });
            }
        } else {
            user.password = hashedPassword;
            user.status = 'active';
            await user.save();
            const new_token = jwt.sign({ _id: user._id, data: user }, 'phonestore', { expiresIn: '24h' });
            res.cookie('token', new_token, { maxAge: 60 * 60 * 1000 }); // Set the token in the cookie
            return res.status(200).json({ message: 'Change password successfully' });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}