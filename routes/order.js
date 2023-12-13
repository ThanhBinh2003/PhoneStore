const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET /category
router.get('/', orderController.index);

router.post('/', orderController.store);

router.get('/:id', orderController.detail);

router.get('/pdf/:id', orderController.pdf);

module.exports = router;


