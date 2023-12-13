const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkRole } = require('../middlewares/auth');
// GET /category
router.get('/', orderController.index);

router.post('/', orderController.store);

router.get('/:id', orderController.detail);

router.get('/pdf/:id', orderController.pdf);

router.get('/customer-orders/:username', orderController.customerOrders);

router.get('/seller-orders/:username', checkRole(['admin']), orderController.sellerOrders);

router.get('/api/customer-orders/:username', orderController.apiCustomerOrders);

router.get('/api/seller-orders/:username', checkRole(['admin']), orderController.apiSellerOrders);

router.get('/api/orders-by-time-range', orderController.getOrdersByTimeRange);

router.get('/api/revenue', orderController.getRevenue);

module.exports = router;


