const User = require('../models/user');
const bcrypt = require('bcrypt');
const moment = require('moment');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');
require('dotenv').config();

exports.index = async (req, res) => {
    const users = await User.find();
    res.status(200).json({ data: users });
}

function generateToken(username) {
    // Generate a token with a validity of 1 minute
    const token = jwt.sign({ username }, 'phonestore', { expiresIn: '1m' });
    return token;
}

exports.postAddStaff = async (req, res) => {
    try {
        const { email, name } = req.body;
        const username = email.split('@')[0];
        const hashedPassword = await bcrypt.hash(username, 10);
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
            name,
            role: 'staff',
            status: 'pending_verify',
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

        // Gửi email thông báo
        const token = generateToken(username);

        const url = `${process.env.URL}/auth/verify/${token}`;
        const mailResult = await mailer.sendMail(email, 'Phone Store - Your account has been created', `Hi ${name},\n\nYou are receiving this email because your account has been created.\n\nPlease click on the following link ${url} to verify your account.\n\nThis link will expire in 1 minute.\n\nIf you want request again, please contact Admin.\n`);
        if (mailResult.status === 'error') {
            res.status(500).json({ message: mailResult.message });
        } else {
            console.log(mailResult.message)
            res.status(200).json({ data: user, message: 'Create staff successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

exports.resendVerifyEmail = async (req, res) => {
    try {
        const { username, email, name } = req.body;
        const token = generateToken(username);
        const url = `${process.env.URL}/auth/verify/${token}`;
        const mailResult = await mailer.sendMail(email, 'Phone Store - Your account has been created', `Hi ${name},\n\nYou are receiving this email because your account has been created.\n\nPlease click on the following link ${url} to verify your account.\n\nThis link will expire in 1 minute.\n\nIf you want request again, please contact Admin.\n`);
        if (mailResult.status === 'error') {
            res.status(500).json({ message: mailResult.message });
        } else {
            console.log(mailResult.message)
            res.status(200).json({ message: 'Resend email successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

exports.changeAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ message: 'Token invalid' });
        }
        console.log("avatar", avatar)
        // Verify token
        const decoded = jwt.verify(token, 'phonestore').data;
        const { username } = decoded;
        const user = await User.findOneAndUpdate({ username }, { avatar });
        res.status(200).json({ data: req.user, message: 'Change avatar successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

exports.checkCustomer = async (req, res) => {
    const { phone } = req.params;
    try {
        const user = await User.findOne({ phone, role: 'customer' });
        if (user) {
            res.status(200).json({ data: user });

        } else {
            res.status(201).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createCustomer = async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        const user = await User.create({
            username: phone,
            name,
            phone,
            address,
            role: 'customer',
            status: 'active',
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        res.status(200).json({ data: user, message: 'Create customer successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}