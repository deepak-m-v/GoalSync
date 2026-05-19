const auditLogService = require('../services/auditLogService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await auditLogService.listAuditLogs({
    entityType: req.query.entityType,
    entityId: req.query.entityId ? parseInt(req.query.entityId, 10) : undefined,
    userId: req.query.userId ? parseInt(req.query.userId, 10) : undefined,
    limit: parseInt(req.query.limit, 10) || 100,
    offset: parseInt(req.query.offset, 10) || 0,
  });
  res.json({ success: true, data });
});

module.exports = { list };
