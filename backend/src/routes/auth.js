const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Configuración de almacenamiento Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Definir la ruta: sube 2 niveles desde 'routes' para llegar a la raíz
        const uploadPath = path.join(__dirname, '..', '..', 'uploads');
        console.log('Multer upload path:', uploadPath); // Debug log
        
        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(uploadPath)) {
            console.log('Creating upload directory:', uploadPath); // Debug log
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único: campo-fecha.extensión
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. Rutas
// 'upload.fields' procesa los archivos antes de llegar al controlador
router.post('/register', upload.fields([
    { name: 'proof_address', maxCount: 1 }, // Comprobante de domicilio
    { name: 'proof_id', maxCount: 1 }       // Identificación oficial
]), authController.register);

router.post('/login', authController.login);

module.exports = router;