const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alumnosController');

// GET  /api/alumnos           → listar todos
// GET  /api/alumnos/:id       → obtener uno
// POST /api/alumnos           → crear
// PUT  /api/alumnos/:id       → actualizar
// DELETE /api/alumnos/:id     → eliminar

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.post('/',    ctrl.create);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
