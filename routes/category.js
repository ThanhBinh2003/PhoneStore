const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { checkRole } = require('../middlewares/auth');
// GET /category
router.get('/', categoryController.index);

router.post('/', checkRole(['admin']), categoryController.store);

router.put('/:id', checkRole(['admin']), categoryController.update);

router.delete('/:id', checkRole(['admin']), categoryController.delete);

module.exports = router;


