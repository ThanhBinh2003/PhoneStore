const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();

// Thiết lập EJS làm template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use('/static', express.static(path.join(__dirname, 'public')));

// Cấu hình parser
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))

// Cấu hình session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Kết nối đến cơ sở dữ liệu MongoDB
const uri = process.env.MONGODB_URI

mongoose.connect(uri, {}).then(() => {
    console.log('Kết nối cơ sở dữ liệu thành công:\n', uri);
}).catch((error) => {
    console.error('Lỗi kết nối cơ sở dữ liệu:', error);
});

// Middleware xử lý dữ liệu đầu vào
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { checkToken, getUser, checkRole } = require('./middlewares/auth');

app.use(getUser);

// Sử dụng router
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

app.use('/account', checkToken, checkRole(['admin', 'mod']), require('./routes/account'))
app.use('/user', require('./routes/user'));
app.use('/auth', require('./routes/auth'));
app.use('/category', require('./routes/category'))
app.use('/product', require('./routes/product'))


app.use('/', require('./routes/home'));

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server đang chạy: http://localhost:${PORT}`);
});