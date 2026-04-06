const express = require('express');
const router = express.Router();
const timekeepingController = require('../controllers/timekeepingController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, timekeepingController.checkIn);
router.get('/', verifyAdmin, timekeepingController.getAllTimelogs);

module.exports = router;