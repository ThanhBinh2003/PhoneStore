const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { checkRole } = require('../middlewares/auth');
router.get('/', productController.index);

router.post('/', checkRole(['admin']), productController.store);

router.put('/:id', checkRole(['admin']), productController.update);

router.delete('/:id', checkRole(['admin']), productController.delete);

module.exports = router;