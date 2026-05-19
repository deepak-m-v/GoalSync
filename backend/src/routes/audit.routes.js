const { Router } = require('express');
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', auditController.list);

module.exports = router;
