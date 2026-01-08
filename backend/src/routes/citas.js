const express = require('express');
const router = express.Router();
const {
    createCita,
    getCitas,
    updateCitaEstado,
    deleteCita,
} = require('../controllers/citaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de citas requieren que el usuario esté autenticado.
router.use(protect);

router.route('/')
    .post(authorize('cliente', 'recepcionista', 'admin'), createCita)
    .get(getCitas); // La lógica de quién ve qué está dentro del controlador

router.route('/:id/estado')
    .put(updateCitaEstado); // La lógica de quién actualiza qué está dentro del controlador

router.route('/:id')
    .delete(authorize('recepcionista', 'admin'), deleteCita);

module.exports = router;
