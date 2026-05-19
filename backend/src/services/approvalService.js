const prisma = require('../lib/prisma');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const AppError = require('../utils/AppError');

async function listPendingForManager(managerId) {
  return prisma.goalApproval.findMany({
    where: {
      status: 'pending',
      user: { managerId },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      cycle: true,
    },
    orderBy: { submittedAt: 'desc' },
  });
}

async function getApprovalWithGoals(approvalId, managerId) {
  const approval = await prisma.goalApproval.findUnique({
    where: { id: approvalId },
    include: {
      user: true,
      cycle: true,
    },
  });
  if (!approval || approval.user.managerId !== managerId) {
    throw new AppError('Approval not found or not authorized', 403);
  }
  const goals = await prisma.goal.findMany({
    where: { userId: approval.userId, cycleId: approval.cycleId },
  });
  return { approval, goals };
}

async function reviewApproval(approvalId, managerId, { status, comments }, req) {
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  const approval = await prisma.goalApproval.findUnique({
    where: { id: approvalId },
    include: { user: true },
  });
  if (!approval || approval.user.managerId !== managerId) {
    throw new AppError('Not authorized to review this approval', 403);
  }

  const goalStatus = status === 'approved' ? 'approved' : 'rejected';
  const lockGoals = status === 'approved';

  await prisma.$transaction([
    prisma.goalApproval.update({
      where: { id: approvalId },
      data: { status, comments, reviewerId: managerId, reviewedAt: new Date() },
    }),
    prisma.goal.updateMany({
      where: { userId: approval.userId, cycleId: approval.cycleId, status: 'submitted' },
      data: {
        status: goalStatus,
        isLocked: lockGoals,
        lockedAt: lockGoals ? new Date() : null,
        lockedById: lockGoals ? managerId : null,
      },
    }),
  ]);

  await createNotification({
    userId: approval.userId,
    title: `Goals ${status}`,
    message: comments || `Your goal sheet was ${status} by your manager.`,
    type: 'goal_approval',
    link: '/goals',
  });

  await logAudit({
    userId: managerId,
    entityType: 'goal_approval',
    entityId: approvalId,
    action: status === 'approved' ? 'approve' : 'reject',
    newValues: { status, comments },
    req,
  });

  return { message: `Goals ${status}` };
}

async function updateGoalInline(goalId, managerId, data, req) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { user: true },
  });
  if (!goal || goal.user.managerId !== managerId) {
    throw new AppError('Not authorized', 403);
  }
  if (goal.status !== 'submitted') {
    throw new AppError('Can only edit targets/weightage on submitted goals', 400);
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      target: data.target !== undefined ? data.target : undefined,
      weightage: data.weightage !== undefined ? data.weightage : undefined,
    },
  });
  await logAudit({ userId: managerId, entityType: 'goal', entityId: goalId, action: 'update', newValues: data, req });
  return updated;
}

module.exports = { listPendingForManager, getApprovalWithGoals, reviewApproval, updateGoalInline };
