const goalService = require('../services/goalService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : req.user.id;
  const cycleId = req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined;

  if (userId !== req.user.id && !['manager', 'admin'].includes(req.user.role)) {
    throw new AppError('Forbidden', 403);
  }

  const goals = await goalService.listGoals(userId, cycleId);
  res.json({ success: true, data: goals });
});

const activeCycle = asyncHandler(async (req, res) => {
  const cycle = await goalService.getActiveCycle();
  res.json({ success: true, data: cycle });
});

const create = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.user.id, req.body, req);
  res.status(201).json({ success: true, data: goal });
});

const update = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal(parseInt(req.params.id, 10), req.user.id, req.body, req);
  res.json({ success: true, data: goal });
});

const remove = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(parseInt(req.params.id, 10), req.user.id, req);
  res.json({ success: true, message: 'Goal deleted' });
});

const submit = asyncHandler(async (req, res) => {
  const cycle = await goalService.getActiveCycle();
  const cycleId = req.body.cycleId || cycle?.id;
  if (!cycleId) throw new AppError('No active performance cycle', 400);
  const result = await goalService.submitGoalSheet(req.user.id, cycleId, req);
  res.json({ success: true, data: result });
});

const unlock = asyncHandler(async (req, res) => {
  const goal = await goalService.unlockGoal(parseInt(req.params.id, 10), req.user.id, req);
  res.json({ success: true, data: goal });
});

module.exports = { list, activeCycle, create, update, remove, submit, unlock };
