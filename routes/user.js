const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkRole } = require('../middlewares/auth');
router.get('/', checkRole(['admin', 'staff']), userController.index);

router.post('/addstaff', checkRole(['admin']), userController.postAddStaff);

router.post('/banned', checkRole(['admin']), userController.banned);

router.post('/resendverifyemail', checkRole(['admin']), userController.resendVerifyEmail);

router.patch('/changeAvatar', userController.changeAvatar);

router.get('/checkCustomer/:phone', userController.checkCustomer);

router.post('/createCustomer', userController.createCustomer);

module.exports = router;