const uploadController = require('../controllers/uploadController');

// Re-exportar la instancia de multer definida en uploadController
module.exports = uploadController.multerUpload;
