const sharedGoalService = require('../services/sharedGoalService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const cycleId = req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined;
  const data = await sharedGoalService.listSharedGoals(cycleId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await sharedGoalService.createSharedGoal(req.user.id, req.body, req);
  res.status(201).json({ success: true, data });
});

const assign = asyncHandler(async (req, res) => {
  const data = await sharedGoalService.assignToUsers(
    parseInt(req.params.id, 10),
    req.user.id,
    req.body.assignments,
    req
  );
  res.json({ success: true, data });
});

const updateWeightage = asyncHandler(async (req, res) => {
  const data = await sharedGoalService.updateAssignmentWeightage(
    parseInt(req.params.assignmentId, 10),
    req.user.id,
    req.body.weightage,
    req
  );
  res.json({ success: true, data });
});

module.exports = { list, create, assign, updateWeightage };
