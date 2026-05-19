const { Router } = require('express');
const authRoutes = require('./auth.routes');
const goalRoutes = require('./goal.routes');
const approvalRoutes = require('./approval.routes');
const sharedGoalRoutes = require('./sharedGoal.routes');
const checkInRoutes = require('./checkIn.routes');
const analyticsRoutes = require('./analytics.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const escalationRoutes = require('./escalation.routes');
const auditRoutes = require('./audit.routes');
const teamRoutes = require('./team.routes');
const userRoutes = require('./user.routes');
const teamsRoutes = require('./teams.routes');
const legacyRoutes = require('./legacy.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GoalSync API v2',
    timestamp: new Date().toISOString(),
    docs: '/api/docs',
  });
});

router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'See API.md in backend folder for full documentation',
    modules: [
      'auth', 'goals', 'approvals', 'shared-goals', 'check-ins',
      'analytics', 'reports', 'notifications', 'escalations', 'audit-logs',
    ],
  });
});

router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/approvals', approvalRoutes);
router.use('/shared-goals', sharedGoalRoutes);
router.use('/check-ins', checkInRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/escalations', escalationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/team', teamRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamsRoutes);

// v1 compatibility (no prefix duplication — mounted at /api root)
router.use('/', legacyRoutes);

module.exports = router;
