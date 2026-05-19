const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);
router.get('/email-queue', authorize('admin'), notificationController.emailQueue);
router.post('/email-queue/process', authorize('admin'), notificationController.processEmails);

module.exports = router;
