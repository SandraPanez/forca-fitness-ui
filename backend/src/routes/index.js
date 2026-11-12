const express = require('express');

const router = express.Router();

router.use('/alumnos', require('./alumnos'));
router.use('/disciplinas', require('./disciplinas'));
router.use('/matriculas', require('./matriculas'));
router.use('/pagos', require('./pagos'));
router.use('/accesos', require('./accesos'));
router.use('/auth', require('./auth'));

module.exports = router;
