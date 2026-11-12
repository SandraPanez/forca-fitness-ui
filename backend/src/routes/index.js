const express = require('express');

const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

router.use('/auth', require('./auth'));

router.use(requireAuth);
router.use('/alumnos', require('./alumnos'));
router.use('/disciplinas', require('./disciplinas'));
router.use('/matriculas', require('./matriculas'));
router.use('/pagos', require('./pagos'));
router.use('/accesos', require('./accesos'));

module.exports = router;
