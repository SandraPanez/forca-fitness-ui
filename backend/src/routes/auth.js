const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

router.post('/login',  ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.post('/logout', requireAuth, ctrl.logout);

module.exports = router;
