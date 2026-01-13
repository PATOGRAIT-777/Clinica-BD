const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// Ruta: /api/citas/ocupadas (Verificar disponibilidad)
router.get('/ocupadas', citasController.getOcupadas);

// Ruta: /api/citas/proximas (Ver citas en el dashboard)
// NOTA: Asegúrate de haber agregado la función getProximas en tu controlador si quieres usar esto
// router.get('/proximas', citasController.getProximas); 

// Ruta: /api/citas (Crear nueva cita)
router.post('/', citasController.crearCita);

module.exports = router;