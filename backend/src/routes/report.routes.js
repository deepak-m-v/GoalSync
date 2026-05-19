const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('manager', 'admin'));

router.get('/planned-vs-actual', reportController.plannedVsActual);
router.get('/employee-completion', reportController.employeeCompletion);
router.get('/quarterly-summary', reportController.quarterlySummary);

module.exports = router;
