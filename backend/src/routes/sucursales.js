const express = require('express');
const router = express.Router();
const sucursalesController = require('../controllers/sucursalesController');

// DEBUG: Mensaje al iniciar para confirmar que este archivo se leyó
console.log('🔹 Router de Sucursales listo.');

// RUTA IMPORTANTE: Fíjate que es solo '/'
// Esto se concatena con '/api/sucursales' del index.js
router.get('/', (req, res, next) => {
    console.log('⚡ Petición recibida en GET /api/sucursales');
    next(); // Pasa el control al controlador
}, sucursalesController.getSucursales);

router.get('/:sucursalId/medicos', sucursalesController.getMedicos);

module.exports = router;