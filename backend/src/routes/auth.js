const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads')); // Files will be saved in backend/uploads
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each upload
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

router.post('/register', upload.fields([
    { name: 'proof_address', maxCount: 1 },
    { name: 'proof_id', maxCount: 1 }
]), authController.register);
router.post('/login', authController.login);

module.exports = router;
