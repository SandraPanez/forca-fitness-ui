const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matriculasController');

router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getOne);
router.get('/alumno/:id_alumno', ctrl.getByAlumno);
router.post('/',             ctrl.create);
router.put('/:id',           ctrl.update);
router.delete('/:id',        ctrl.remove);

module.exports = router;
