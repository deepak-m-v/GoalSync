const prisma = require('../lib/prisma');

async function logAudit({ userId, entityType, entityId, action, oldValues, newValues, metadata, req }) {
  return prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      entityType,
      entityId: entityId ?? null,
      action,
      oldValues: oldValues ?? undefined,
      newValues: newValues ?? undefined,
      metadata: metadata ?? undefined,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
    },
  });
}

module.exports = { logAudit };
