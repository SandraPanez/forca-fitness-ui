const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/accesosController');

router.get('/',                   ctrl.getAll);
router.get('/alumno/:id_alumno',  ctrl.getByAlumno);
router.post('/registrar',         ctrl.registrar);

module.exports = router;
