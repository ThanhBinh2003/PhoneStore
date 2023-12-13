const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /category
router.get('/', categoryController.index);

router.post('/', categoryController.store);

router.put('/:id', categoryController.update);

router.delete('/:id', categoryController.delete);

module.exports = router;


