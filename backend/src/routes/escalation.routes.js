const { Router } = require('express');
const escalationController = require('../controllers/escalationController');
const { authenticate, authorize } = require('../middleware/auth');
const cronAuth = require('../middleware/cronAuth');

const router = Router();

router.post('/engine/cron', cronAuth, escalationController.runEngine);
router.post('/engine/emails', cronAuth, escalationController.processEmails);

router.use(authenticate);

router.get('/rules', authorize('admin'), escalationController.rules);
router.patch('/rules/:id', authorize('admin'), escalationController.updateRule);
router.get('/logs', authorize('admin'), escalationController.logs);
router.get('/', authorize('manager', 'admin'), escalationController.list);
router.get('/:id', authorize('manager', 'admin'), escalationController.getById);
router.post('/:id/resolve', authorize('admin'), escalationController.resolve);
router.post('/engine/run', authorize('admin'), escalationController.runEngine);
router.post('/engine/emails/run', authorize('admin'), escalationController.processEmails);

module.exports = router;
