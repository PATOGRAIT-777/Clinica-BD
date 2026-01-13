const express = require('express');
const router = express.Router();
const mxDivisionsController = require('../controllers/mxDivisionsController');

router.get('/states', mxDivisionsController.getStates);
router.get('/municipalities/:estado', mxDivisionsController.getMunicipalitiesByState);
router.get('/colonias/:estado/:municipio', mxDivisionsController.getColoniasByMunicipalityAndState);
router.get('/cp/:cp', mxDivisionsController.getDivisionByCP);

module.exports = router;