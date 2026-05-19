const prisma = require('../lib/prisma');
const { calculateProgressScore } = require('../utils/progressScore');
const { logAudit } = require('./auditService');
const AppError = require('../utils/AppError');

async function listByUser(userId, { cycleId, quarter } = {}) {
  return prisma.checkIn.findMany({
    where: {
      goal: { userId, ...(cycleId && { cycleId }) },
      ...(quarter && { quarter }),
    },
    include: { goal: { select: { id: true, title: true, uomType: true, target: true } } },
    orderBy: [{ goalId: 'asc' }, { quarter: 'asc' }],
  });
}

async function upsertCheckIn(goalId, userId, data, req) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });
  if (!goal) throw new AppError('Goal not found', 404);
  if (!['approved', 'locked'].includes(goal.status)) {
    throw new AppError('Check-ins allowed only on approved goals', 400);
  }

  const existing = await prisma.checkIn.findUnique({
    where: { goalId_quarter: { goalId, quarter: data.quarter } },
  });

  const progressScore = calculateProgressScore(
    goal.uomType,
    goal.target,
    data.actualValue,
    data.completionDate,
    goal.timeline
  );

  const checkIn = await prisma.checkIn.upsert({
    where: { goalId_quarter: { goalId, quarter: data.quarter } },
    create: {
      goalId,
      quarter: data.quarter,
      plannedValue: data.plannedValue,
      actualValue: data.actualValue,
      progressStatus: data.progressStatus || 'not_started',
      completionDate: data.completionDate ? new Date(data.completionDate) : null,
      progressScore,
      employeeNotes: data.employeeNotes,
      updatedById: userId,
    },
    update: {
      plannedValue: data.plannedValue,
      actualValue: data.actualValue,
      progressStatus: data.progressStatus,
      completionDate: data.completionDate ? new Date(data.completionDate) : null,
      progressScore,
      employeeNotes: data.employeeNotes,
      updatedById: userId,
    },
  });

  if (existing && data.actualValue !== undefined && Number(existing.actualValue) !== Number(data.actualValue)) {
    await prisma.achievementLog.create({
      data: {
        goalId,
        checkInId: checkIn.id,
        previousValue: existing.actualValue,
        newValue: data.actualValue,
        changedById: userId,
      },
    });
  }

  await logAudit({ userId, entityType: 'check_in', entityId: checkIn.id, action: 'check_in', newValues: checkIn, req });
  return checkIn;
}

async function addManagerComment(checkInId, managerId, comments, req) {
  const checkIn = await prisma.checkIn.findUnique({
    where: { id: checkInId },
    include: { goal: { include: { user: true } } },
  });
  if (!checkIn || checkIn.goal.user.managerId !== managerId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.checkIn.update({
    where: { id: checkInId },
    data: { managerComments: comments, updatedById: managerId },
  });
  await logAudit({ userId: managerId, entityType: 'check_in', entityId: checkInId, action: 'update', newValues: { managerComments: comments }, req });
  return updated;
}

module.exports = { listByUser, upsertCheckIn, addManagerComment };
