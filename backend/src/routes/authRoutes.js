const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/google', authController.loginGoogle);

// Các route cần đăng nhập
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/me', verifyToken, authController.getMe);

// Route tạo nhân viên (Chỉ Admin)
router.post('/create-staff', verifyAdmin, authController.createStaff);

// --- [ROUTE MỚI] ĐĂNG KÝ KHUÔN MẶT ---
router.post('/register-face', verifyToken, authController.registerFace);

module.exports = router;