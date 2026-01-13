const multer = require('multer');
const path = require('path');
const { query } = require('../config/database');

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // La carpeta 'uploads' está un nivel arriba de 'src'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo.' });
    }

    const { filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    // Guardar la información del archivo en la tabla 'archivos' de PostgreSQL
    const result = await query(
      'INSERT INTO archivos (url, nombre_archivo, mime, tamano) VALUES ($1, $2, $3, $4) RETURNING id'
      , [url, filename, mimetype, size]
    );

    const fileId = result.rows[0].id;

    res.status(200).json({ message: 'Archivo subido exitosamente', fileId: fileId, url: url });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error interno del servidor al subir archivo.' });
  }
};

exports.multerUpload = upload;
