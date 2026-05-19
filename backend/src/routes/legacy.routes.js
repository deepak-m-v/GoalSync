/**
 * Backward-compatible routes for existing frontend (v1 paths).
 */
const { Router } = require('express');
const approvalController = require('../controllers/approvalController');
const teamController = require('../controllers/teamController');
const analyticsController = require('../controllers/analyticsController');
const auditController = require('../controllers/auditController');
const escalationController = require('../controllers/escalationController');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { approvalReviewRules } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/manager/team', authorize('manager', 'admin'), teamController.getTeam);
router.get('/manager/approvals', authorize('manager', 'admin'), approvalController.listPending);
router.post('/manager/approvals/:id/review', authorize('manager', 'admin'), approvalReviewRules, validate, approvalController.review);

router.get('/admin/users', authorize('admin'), userController.listUsers);
router.get('/admin/analytics', authorize('admin'), analyticsController.dashboard);
router.get('/admin/analytics/overview', authorize('admin'), analyticsController.overview);
router.get('/admin/audit-logs', authorize('admin'), auditController.list);
router.get('/admin/escalations', authorize('admin'), escalationController.list);

module.exports = router;
