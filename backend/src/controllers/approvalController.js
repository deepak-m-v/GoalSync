const approvalService = require('../services/approvalService');
const asyncHandler = require('../utils/asyncHandler');

const listPending = asyncHandler(async (req, res) => {
  const data = await approvalService.listPendingForManager(req.user.id);
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await approvalService.getApprovalWithGoals(parseInt(req.params.id, 10), req.user.id);
  res.json({ success: true, data });
});

const review = asyncHandler(async (req, res) => {
  const result = await approvalService.reviewApproval(
    parseInt(req.params.id, 10),
    req.user.id,
    req.body,
    req
  );
  res.json({ success: true, data: result });
});

const inlineEditGoal = asyncHandler(async (req, res) => {
  const goal = await approvalService.updateGoalInline(parseInt(req.params.goalId, 10), req.user.id, req.body, req);
  res.json({ success: true, data: goal });
});

module.exports = { listPending, getById, review, inlineEditGoal };
