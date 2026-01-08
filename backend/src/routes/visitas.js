const express = require('express');
const router = express.Router();
const {
    createVisita,
    getVisitaById,
} = require('../controllers/visitaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas de visitas requieren autenticación
router.use(protect);

router.route('/')
    .post(authorize('medico', 'admin'), createVisita);

router.route('/:id')
    .get(getVisitaById); // La autorización está dentro del controlador

module.exports = router;