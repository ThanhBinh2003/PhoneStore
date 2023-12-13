// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST đăng ký
router.post('/register', authController.postRegister);

// GET trang đăng nhập
router.get('/login', authController.getLogin);

// Đăng nhập người dùng
router.post('/login', authController.postLogin);

// Đăng xuất người dùng
router.get('/logout', authController.logout);

// Verify email
router.get('/verify/:token', authController.verifyEmail);

// Change password
router.get('/changepassword', authController.getChangePassword);
router.post('/changepassword', authController.postChangePassword);

module.exports = router;
