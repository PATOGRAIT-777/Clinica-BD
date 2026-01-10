const express = require('express');
const router = express.Router();
const mxDivisionController = require('../controllers/mxDivisionController');

router.get('/', mxDivisionController.getMxDivisions);

module.exports = router;
