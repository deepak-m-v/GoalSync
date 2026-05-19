const escalationService = require('../services/escalationService');
const { processEmailQueue } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const data = await escalationService.listEscalations({
    status: req.query.status,
    type: req.query.type,
    level: req.query.level,
    assignedTo: req.query.mine === 'true' ? req.user.id : undefined,
  });
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await escalationService.getEscalationById(parseInt(req.params.id, 10));
  if (!data) throw new AppError('Escalation not found', 404);
  res.json({ success: true, data });
});

const logs = asyncHandler(async (req, res) => {
  const data = await escalationService.listEscalationLogs({
    escalationId: req.query.escalationId ? parseInt(req.query.escalationId, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 100,
  });
  res.json({ success: true, data });
});

const rules = asyncHandler(async (req, res) => {
  const data = await escalationService.listRules();
  res.json({ success: true, data });
});

const updateRule = asyncHandler(async (req, res) => {
  const data = await escalationService.updateRule(parseInt(req.params.id, 10), req.body);
  res.json({ success: true, data });
});

const resolve = asyncHandler(async (req, res) => {
  const data = await escalationService.resolveEscalation(parseInt(req.params.id, 10), req.user.id, req);
  res.json({ success: true, data });
});

const runEngine = asyncHandler(async (req, res) => {
  const result = await escalationService.runEscalationEngine();
  res.json({ success: true, data: result });
});

const processEmails = asyncHandler(async (req, res) => {
  const data = await processEmailQueue();
  res.json({ success: true, data });
});

module.exports = { list, getById, logs, rules, updateRule, resolve, runEngine, processEmails };
