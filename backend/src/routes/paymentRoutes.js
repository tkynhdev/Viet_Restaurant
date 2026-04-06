const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Tạo link thanh toán
router.post('/create_payment_url', paymentController.createPaymentUrl);

// Kiểm tra kết quả
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;