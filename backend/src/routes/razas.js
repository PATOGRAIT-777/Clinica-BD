const express = require('express');
const router = express.Router();
const { getRazas } = require('../controllers/razaController');

// Es público, no requiere autenticación
router.route('/').get(getRazas);

module.exports = router;
