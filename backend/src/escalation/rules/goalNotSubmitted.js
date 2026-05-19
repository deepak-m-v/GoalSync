const { RULE_CODES } = require('../constants');

const SUBMITTED_STATUSES = ['submitted', 'approved', 'locked'];

async function findViolations({ prisma, cycle, config }) {
  const employees = await prisma.user.findMany({
    where: { isActive: true, role: { name: 'employee' } },
    include: {
      manager: { select: { id: true, email: true, firstName: true, lastName: true } },
      goals: { where: { cycleId: cycle.id }, select: { id: true, status: true } },
      goalApprovals: { where: { cycleId: cycle.id }, select: { status: true, submittedAt: true } },
    },
  });

  const violations = [];

  for (const emp of employees) {
    const approval = emp.goalApprovals[0];
    const hasSubmittedGoals = emp.goals.some((g) => SUBMITTED_STATUSES.includes(g.status));
    const approvalSubmitted = approval?.status === 'pending' || approval?.status === 'approved';

    if (hasSubmittedGoals || approvalSubmitted) continue;

    const hasDraftOnly = emp.goals.length > 0 && !hasSubmittedGoals;
    violations.push({
      ruleCode: RULE_CODES.GOAL_NOT_SUBMITTED,
      userId: emp.id,
      employee: emp,
      manager: emp.manager,
      reason: hasDraftOnly
        ? 'Goals exist in draft but have not been submitted for approval'
        : 'No goals submitted for the active performance cycle',
      metadata: { goalCount: emp.goals.length },
    });
  }

  return violations;
}

module.exports = { findViolations };
