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
    const token = jwt.sign({ username }, 'phonestore', { expiresIn: '30m' });
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