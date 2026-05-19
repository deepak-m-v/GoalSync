const { Router } = require('express');
const authController = require('../controllers/authController');
const microsoftAuthController = require('../controllers/microsoftAuthController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginRules, refreshRules, firebaseLoginRules } = require('../validators');

const router = Router();

router.get('/microsoft/config', microsoftAuthController.getConfig);
router.get('/microsoft/login', microsoftAuthController.login);
router.get('/microsoft/callback', microsoftAuthController.callback);

router.get('/status', authController.authStatus);
router.post('/login', loginRules, validate, authController.login);
router.post('/firebase', firebaseLoginRules, validate, authController.firebaseLogin);
router.post('/refresh', refreshRules, validate, authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.me);

module.exports = router;
