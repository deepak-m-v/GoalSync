const { Router } = require('express');
const approvalController = require('../controllers/approvalController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { approvalReviewRules } = require('../validators');

const router = Router();

router.use(authenticate, authorize('manager', 'admin'));

router.get('/', approvalController.listPending);
router.get('/:id', approvalController.getById);
router.post('/:id/review', approvalReviewRules, validate, approvalController.review);
router.patch('/goals/:goalId', approvalController.inlineEditGoal);

module.exports = router;
