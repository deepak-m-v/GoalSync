const { Router } = require('express');
const checkInController = require('../controllers/checkInController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkInRules } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', checkInController.list);
router.put('/goals/:goalId', checkInRules, validate, checkInController.upsert);
router.post('/:id/manager-comment', authorize('manager', 'admin'), checkInController.managerComment);

module.exports = router;
