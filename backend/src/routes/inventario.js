const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'recepcionista'), inventarioController.getProducts);
router.post('/', protect, authorize('admin', 'recepcionista'), inventarioController.addInventory);

module.exports = router;
