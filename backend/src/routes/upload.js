const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Ruta para subir un solo archivo
router.post('/single', uploadController.multerUpload.single('file'), uploadController.uploadFile);

module.exports = router;
