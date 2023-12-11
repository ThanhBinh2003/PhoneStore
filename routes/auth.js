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

module.exports = router;
