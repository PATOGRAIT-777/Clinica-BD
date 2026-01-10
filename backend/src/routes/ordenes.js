const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, ordenController.getOrders);
router.get('/:id', protect, ordenController.getOrderById);
router.post('/', protect, authorize('cliente'), ordenController.createOrder);
router.put('/:id', protect, authorize('admin', 'recepcionista'), ordenController.updateOrder);

module.exports = router;
