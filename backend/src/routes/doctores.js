const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.post('/', protect, authorize('admin', 'recepcionista'), doctorController.createDoctor);
router.put('/:id', protect, authorize('admin', 'recepcionista'), doctorController.updateDoctor);
router.delete('/:id', protect, authorize('admin'), doctorController.deleteDoctor);

module.exports = router;
