const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { optionalVerifyToken, verifyToken, verifyStaff } = require('../middleware/authMiddleware');

router.post('/', optionalVerifyToken, orderController.createOrder);
router.get('/mine', verifyToken, orderController.getMyOrders);
router.get('/', verifyStaff, orderController.getAllOrders); // <-- Dòng gây lỗi nếu thiếu getAllOrders
router.put('/:id', verifyStaff, orderController.updateOrderStatus);
router.put('/:id/assign-table', verifyStaff, orderController.assignTableToOrder);

module.exports = router;