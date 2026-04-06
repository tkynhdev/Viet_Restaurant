const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const upload = require('../utils/upload'); // Middleware upload ảnh
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware'); // Middleware bảo vệ

// Ai cũng xem được menu
router.get('/', menuController.getAllMenus);

// Chỉ Admin mới được Thêm (có upload ảnh)
router.post('/', verifyAdmin, upload.single('image'), menuController.createMenu);

// Chỉ Admin mới được Sửa (có upload ảnh)
router.put('/:id', verifyAdmin, upload.single('image'), menuController.updateMenu);

// Chỉ Admin mới được Xóa
router.delete('/:id', verifyAdmin, menuController.deleteMenu);

module.exports = router;