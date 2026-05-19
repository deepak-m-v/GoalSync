const { Router } = require('express');
const sharedGoalController = require('../controllers/sharedGoalController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sharedGoalRules, assignSharedRules } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', sharedGoalController.list);
router.post('/', authorize('manager', 'admin'), sharedGoalRules, validate, sharedGoalController.create);
router.post('/:id/assign', authorize('manager', 'admin'), assignSharedRules, validate, sharedGoalController.assign);
router.patch('/assignments/:assignmentId/weightage', sharedGoalController.updateWeightage);

module.exports = router;
