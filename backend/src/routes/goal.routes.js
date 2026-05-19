const { Router } = require('express');
const goalController = require('../controllers/goalController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { goalCreateRules, goalUpdateRules } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/cycle/active', goalController.activeCycle);
router.get('/', goalController.list);
router.post('/', goalCreateRules, validate, goalController.create);
router.put('/:id', goalUpdateRules, validate, goalController.update);
router.delete('/:id', goalController.remove);
router.post('/submit', goalController.submit);
router.post('/:id/unlock', authorize('admin'), goalController.unlock);

module.exports = router;
