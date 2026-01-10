const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', productoController.getProducts);
router.get('/:id', productoController.getProductById);
router.post('/', protect, authorize('admin', 'recepcionista'), productoController.createProduct);
router.put('/:id', protect, authorize('admin', 'recepcionista'), productoController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productoController.deleteProduct);

module.exports = router;
