const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET /category
router.get('/', orderController.index);

router.post('/', orderController.store);

router.get('/:id', orderController.detail);

router.get('/pdf/:id', orderController.pdf);

router.get('/customer-orders/:username', orderController.customerOrders);

router.get('/seller-orders/:username', orderController.sellerOrders);

router.get('/api/customer-orders/:username', orderController.apiCustomerOrders);

router.get('/api/seller-orders/:username', orderController.apiSellerOrders);

module.exports = router;


