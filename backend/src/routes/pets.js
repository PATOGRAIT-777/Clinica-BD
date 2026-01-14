const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const catalogController = require('../controllers/catalogController');
const upload = require('../middleware/upload');

// Catálogos
router.get('/catalogs', catalogController.getAll);
router.get('/catalogs/razas/:especie_id', catalogController.getRazas);

// Registro de Mascota (Soporta subida de 2 archivos)
router.post('/register', upload.fields([
  { name: 'fotoFile', maxCount: 1 },
  { name: 'vacunasFile', maxCount: 1 },
  { name: 'foto_mascota', maxCount: 1 }
]), petController.registerPet); 

module.exports = router;