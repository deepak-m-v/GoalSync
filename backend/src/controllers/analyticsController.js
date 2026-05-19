const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');

const dashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardStats({
    cycleId: req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId, 10) : undefined,
  });
  res.json({ success: true, data });
});

const overview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview({
    cycleId: req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined,
    departmentId: req.query.departmentId ? parseInt(req.query.departmentId, 10) : undefined,
    demo: req.query.demo,
  });
  res.json({ success: true, data });
});

const qoq = asyncHandler(async (req, res) => {
  const data = await analyticsService.getQoQTrends(
    req.query.cycleId ? parseInt(req.query.cycleId, 10) : undefined
  );
  res.json({ success: true, data });
});

const managers = asyncHandler(async (req, res) => {
  const data = await analyticsService.getManagerEffectiveness();
  res.json({ success: true, data });
});

module.exports = { dashboard, overview, qoq, managers };
