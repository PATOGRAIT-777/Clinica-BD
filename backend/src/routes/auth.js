const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Registro
router.post('/register', upload.fields([
    { name: 'proof_address', maxCount: 1 },
    { name: 'proof_id', maxCount: 1 }
]), authController.register);

// Login
router.post('/login', authController.login);


// --- RUTAS NUEVAS (Estas faltaban y causaban el error 404 en perfil) ---
router.get('/profile', authController.getProfile);
router.put('/update-user', authController.updateUser);
router.post('/change-password', authController.changePassword);
router.get('/my-pets', authController.getUserPets);

module.exports = router;