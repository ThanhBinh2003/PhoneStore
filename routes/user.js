const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.index);

router.post('/addstaff', userController.postAddStaff);

router.post('/resendverifyemail', userController.resendVerifyEmail);

router.patch('/changeAvatar', userController.changeAvatar);

module.exports = router;