const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagosController');

router.get('/',                    ctrl.getAll);
router.get('/pendientes',          ctrl.getPendientes);
router.get('/:id',                 ctrl.getOne);
router.get('/alumno/:id_alumno',   ctrl.getByAlumno);
router.post('/',                   ctrl.create);
router.put('/:id/confirmar',       ctrl.confirmar);
router.put('/:id/rechazar',        ctrl.rechazar);

module.exports = router;
