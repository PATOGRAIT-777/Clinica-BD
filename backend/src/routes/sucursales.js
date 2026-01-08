const express = require('express');
const router = express.Router();
const {
    getSucursales,
    getSucursalById,
    createSucursal,
    updateSucursal,
    deleteSucursal,
} = require('../controllers/sucursalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSucursales);
router.get('/:id', getSucursalById);

// Admin routes
router.post('/', protect, authorize('admin'), createSucursal);
router.put('/:id', protect, authorize('admin'), updateSucursal);
router.delete('/:id', protect, authorize('admin'), deleteSucursal);

module.exports = router;
