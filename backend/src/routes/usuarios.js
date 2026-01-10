const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'recepcionista', 'medico'), usuarioController.getUsers);
router.get('/:id', protect, authorize('admin', 'recepcionista', 'medico'), usuarioController.getUserById);
router.put('/:id', protect, authorize('admin', 'recepcionista', 'medico'), usuarioController.updateUser);
router.delete('/:id', protect, authorize('admin'), usuarioController.deleteUser);

module.exports = router;
