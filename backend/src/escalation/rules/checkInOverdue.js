const { RULE_CODES } = require('../constants');

function getCurrentQuarter() {
  const month = new Date().getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}

async function findViolations({ prisma, cycle, config }) {
  const quarter = getCurrentQuarter();
  const graceDays = config.checkInGraceDays || 14;
  const graceCutoff = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);

  const goals = await prisma.goal.findMany({
    where: {
      cycleId: cycle.id,
      status: { in: ['approved', 'locked'] },
      user: { isActive: true, role: { name: 'employee' } },
    },
    include: {
      user: {
        include: {
          manager: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      checkIns: { where: { quarter } },
    },
  });

  const byUser = new Map();

  for (const goal of goals) {
    const checkIn = goal.checkIns[0];
    const overdue =
      !checkIn ||
      (checkIn.progressStatus === 'not_started' && checkIn.updatedAt < graceCutoff);

    if (!overdue) continue;

    const existing = byUser.get(goal.userId);
    if (!existing) {
      byUser.set(goal.userId, {
        ruleCode: RULE_CODES.CHECK_IN_OVERDUE,
        userId: goal.userId,
        employee: goal.user,
        manager: goal.user.manager,
        reason: `Quarterly check-in (${quarter}) overdue or not started`,
        metadata: { quarter, overdueGoalIds: [goal.id] },
      });
    } else {
      existing.metadata.overdueGoalIds.push(goal.id);
    }
  }

  return [...byUser.values()];
}

module.exports = { findViolations, getCurrentQuarter };
