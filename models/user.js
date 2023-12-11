// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'staff', 'customer'],
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'pending', 'banned'],
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    address: {
        type: String,
    },
    createAt: {
        type: String,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);
const bcrypt = require('bcrypt');
const moment = require('moment');
try {
    // Tạo tài khoản admin/admin
    User.findOne({ username: 'admin' }).then(async (user) => {
        if (!user) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            User.create({
                email: 'admin@gmail.com',
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                status: 'active',
                name: 'Admin',
                phone: '0123456789',
                address: 'TP HCM',
                avatar: '',
                createAt: moment().format('MM/DD/YYYY, hh:mm:ss')
            }).then((user) => {
                console.log('Tạo tài khoản admin thành công');
            });
        } else {
            console.log('Tài khoản admin đã tồn tại');
        }
    });
} catch (error) {
    console.log(error)
}
module.exports = User;
