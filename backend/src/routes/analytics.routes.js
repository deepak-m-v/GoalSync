const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('manager', 'admin'));

router.get('/dashboard', analyticsController.dashboard);
router.get('/overview', authorize('admin'), analyticsController.overview);
router.get('/qoq', analyticsController.qoq);
router.get('/managers', authorize('admin'), analyticsController.managers);

module.exports = router;
