const prisma = require('../lib/prisma');
const { logAudit } = require('./auditService');
const AppError = require('../utils/AppError');

async function createSharedGoal(creatorId, data, req) {
  const shared = await prisma.sharedGoal.create({
    data: {
      cycleId: data.cycleId,
      title: data.title,
      description: data.description,
      thrustArea: data.thrustArea,
      uomType: data.uomType,
      target: data.target,
      createdById: creatorId,
    },
  });
  await logAudit({ userId: creatorId, entityType: 'shared_goal', entityId: shared.id, action: 'create', newValues: shared, req });
  return shared;
}

async function listSharedGoals(cycleId) {
  return prisma.sharedGoal.findMany({
    where: { isActive: true, ...(cycleId && { cycleId }) },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function assignToUsers(sharedGoalId, assignerId, assignments, req) {
  const template = await prisma.sharedGoal.findUnique({ where: { id: sharedGoalId } });
  if (!template) throw new AppError('Shared goal not found', 404);

  const results = [];

  for (const { userId, weightage } of assignments) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        cycleId: template.cycleId,
        sharedGoalId: template.id,
        title: template.title,
        description: template.description,
        thrustArea: template.thrustArea,
        uomType: template.uomType,
        target: template.target,
        weightage,
        status: 'draft',
        isShared: true,
      },
    });

    const assignment = await prisma.sharedGoalAssignment.upsert({
      where: { sharedGoalId_userId: { sharedGoalId, userId } },
      create: { sharedGoalId, userId, weightage, assignedById: assignerId, goalId: goal.id },
      update: { weightage, goalId: goal.id },
    });
    results.push({ assignment, goal });
  }

  await logAudit({
    userId: assignerId,
    entityType: 'shared_goal',
    entityId: sharedGoalId,
    action: 'update',
    newValues: { assignments: assignments.length },
    req,
  });

  return results;
}

async function updateAssignmentWeightage(assignmentId, userId, weightage, req) {
  const assignment = await prisma.sharedGoalAssignment.findFirst({
    where: { id: assignmentId, userId },
    include: { goal: true },
  });
  if (!assignment) throw new AppError('Assignment not found', 404);

  await prisma.$transaction([
    prisma.sharedGoalAssignment.update({ where: { id: assignmentId }, data: { weightage } }),
    ...(assignment.goalId
      ? [prisma.goal.update({ where: { id: assignment.goalId }, data: { weightage } })]
      : []),
  ]);

  await logAudit({ userId, entityType: 'shared_goal_assignment', entityId: assignmentId, action: 'update', newValues: { weightage }, req });
  return { success: true };
}

module.exports = { createSharedGoal, listSharedGoals, assignToUsers, updateAssignmentWeightage };
