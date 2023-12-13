const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.index);

router.get('/dashboard', accountController.dashboard);

router.get('/user', accountController.user);

router.get('/category', accountController.category);

router.get('/product', accountController.product);

router.get('/order', accountController.order);

module.exports = router;