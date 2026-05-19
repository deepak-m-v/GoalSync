const checkInService = require('../services/checkInService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : req.user.id;
  const data = await checkInService.listByUser(userId, {
    cycleId: req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined,
    quarter: req.query.quarter,
  });
  res.json({ success: true, data });
});

const upsert = asyncHandler(async (req, res) => {
  const data = await checkInService.upsertCheckIn(
    parseInt(req.params.goalId, 10),
    req.user.id,
    req.body,
    req
  );
  res.json({ success: true, data });
});

const managerComment = asyncHandler(async (req, res) => {
  const data = await checkInService.addManagerComment(
    parseInt(req.params.id, 10),
    req.user.id,
    req.body.comments,
    req
  );
  res.json({ success: true, data });
});

module.exports = { list, upsert, managerComment };
