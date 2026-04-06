const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// --- CHỈ DÙNG ĐÚNG 1 DÒNG IMPORT NÀY THÔI ---
const { verifyToken, verifyAdmin, optionalVerifyToken } = require('../middleware/authMiddleware');

// 1. Khách đặt bàn (Dùng optionalVerifyToken để nhận diện người dùng nếu có)
router.post('/', optionalVerifyToken, reservationController.createReservation);

// 2. Khách xem lịch sử của chính mình (Bắt buộc phải có Token)
router.get('/mine', verifyToken, reservationController.getMyReservations);

// 3. Admin xem danh sách (Chỉ Admin)
router.get('/', verifyAdmin, reservationController.getAllReservations);

// 4. Admin cập nhật trạng thái (Chỉ Admin)
router.put('/:id', verifyAdmin, reservationController.updateStatus);

module.exports = router;