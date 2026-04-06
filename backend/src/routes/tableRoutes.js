const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', tableController.getTables); // Ai cũng xem được để chọn bàn
router.post('/', verifyAdmin, tableController.createTable);
router.put('/:id', verifyAdmin, tableController.updateTableStatus);
router.delete('/:id', verifyAdmin, tableController.deleteTable);

module.exports = router;