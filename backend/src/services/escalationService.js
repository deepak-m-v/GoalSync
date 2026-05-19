const prisma = require('../lib/prisma');
const { logAudit } = require('./auditService');
const { runEscalationEngine, ensureDefaultRules } = require('../escalation/engine');

function mapEscalation(e) {
  return {
    ...e,
    first_name: e.user?.firstName,
    last_name: e.user?.lastName,
    employee_email: e.user?.email,
    escalated_to_name: e.escalatedTo
      ? `${e.escalatedTo.firstName} ${e.escalatedTo.lastName}`
      : null,
  };
}

async function listEscalations({ status, assignedTo, type, level } = {}) {
  const rows = await prisma.escalation.findMany({
    where: {
      ...(status && { status }),
      ...(type && { type }),
      ...(level && { level }),
      ...(assignedTo && {
        OR: [{ escalatedToId: assignedTo }, { assignedHrId: assignedTo }],
      }),
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      escalatedTo: { select: { firstName: true, lastName: true, email: true } },
      assignedHr: { select: { firstName: true, lastName: true } },
      rule: { select: { code: true, name: true } },
      cycle: { select: { name: true, year: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapEscalation);
}

async function getEscalationById(id) {
  const row = await prisma.escalation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      escalatedTo: { select: { firstName: true, lastName: true, email: true } },
      rule: true,
      cycle: true,
      logs: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  return row ? mapEscalation(row) : null;
}

async function listEscalationLogs({ escalationId, limit = 100 } = {}) {
  return prisma.escalationLog.findMany({
    where: escalationId ? { escalationId } : undefined,
    include: {
      escalation: {
        select: {
          id: true,
          type: true,
          level: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      rule: { select: { code: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function listRules() {
  await ensureDefaultRules();
  return prisma.escalationRule.findMany({ orderBy: { id: 'asc' } });
}

async function updateRule(id, { isEnabled, config, name, description }) {
  return prisma.escalationRule.update({
    where: { id },
    data: {
      ...(isEnabled !== undefined && { isEnabled }),
      ...(config !== undefined && { config }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });
}

async function resolveEscalation(id, resolverId, req) {
  const escalation = await prisma.escalation.update({
    where: { id },
    data: { status: 'resolved', resolvedById: resolverId, resolvedAt: new Date() },
  });
  await prisma.escalationLog.create({
    data: {
      escalationId: id,
      action: 'resolved',
      message: 'Escalation resolved by admin',
      metadata: { resolverId },
    },
  });
  await logAudit({
    userId: resolverId,
    entityType: 'escalation',
    entityId: id,
    action: 'update',
    newValues: { status: 'resolved' },
    req,
  });
  return escalation;
}

module.exports = {
  listEscalations,
  getEscalationById,
  listEscalationLogs,
  listRules,
  updateRule,
  resolveEscalation,
  runEscalationEngine,
};
