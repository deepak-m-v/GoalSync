const teamsService = require('../services/teamsService');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

const status = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: config.teams.enabled,
      channels: Object.keys(config.teams.webhooks || {}),
    },
  });
});

const testCard = asyncHandler(async (req, res) => {
  const result = await teamsService.sendTestCard();
  res.json({ success: true, data: result });
});

const sendApprovalSample = asyncHandler(async (req, res) => {
  const result = await teamsService.notifyManagerApprovalPending({
    employeeName: req.body.employeeName || 'Sample Employee',
    employeeEmail: req.body.employeeEmail || 'employee@goalsync.com',
    goalCount: req.body.goalCount ?? 5,
    cycleName: req.body.cycleName || 'FY 2026',
    approvalId: req.body.approvalId ?? 1,
    submittedAt: new Date().toISOString(),
  });
  res.json({ success: true, data: result });
});

module.exports = { status, testCard, sendApprovalSample };
