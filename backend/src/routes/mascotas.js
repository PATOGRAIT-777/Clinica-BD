const express = require('express');
const router = express.Router();
const {
    createMascota,
    getMascotas,
    getMascotaById,
    updateMascota,
    deleteMascota,
} = require('../controllers/mascotaController');
const { getVisitasForMascota } = require('../controllers/visitaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de mascotas requieren que el usuario esté autenticado.
router.use(protect);

router.route('/')
    .post(authorize('cliente', 'recepcionista', 'admin'), createMascota)
    .get(getMascotas);

router.route('/:id')
    .get(getMascotaById)
    .put(authorize('cliente', 'recepcionista', 'admin'), updateMascota)
    .delete(authorize('recepcionista', 'admin'), deleteMascota);

// Nested route for visitas
router.route('/:mascotaId/visitas').get(getVisitasForMascota);

module.exports = router;