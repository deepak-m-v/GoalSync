const prisma = require('../lib/prisma');
const { validateGoalSheet } = require('../utils/goalValidation');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const { notifyManagerApprovalPending } = require('./teamsService');
const { paths } = require('../lib/deepLinks');
const AppError = require('../utils/AppError');

async function getActiveCycle() {
  return prisma.performanceCycle.findFirst({ where: { isActive: true } });
}

async function listGoals(userId, cycleId) {
  return prisma.goal.findMany({
    where: { userId, ...(cycleId && { cycleId }) },
    orderBy: { createdAt: 'asc' },
    include: { sharedGoal: { select: { id: true, title: true } } },
  });
}

async function createGoal(userId, data, req) {
  const goal = await prisma.goal.create({
    data: {
      userId,
      cycleId: data.cycleId,
      title: data.title,
      description: data.description,
      thrustArea: data.thrustArea,
      uomType: data.uomType,
      target: data.target,
      weightage: data.weightage,
      timeline: data.timeline ? new Date(data.timeline) : null,
      status: 'draft',
    },
  });
  await logAudit({ userId, entityType: 'goal', entityId: goal.id, action: 'create', newValues: goal, req });
  return goal;
}

async function updateGoal(goalId, userId, data, req) {
  const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!existing) throw new AppError('Goal not found', 404);
  if (existing.isLocked) throw new AppError('Goal is locked and cannot be edited', 403);
  if (existing.isShared && (data.title || data.target !== undefined)) {
    throw new AppError('Shared goal title and target are read-only', 403);
  }

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: data.title,
      description: data.description,
      thrustArea: data.thrustArea,
      uomType: data.uomType,
      target: data.target,
      weightage: data.weightage,
      timeline: data.timeline !== undefined ? (data.timeline ? new Date(data.timeline) : null) : undefined,
    },
  });
  await logAudit({ userId, entityType: 'goal', entityId: goal.id, action: 'update', oldValues: existing, newValues: goal, req });
  return goal;
}

async function deleteGoal(goalId, userId, req) {
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: 'draft', isLocked: false },
  });
  if (!existing) throw new AppError('Goal not found or cannot be deleted', 404);
  await prisma.goal.delete({ where: { id: goalId } });
  await logAudit({ userId, entityType: 'goal', entityId: goalId, action: 'delete', oldValues: existing, req });
}

async function submitGoalSheet(userId, cycleId, req) {
  const goals = await listGoals(userId, cycleId);
  const validation = validateGoalSheet(
    goals.map((g) => ({ title: g.title, weightage: Number(g.weightage) }))
  );
  if (!validation.valid) throw new AppError(validation.errors.join(' '), 400, validation.errors);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { manager: { select: { id: true, email: true } } },
  });

  await prisma.$transaction([
    prisma.goal.updateMany({
      where: { userId, cycleId, status: 'draft' },
      data: { status: 'submitted' },
    }),
    prisma.goalApproval.upsert({
      where: { userId_cycleId: { userId, cycleId } },
      create: { userId, cycleId, status: 'pending', reviewerId: user.managerId },
      update: { status: 'pending', submittedAt: new Date(), reviewerId: user.managerId },
    }),
  ]);

  const approval = await prisma.goalApproval.findUnique({
    where: { userId_cycleId: { userId, cycleId } },
    include: { cycle: { select: { name: true } } },
  });

  if (user.managerId) {
    await createNotification({
      userId: user.managerId,
      title: 'Goal sheet submitted',
      message: `${user.firstName} ${user.lastName} submitted goals for approval`,
      type: 'goal_approval',
      link: approval?.id
        ? `/manager/approvals?approvalId=${approval.id}`
        : '/manager/approvals',
    });

    notifyManagerApprovalPending({
      employeeName: `${user.firstName} ${user.lastName}`,
      employeeEmail: user.email,
      goalCount: goals.length,
      cycleName: approval?.cycle?.name,
      approvalId: approval?.id,
      submittedAt: approval?.submittedAt,
    }).catch((err) => console.error('[teams] approval alert:', err.message));
  }

  await logAudit({ userId, entityType: 'goal_approval', entityId: userId, action: 'submit', newValues: { cycleId, goalCount: goals.length }, req });
  return { message: 'Goal sheet submitted for approval', goalCount: goals.length, approvalId: approval?.id };
}

async function unlockGoal(goalId, adminId, req) {
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: { isLocked: false, status: 'approved', lockedAt: null, lockedById: null },
  });
  await logAudit({ userId: adminId, entityType: 'goal', entityId: goalId, action: 'unlock', req });
  return goal;
}

module.exports = { getActiveCycle, listGoals, createGoal, updateGoal, deleteGoal, submitGoalSheet, unlockGoal };
