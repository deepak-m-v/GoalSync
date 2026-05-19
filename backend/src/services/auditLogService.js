const prisma = require('../lib/prisma');

async function listAuditLogs({ entityType, entityId, userId, limit = 100, offset = 0 }) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(userId && { userId }),
    },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

module.exports = { listAuditLogs };
