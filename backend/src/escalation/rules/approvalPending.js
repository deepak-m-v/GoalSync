const { RULE_CODES } = require('../constants');

async function findViolations({ prisma, cycle, config }) {
  const thresholdDays = config.managerEscalationDays || 5;
  const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

  const pending = await prisma.goalApproval.findMany({
    where: {
      cycleId: cycle.id,
      status: 'pending',
      submittedAt: { lt: cutoff },
    },
    include: {
      user: {
        include: {
          manager: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  return pending.map((approval) => ({
    ruleCode: RULE_CODES.APPROVAL_PENDING,
    userId: approval.userId,
    employee: approval.user,
    manager: approval.user.manager,
    reason: `Goal approval pending for ${thresholdDays}+ days since submission`,
    metadata: {
      approvalId: approval.id,
      submittedAt: approval.submittedAt,
      managerId: approval.user.managerId,
    },
  }));
}

module.exports = { findViolations };
