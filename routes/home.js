const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');

router.get('/', homeController.index);

router.get('*', (req, res) => {
    // 404 Not Found
    res.render('partials/empty', { title: 'Không tìm thấy' });
});

module.exports = router;
