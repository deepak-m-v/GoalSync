const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/', userController.listUsers);

module.exports = router;
