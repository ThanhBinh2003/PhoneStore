const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { checkRole } = require('../middlewares/auth');
router.get('/', accountController.index);

router.get('/dashboard', checkRole(['admin', 'staff']), accountController.dashboard);

router.get('/user', checkRole(['admin']), accountController.user);

router.get('/customer', checkRole(['admin', 'staff']), accountController.customer);

router.get('/category', checkRole(['admin']), accountController.category);

router.get('/product', checkRole(['admin', 'staff']), accountController.product);

router.get('/order', checkRole(['admin', 'staff']), accountController.order);

module.exports = router;