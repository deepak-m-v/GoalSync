const { Router } = require('express');
const teamsController = require('../controllers/teamsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/status', teamsController.status);
router.use(authenticate, authorize('admin'));
router.post('/test', teamsController.testCard);
router.post('/cards/approval-pending', teamsController.sendApprovalSample);

module.exports = router;
