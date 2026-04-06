const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const forecastController = require('../controllers/forecastController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Các API này chỉ Admin mới được truy cập
router.get('/revenue', verifyAdmin, reportController.getRevenueReport);
router.get('/top-dishes', verifyAdmin, reportController.getTopSellingDishes);
router.get('/forecast', verifyAdmin, forecastController.getForecast);

module.exports = router;