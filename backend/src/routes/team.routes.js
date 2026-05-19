const { Router } = require('express');
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('manager', 'admin'));
router.get('/', teamController.getTeam);

module.exports = router;
