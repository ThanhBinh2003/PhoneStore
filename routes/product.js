const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /product/index
router.get('/', productController.index);

module.exports = router;