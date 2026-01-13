const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload'); // If you have a specific upload middleware

// Ruta para el registro de usuarios (con manejo de archivos)
router.post('/register', upload.fields([
    { name: 'proof_address', maxCount: 1 },
    { name: 'proof_id', maxCount: 1 }
]), authController.register);

// Ruta para el inicio de sesión
router.post('/login', authController.login);

module.exports = router;