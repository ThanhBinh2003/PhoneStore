// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
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
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'staff', 'customer'],
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'pending_verify', 'pending_password', 'banned'],
    },
    name: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        unique: true,
        default: '',
    },
    avatar: {
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/phone-c4bc5.appspot.com/o/default_avatar.jpg?alt=media&token=0ff85744-9209-457b-aaf8-66d1f6893155',
    },
    address: {
        type: String,
        default: '',
    },
    createdAt: {
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
                phone: '',
                address: 'TP HCM',
                createdAt: moment().format('MM/DD/YYYY, hh:mm:ss')
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
